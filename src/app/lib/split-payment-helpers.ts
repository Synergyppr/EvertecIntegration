/**
 * Split Payment Helper Utilities
 * Business logic for handling split payments with sequential transaction processing
 */

import type {
  TransactionAmounts,
  SplitPaymentPart,
  SplitPaymentPartStatus,
  StartSaleRequest,
  StartAthMovilSaleRequest,
  GetTransactionStatusRequest,
  GetTransactionStatusResponse,
  TransactionResponse,
} from '@/app/types/evertec-ecr';
import { EVERTEC_ECR_ENDPOINTS } from '@/app/config/evertec-ecr';
import { makeTerminalRequest } from './evertec-ecr-helpers';

/**
 * Calculates split amounts based on percentage allocation
 * Maintains Puerto Rico tax compliance (paired tax fields)
 */
export function calculateSplitAmounts(
  totalAmounts: TransactionAmounts,
  percentage: number
): TransactionAmounts {
  const factor = percentage / 100;

  const splitAmounts: TransactionAmounts = {
    total: (parseFloat(totalAmounts.total) * factor).toFixed(2),
  };

  // Split optional fields proportionally
  if (totalAmounts.base_state_tax) {
    splitAmounts.base_state_tax = (
      parseFloat(totalAmounts.base_state_tax) * factor
    ).toFixed(2);
  }

  if (totalAmounts.base_reduced_tax) {
    splitAmounts.base_reduced_tax = (
      parseFloat(totalAmounts.base_reduced_tax) * factor
    ).toFixed(2);
  }

  if (totalAmounts.tip) {
    splitAmounts.tip = (parseFloat(totalAmounts.tip) * factor).toFixed(2);
  }

  if (totalAmounts.state_tax) {
    splitAmounts.state_tax = (
      parseFloat(totalAmounts.state_tax) * factor
    ).toFixed(2);
  }

  if (totalAmounts.reduced_tax) {
    splitAmounts.reduced_tax = (
      parseFloat(totalAmounts.reduced_tax) * factor
    ).toFixed(2);
  }

  if (totalAmounts.city_tax) {
    splitAmounts.city_tax = (
      parseFloat(totalAmounts.city_tax) * factor
    ).toFixed(2);
  }

  if (totalAmounts.cashback) {
    splitAmounts.cashback = (
      parseFloat(totalAmounts.cashback) * factor
    ).toFixed(2);
  }

  return splitAmounts;
}

/**
 * Validates split payment configuration
 */
export function validateSplitConfiguration(
  splits: SplitPaymentPart[]
): { valid: boolean; error?: string } {
  if (!splits || splits.length === 0) {
    return { valid: false, error: 'At least one split part is required' };
  }

  if (splits.length > 10) {
    return { valid: false, error: 'Maximum 10 split parts allowed' };
  }

  // Calculate total percentage
  const totalPercentage = splits.reduce(
    (sum, split) => sum + split.percentage,
    0
  );

  // Allow small rounding differences (within 0.01%)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return {
      valid: false,
      error: `Split percentages must sum to 100%, got ${totalPercentage}%`,
    };
  }

  // Validate individual percentages
  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];

    if (split.percentage <= 0 || split.percentage > 100) {
      return {
        valid: false,
        error: `Split part ${i + 1}: percentage must be between 0 and 100`,
      };
    }

    if (!['card', 'ath-movil'].includes(split.payment_method)) {
      return {
        valid: false,
        error: `Split part ${i + 1}: payment_method must be 'card' or 'ath-movil'`,
      };
    }
  }

  return { valid: true };
}

/**
 * Initiates a transaction for a split part
 */
export async function startSplitPartTransaction(
  part: SplitPaymentPart,
  amounts: TransactionAmounts,
  baseRequest: {
    terminal_id: string;
    station_number: string;
    cashier_id: string;
    reference: string;
    last_reference: string;
    session_id: string;
    receipt_email: 'yes' | 'no';
    receipt_output: 'BOTH' | 'HTML' | 'PRINTER' | 'NONE' | 'both';
    manual_entry_indicator: 'yes' | 'no';
    force_duplicate?: 'yes' | 'no';
  }
): Promise<{
  success: boolean;
  trx_id?: string;
  response?: TransactionResponse;
  error?: string;
}> {
  try {
    const endpoint =
      part.payment_method === 'ath-movil'
        ? EVERTEC_ECR_ENDPOINTS.START_ATH_MOVIL_SALE
        : EVERTEC_ECR_ENDPOINTS.START_SALE;

    const payload:
      | StartSaleRequest
      | StartAthMovilSaleRequest = {
      ...baseRequest,
      amounts,
      process_cashback: 'no',
    };

    const { data, status } = await makeTerminalRequest<TransactionResponse>(
      endpoint,
      payload
    );

    if (status !== 200 || !('trx_id' in data)) {
      // Extract detailed error information
      let errorDetails = 'Transaction failed';

      if ('error_message' in data) {
        errorDetails = data.error_message as string;
      } else if ('error_code' in data) {
        errorDetails = `Error ${data.error_code}: ${(data as any).error_message || 'Unknown error'}`;
      } else if ('response_message' in data) {
        errorDetails = `${data.response_message} (Status: ${status})`;
      } else {
        errorDetails = `Transaction failed (HTTP ${status}): ${JSON.stringify(data).substring(0, 200)}`;
      }

      return {
        success: false,
        error: errorDetails,
      };
    }

    return {
      success: true,
      trx_id: data.trx_id,
      response: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Polls transaction status until completion or timeout
 */
export async function pollTransactionStatus(
  trx_id: string,
  session_id: string,
  terminal_id: string,
  station_number: string,
  cashier_id: string,
  pollingInterval: number = 2000,
  maxAttempts: number = 60
): Promise<{
  status: 'approved' | 'rejected' | 'timeout' | 'error';
  response?: GetTransactionStatusResponse;
  error?: string;
}> {
  const statusRequest: GetTransactionStatusRequest = {
    session_id,
    terminal_id,
    station_number,
    cashier_id,
    trx_id,
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data, status: httpStatus } =
        await makeTerminalRequest<GetTransactionStatusResponse>(
          EVERTEC_ECR_ENDPOINTS.GET_TRANSACTION_STATUS,
          statusRequest
        );

      if (httpStatus !== 200) {
        return {
          status: 'error',
          error: 'error_message' in data ? data.error_message : 'Status check failed',
        };
      }

      const statusData = data as GetTransactionStatusResponse;

      // ECR returns different formats, handle both
      // Format 1: Has explicit status field (PENDING, APPROVED, REJECTED, ERROR)
      if (statusData.status) {
        if (statusData.status === 'APPROVED') {
          return { status: 'approved', response: statusData };
        }

        if (statusData.status === 'REJECTED' || statusData.status === 'ERROR') {
          return {
            status: 'rejected',
            response: statusData,
            error: statusData.error || statusData.message,
          };
        }

        if (statusData.status === 'PENDING') {
          await new Promise((resolve) => setTimeout(resolve, pollingInterval));
          continue;
        }
      }

      // Format 2: Direct fields with approval_code (actual ECR response)
      const responseData = statusData as any;
      if ('approval_code' in responseData) {
        const approvalCode = responseData.approval_code;

        // Success codes: '00', '85', etc.
        if (approvalCode === '00' || approvalCode === '85') {
          console.log(`Transaction approved with code: ${approvalCode}`);
          return {
            status: 'approved',
            response: statusData,
          };
        }

        // Still processing: 'ST' = SENDING TRANSACTION ID
        if (approvalCode === 'ST') {
          console.log(`Transaction still processing (code: ST), polling again...`);
          await new Promise((resolve) => setTimeout(resolve, pollingInterval));
          continue;
        }

        // Any other approval code means rejection or error
        console.log(`Transaction rejected with code: ${approvalCode}`);
        return {
          status: 'rejected',
          response: statusData,
          error: responseData.response_message || `Transaction declined (Code: ${approvalCode})`,
        };
      }

      // Format 3: Has nested transaction object with approval_code
      if ('transaction' in statusData && statusData.transaction) {
        const txn = statusData.transaction as any;
        const approvalCode = txn.approval_code;

        // Success codes: '00', '85', etc.
        if (approvalCode === '00' || approvalCode === '85') {
          console.log(`Transaction approved (nested) with code: ${approvalCode}`);
          return {
            status: 'approved',
            response: statusData,
          };
        }

        // Still processing: 'ST' = SENDING TRANSACTION ID
        if (approvalCode === 'ST') {
          console.log(`Transaction still processing (nested, code: ST), polling again...`);
          await new Promise((resolve) => setTimeout(resolve, pollingInterval));
          continue;
        }

        // Any other approval code means rejection or error
        console.log(`Transaction rejected (nested) with code: ${approvalCode}`);
        return {
          status: 'rejected',
          response: statusData,
          error: txn.response_message || `Transaction declined (Code: ${approvalCode})`,
        };
      }

      // Format 4: Error response
      if ('error_code' in statusData || 'error_message' in statusData) {
        console.log(`Transaction error response received`);
        return {
          status: 'rejected',
          response: statusData,
          error: (statusData as any).error_message || 'Transaction failed',
        };
      }

      // Still processing - no clear status yet
      console.log(`[Polling attempt ${attempt + 1}/${maxAttempts}] Status unclear, continuing...`);
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Polling failed',
      };
    }
  }

  // Timeout reached
  return {
    status: 'timeout',
    error: `Transaction status polling timed out after ${maxAttempts} attempts`,
  };
}

/**
 * Generates a unique split transaction ID
 */
export function generateSplitTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `SPT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Creates initial split payment part statuses
 */
export function createInitialPartStatuses(
  splits: SplitPaymentPart[],
  totalAmounts: TransactionAmounts
): SplitPaymentPartStatus[] {
  return splits.map((split, index) => ({
    part_number: index + 1,
    payment_method: split.payment_method,
    label: split.label || `Payment ${index + 1} (${split.percentage}%)`,
    status: 'pending',
    amounts: calculateSplitAmounts(totalAmounts, split.percentage),
  }));
}
