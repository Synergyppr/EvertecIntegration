/**
 * Evertec ECR Helper Utilities
 * Reusable functions for Evertec ECR API endpoints
 */

import { NextResponse } from 'next/server';
import {
  getEvertecEcrConfig,
  buildEndpointUrl,
  getDefaultHeaders,
} from '@/app/config/evertec-ecr';
import type {
  BaseRequest,
  EvertecEcrError,
  TransactionAmounts,
} from '@/app/types/evertec-ecr';

/**
 * Validates and enriches base request with defaults from config
 *
 * Note: last_reference can be explicitly set to "" per Evertec docs
 * for first transaction or when no server response
 */
export function buildBaseRequest<T extends Partial<BaseRequest>>(
  body: T
): T & BaseRequest {
  const config = getEvertecEcrConfig();

  return {
    ...body,
    terminal_id: body.terminal_id || config.terminalId,
    station_number: body.station_number || config.stationNumber,
    cashier_id: body.cashier_id || config.cashierId,
    // Allow explicit empty string for reference and last_reference
    reference: body.reference !== undefined ? body.reference : '',
    last_reference: body.last_reference !== undefined ? body.last_reference : '',
  } as T & BaseRequest;
}

/**
 * Validates required fields in a request
 *
 * Special handling for last_reference:
 * - Empty string ("") is allowed per Evertec documentation
 * - Use empty string for first transaction or when no response from server
 */
export function validateRequiredFields(
  payload: Record<string, unknown> | unknown,
  requiredFields: string[]
): { valid: boolean; error?: NextResponse } {
  const payloadObj = payload as Record<string, unknown>;

  for (const field of requiredFields) {
    // Special case: last_reference can be empty string per Evertec docs
    if (field === 'last_reference') {
      // Only check if field exists (undefined/null), allow empty string
      if (payloadObj[field] === undefined || payloadObj[field] === null) {
        return {
          valid: false,
          error: NextResponse.json(
            {
              error_code: 'MISSING_FIELD',
              error_message: `${field} is required (use "" for first transaction or no server response)`,
            } as EvertecEcrError,
            { status: 400 }
          ),
        };
      }
      continue;
    }

    // Regular validation for other fields
    if (!payloadObj[field]) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'MISSING_FIELD',
            error_message: `${field} is required`,
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Makes a request to the terminal
 */
export async function makeTerminalRequest<TResponse>(
  endpoint: string,
  payload: unknown
): Promise<{ data: TResponse | EvertecEcrError; status: number }> {
  const config = getEvertecEcrConfig();

  try {
    const response = await fetch(buildEndpointUrl(endpoint), {
      method: 'POST',
      headers: getDefaultHeaders(config.apiKey),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeout || 30000),
    });

    const data = await response.json();

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        data: {
          error_code: 'TIMEOUT',
          error_message: 'Terminal request timeout',
        } as EvertecEcrError,
        status: 504,
      };
    }

    throw error;
  }
}

/**
 * Handles errors from terminal requests
 */
export function handleTerminalError(error: unknown): NextResponse {
  console.error('Terminal request error:', error);

  return NextResponse.json(
    {
      error_code: 'INTERNAL_ERROR',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    } as EvertecEcrError,
    { status: 500 }
  );
}

/**
 * Validates Puerto Rico tax compliance for transaction amounts
 *
 * IMPORTANT: Puerto Rico tax law requires paired tax fields:
 * - If base_state_tax is provided, base_reduced_tax MUST also be provided
 * - If state_tax is provided, reduced_tax MUST also be provided
 * - Even if no reduced tax items exist, use "0.00" for both fields
 *
 * This validation prevents terminal rejection error code ZY:
 * "AMOUNT FOR STATE REDUCED TAX NEEDED"
 *
 * @param amounts - Transaction amounts object to validate
 * @returns Validation result with error response if invalid
 */
export function validateTransactionAmounts(
  amounts: TransactionAmounts
): { valid: boolean; error?: NextResponse } {
  // Check if any tax fields are provided
  const hasBaseStateTax = amounts.base_state_tax !== undefined;
  const hasBaseReducedTax = amounts.base_reduced_tax !== undefined;
  const hasStateTax = amounts.state_tax !== undefined;
  const hasReducedTax = amounts.reduced_tax !== undefined;

  // If any tax field is provided, all four must be provided
  const hasSomeTaxFields =
    hasBaseStateTax || hasBaseReducedTax || hasStateTax || hasReducedTax;

  if (hasSomeTaxFields) {
    // Validate all required tax fields are present
    if (!hasBaseStateTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: base_state_tax is required when using tax fields. Set to "0.00" if no standard tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    if (!hasBaseReducedTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: base_reduced_tax is required when using tax fields. Set to "0.00" if no reduced tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    if (!hasStateTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: state_tax is required when using tax fields. Set to "0.00" if no standard tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    if (!hasReducedTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: reduced_tax is required when using tax fields. Set to "0.00" if no reduced tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    // Validate that tax fields are valid numeric strings
    const taxFields = [
      amounts.base_state_tax,
      amounts.base_reduced_tax,
      amounts.state_tax,
      amounts.reduced_tax,
    ];

    for (const field of taxFields) {
      if (field && isNaN(parseFloat(field))) {
        return {
          valid: false,
          error: NextResponse.json(
            {
              error_code: 'TAX_VALIDATION_ERROR',
              error_message: `Tax field value "${field}" is not a valid numeric string`,
            } as EvertecEcrError,
            { status: 400 }
          ),
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Creates a standardized API documentation response
 */
export function createApiDocumentation(config: {
  endpoint: string;
  description: string;
  requestBody: Record<string, unknown>;
  responseBody: Record<string, unknown>;
  notes?: string[];
}) {
  return NextResponse.json({
    endpoint: config.endpoint,
    method: 'POST',
    description: config.description,
    documentation: 'ECR API Documentation 01.02.07',
    requestBody: config.requestBody,
    responseBody: config.responseBody,
    notes: config.notes || [],
  });
}

/**
 * Validates tip adjustment limits before sending to terminal
 *
 * Checks local transaction records to prevent exceeding terminal limits
 * (typically 1-2 tip adjustments per transaction)
 */
export async function validateTipAdjustmentLimit(
  terminal_id: string,
  target_reference: string
): Promise<{ valid: boolean; error?: NextResponse }> {
  const { canAdjustTip } = await import('./transaction-store');

  const result = canAdjustTip(terminal_id, target_reference);

  if (!result.can_adjust) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error_code: 'TIP_ADJUSTMENT_LIMIT_EXCEEDED',
          error_message: result.reason || 'Cannot adjust tip for this transaction',
          details: `Target: ${target_reference}, Adjustments: ${result.current_count}/${result.max_count}`,
          suggestions: [
            'Transaction has been tip-adjusted the maximum number of times',
            'To change the tip further, you must void this transaction and create a new one',
            'Use /api/evertec/transaction/void to void the transaction',
          ],
        } as EvertecEcrError & { suggestions: string[] },
        { status: 400 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Enhanced error handling for tip adjust responses
 *
 * Provides user-friendly error messages and actionable suggestions
 */
export function handleTipAdjustError(
  response: Record<string, unknown>
): NextResponse {
  const responseMessage = String(response.response_message || '');
  const approvalCode = String(response.approval_code || '');

  // Handle specific error: EXCEEDS TIP ADJUSTS
  if (responseMessage === 'EXCEEDS TIP ADJUSTS.') {
    return NextResponse.json(
      {
        ...response,
        error_code: 'TERMINAL_TIP_ADJUSTMENT_LIMIT',
        error_message: 'Terminal reports: Transaction has been tip-adjusted the maximum number of times',
        user_message:
          'This transaction cannot be tip-adjusted again. The terminal has reached its adjustment limit for this transaction.',
        suggestions: [
          'Void this transaction using /api/evertec/transaction/void',
          'Create a new transaction with the correct tip amount',
          'Contact support if you need to increase the tip adjustment limit',
        ],
        can_retry: false,
        suggested_action: 'void_and_redo',
      },
      { status: 200 }
    );
  }

  // Handle other tip-related errors
  if (responseMessage === 'TIP ADJUST NOT ALLOWED.') {
    return NextResponse.json(
      {
        ...response,
        error_code: 'TIP_ADJUST_NOT_ALLOWED',
        error_message: 'Tip adjustment is not allowed for this transaction type',
        user_message: 'This transaction does not support tip adjustments.',
        suggestions: [
          'Verify that the transaction is a card payment (not cash or EBT)',
          'Check that the transaction was approved',
          'Some card types may not support tip adjustments',
        ],
        can_retry: false,
      },
      { status: 200 }
    );
  }

  if (responseMessage === 'TOO MUCH TIP.') {
    return NextResponse.json(
      {
        ...response,
        error_code: 'TIP_AMOUNT_TOO_HIGH',
        error_message: 'Tip amount exceeds the maximum allowed percentage',
        user_message: 'The tip amount is too high for this transaction.',
        suggestions: [
          'Reduce the tip amount (typically max 25-50% of subtotal)',
          'Check terminal configuration for tip limits',
        ],
        can_retry: true,
      },
      { status: 200 }
    );
  }

  if (responseMessage === 'INVALID TIP.') {
    return NextResponse.json(
      {
        ...response,
        error_code: 'INVALID_TIP_VALUE',
        error_message: 'Tip value is invalid or improperly formatted',
        user_message: 'The tip amount format is invalid.',
        suggestions: [
          'Ensure tip is a valid decimal number (e.g., "5.00")',
          'Tip amount must be greater than or equal to 0.00',
        ],
        can_retry: true,
      },
      { status: 200 }
    );
  }

  // Return response as-is if not a specific error
  if (approvalCode === '00') {
    return NextResponse.json(response, { status: 200 });
  }

  // Generic error response
  return NextResponse.json(
    {
      ...response,
      error_code: 'TIP_ADJUST_FAILED',
      error_message: responseMessage || 'Tip adjustment failed',
      user_message: 'Unable to adjust tip for this transaction.',
    },
    { status: 200 }
  );
}
