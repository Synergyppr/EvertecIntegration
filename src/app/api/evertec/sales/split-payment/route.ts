/**
 * POST /api/evertec/sales/split-payment
 * Executes a split payment across multiple sequential transactions
 *
 * This endpoint splits a total payment amount across multiple transactions
 * (e.g., partial payment with VISA, remaining with ATH Movil).
 * Each part is processed sequentially, with automatic status polling.
 *
 * Process flow:
 * 1. Validate split configuration (percentages must sum to 100%)
 * 2. Calculate amounts for each split part
 * 3. Execute first transaction using start-sale
 * 4. Poll transaction status until approved
 * 5. Execute second transaction (and so on)
 * 6. Return split transaction ID for status tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  buildBaseRequest,
  validateRequiredFields,
  validateTransactionAmounts,
  handleTerminalError,
  createApiDocumentation,
} from '@/app/lib/evertec-ecr-helpers';
import {
  validateSplitConfiguration,
  createInitialPartStatuses,
  generateSplitTransactionId,
  startSplitPartTransaction,
  pollTransactionStatus,
} from '@/app/lib/split-payment-helpers';
import { saveSplitPayment, updateSplitPayment } from '@/app/lib/split-payment-store';
import type {
  SplitPaymentRequest,
  SplitPaymentResponse,
  SplitPaymentPartStatus,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Build request payload with defaults
    const payload: SplitPaymentRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
      amounts: body.amounts,
      receipt_output: body.receipt_output || 'BOTH',
      manual_entry_indicator: body.manual_entry_indicator || 'no',
      force_duplicate: body.force_duplicate,
      session_id: body.session_id,
      splits: body.splits,
      polling_interval: body.polling_interval || 2000,
      max_polling_attempts: body.max_polling_attempts || 60,
    };

    // Validate required fields
    const validation = validateRequiredFields(payload, [
      'reference',
      'last_reference',
      'amounts',
      'session_id',
      'splits',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    // Validate amounts
    if (!payload.amounts.total) {
      return NextResponse.json(
        {
          error_code: 'MISSING_FIELD',
          error_message: 'amounts.total is required',
        },
        { status: 400 }
      );
    }

    // Validate tax compliance
    const taxValidation = validateTransactionAmounts(payload.amounts);
    if (!taxValidation.valid) {
      return taxValidation.error!;
    }

    // Validate split configuration
    const splitValidation = validateSplitConfiguration(payload.splits);
    if (!splitValidation.valid) {
      return NextResponse.json(
        {
          error_code: 'INVALID_SPLIT_CONFIG',
          error_message: splitValidation.error,
        },
        { status: 400 }
      );
    }

    // Ensure session_id is present (TypeScript safety)
    if (!payload.session_id) {
      return NextResponse.json(
        {
          error_code: 'MISSING_FIELD',
          error_message: 'session_id is required',
        },
        { status: 400 }
      );
    }

    // TypeScript now knows session_id is non-null
    const sessionId = payload.session_id;

    // Generate split transaction ID
    const split_trx_id = generateSplitTransactionId();

    // Create initial part statuses
    const parts = createInitialPartStatuses(payload.splits, payload.amounts);

    // Initialize split payment response
    const splitResponse: SplitPaymentResponse = {
      split_trx_id,
      status: 'processing',
      message: 'Starting split payment processing',
      parts,
      reference: payload.reference,
      total_amounts: payload.amounts,
    };

    // Save initial state
    saveSplitPayment(split_trx_id, splitResponse);

    // Process each part sequentially
    let lastReference = payload.last_reference;
    let currentReference = parseInt(payload.reference, 10);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const splitConfig = payload.splits[i];

      // Update part status to processing
      part.status = 'processing';
      part.message = `Processing payment ${i + 1} of ${parts.length}`;
      part.started_at = new Date().toISOString();
      splitResponse.message = `Processing part ${i + 1} of ${parts.length}`;
      updateSplitPayment(split_trx_id, splitResponse);

      // Start transaction for this part
      console.log(`[Split Payment ${split_trx_id}] Starting part ${i + 1}/${parts.length}:`, {
        payment_method: splitConfig.payment_method,
        reference: currentReference.toString(),
        last_reference: lastReference,
        amount: part.amounts.total,
      });

      const startResult = await startSplitPartTransaction(
        splitConfig,
        part.amounts,
        {
          terminal_id: payload.terminal_id,
          station_number: payload.station_number,
          cashier_id: payload.cashier_id,
          reference: currentReference.toString(),
          last_reference: lastReference,
          session_id: sessionId,
          receipt_email: payload.receipt_email,
          receipt_output: payload.receipt_output,
          manual_entry_indicator: payload.manual_entry_indicator,
          force_duplicate: payload.force_duplicate,
        }
      );

      if (!startResult.success) {
        // Transaction failed to start
        console.error(`[Split Payment ${split_trx_id}] Part ${i + 1} failed:`, startResult.error);
        part.status = 'error';
        part.error = startResult.error;
        part.completed_at = new Date().toISOString();
        splitResponse.status = 'failed';
        splitResponse.message = `Part ${i + 1} failed to start: ${startResult.error}`;
        updateSplitPayment(split_trx_id, splitResponse);

        return NextResponse.json(splitResponse, { status: 200 });
      }

      // Store transaction ID
      part.trx_id = startResult.trx_id;
      part.transaction = startResult.response;
      updateSplitPayment(split_trx_id, splitResponse);

      // Poll for transaction completion
      const pollResult = await pollTransactionStatus(
        startResult.trx_id!,
        sessionId,
        payload.terminal_id,
        payload.station_number,
        payload.cashier_id,
        payload.polling_interval,
        payload.max_polling_attempts
      );

      if (pollResult.status === 'approved') {
        // Transaction approved
        part.status = 'approved';
        part.message = 'Transaction approved';
        part.completed_at = new Date().toISOString();
        if (pollResult.response?.transaction) {
          part.transaction = pollResult.response.transaction;
        }
        updateSplitPayment(split_trx_id, splitResponse);

        // Update references for next transaction
        lastReference = currentReference.toString();
        currentReference++;
      } else {
        // Transaction failed or timed out
        part.status = pollResult.status === 'rejected' ? 'rejected' : 'error';
        part.error = pollResult.error || `Transaction ${pollResult.status}`;
        part.completed_at = new Date().toISOString();
        splitResponse.status = 'failed';
        splitResponse.message = `Part ${i + 1} ${pollResult.status}: ${pollResult.error}`;
        updateSplitPayment(split_trx_id, splitResponse);

        return NextResponse.json(splitResponse, { status: 200 });
      }
    }

    // All parts completed successfully
    splitResponse.status = 'completed';
    splitResponse.message = 'All split payments completed successfully';
    updateSplitPayment(split_trx_id, splitResponse);

    return NextResponse.json(splitResponse, { status: 200 });
  } catch (error) {
    return handleTerminalError(error);
  }
}

/**
 * GET /api/evertec/sales/split-payment
 * Returns API documentation
 */
export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/sales/split-payment',
    description:
      'Splits a payment across multiple sequential transactions with automatic status polling. Uses start-sale under the hood for each part.',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'amounts', 'session_id', 'splits'],
      properties: {
        terminal_id: {
          type: 'string',
          description: 'Terminal ID (defaults to env config)',
          example: '30DR3479',
        },
        station_number: {
          type: 'string',
          description: 'Station number (defaults to env config)',
          example: '1234',
        },
        cashier_id: {
          type: 'string',
          description: 'Cashier ID (defaults to env config)',
          example: '1234',
        },
        reference: {
          type: 'string',
          description: 'Starting transaction reference (will increment for each part)',
          example: '100',
          required: true,
        },
        last_reference: {
          type: 'string',
          description: 'Previous transaction reference',
          example: '99',
          required: true,
        },
        session_id: {
          type: 'string',
          description: 'Session ID from logon',
          example: 'Q9QS9-WDNEX-I9LC2-4UMHZ',
          required: true,
        },
        receipt_email: {
          type: 'string',
          enum: ['yes', 'no'],
          description: 'Send receipt via email',
          default: 'yes',
        },
        amounts: {
          type: 'object',
          required: ['total'],
          description: 'Total transaction amounts (will be split according to percentages)',
          properties: {
            total: {
              type: 'string',
              description: 'Total amount to split',
              example: '6.40',
              required: true,
            },
            base_state_tax: {
              type: 'string',
              description: 'Base amount subject to standard state tax',
              example: '5.74',
            },
            base_reduced_tax: {
              type: 'string',
              description: 'Base amount subject to reduced state tax',
              example: '0.00',
            },
            state_tax: {
              type: 'string',
              description: 'Calculated state tax',
              example: '0.60',
            },
            reduced_tax: {
              type: 'string',
              description: 'Calculated reduced tax',
              example: '0.00',
            },
            city_tax: {
              type: 'string',
              description: 'City tax amount',
              example: '0.06',
            },
          },
        },
        splits: {
          type: 'array',
          description: 'Array of split payment parts (percentages must sum to 100%)',
          required: true,
          items: {
            type: 'object',
            required: ['payment_method', 'percentage'],
            properties: {
              payment_method: {
                type: 'string',
                enum: ['card', 'ath-movil'],
                description: 'Payment method for this part',
                example: 'card',
                required: true,
              },
              percentage: {
                type: 'number',
                description: 'Percentage of total for this part (0-100)',
                example: 58.438,
                required: true,
              },
              label: {
                type: 'string',
                description: 'Label/description for this part',
                example: 'VISA Partial Payment',
              },
            },
          },
          example: [
            {
              payment_method: 'card',
              percentage: 58.438,
              label: 'VISA Partial Payment',
            },
            {
              payment_method: 'ath-movil',
              percentage: 31.25,
              label: 'ATH Movil Payment',
            },
            {
              payment_method: 'card',
              percentage: 10.312,
              label: 'Cash Payment',
            },
          ],
        },
        receipt_output: {
          type: 'string',
          enum: ['BOTH', 'HTML', 'PRINTER', 'NONE'],
          description: 'Receipt output destination',
          default: 'BOTH',
        },
        manual_entry_indicator: {
          type: 'string',
          enum: ['yes', 'no'],
          description: 'Allow manual card entry',
          default: 'no',
        },
        force_duplicate: {
          type: 'string',
          enum: ['yes', 'no'],
          description: 'Force duplicate transaction',
        },
        polling_interval: {
          type: 'number',
          description: 'Polling interval in milliseconds',
          default: 2000,
          example: 2000,
        },
        max_polling_attempts: {
          type: 'number',
          description: 'Maximum polling attempts before timeout',
          default: 60,
          example: 60,
        },
      },
    },
    responseBody: {
      success: {
        split_trx_id: 'SPT-1738195234567-ABC123',
        status: 'completed',
        message: 'All split payments completed successfully',
        parts: [
          {
            part_number: 1,
            payment_method: 'card',
            label: 'VISA Partial Payment',
            trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
            status: 'approved',
            message: 'Transaction approved',
            amounts: {
              total: '3.74',
              base_state_tax: '3.35',
              base_reduced_tax: '0.00',
              state_tax: '0.35',
              reduced_tax: '0.00',
              city_tax: '0.04',
            },
            started_at: '2025-01-29T10:00:00.000Z',
            completed_at: '2025-01-29T10:00:15.000Z',
          },
          {
            part_number: 2,
            payment_method: 'ath-movil',
            label: 'ATH Movil Payment',
            trx_id: '52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d',
            status: 'approved',
            message: 'Transaction approved',
            amounts: {
              total: '2.00',
              base_state_tax: '1.79',
              base_reduced_tax: '0.00',
              state_tax: '0.19',
              reduced_tax: '0.00',
              city_tax: '0.02',
            },
            started_at: '2025-01-29T10:00:16.000Z',
            completed_at: '2025-01-29T10:00:30.000Z',
          },
        ],
        reference: '100',
        total_amounts: {
          total: '6.40',
          base_state_tax: '5.74',
          base_reduced_tax: '0.00',
          state_tax: '0.60',
          reduced_tax: '0.00',
          city_tax: '0.06',
        },
      },
      processing: {
        split_trx_id: 'SPT-1738195234567-ABC123',
        status: 'processing',
        message: 'Processing part 2 of 3',
        parts: [
          {
            part_number: 1,
            payment_method: 'card',
            status: 'approved',
            message: 'Transaction approved',
          },
          {
            part_number: 2,
            payment_method: 'ath-movil',
            status: 'processing',
            message: 'Processing payment 2 of 3',
          },
          {
            part_number: 3,
            payment_method: 'card',
            status: 'pending',
          },
        ],
      },
      error: {
        error_code: 'INVALID_SPLIT_CONFIG',
        error_message: 'Split percentages must sum to 100%, got 95%',
      },
    },
    notes: [
      'Each split part is processed sequentially using start-sale (or start-ath-movil-sale)',
      'Transaction status is automatically polled until approved',
      'Once first part is approved, second part starts automatically',
      'Returns split_trx_id for tracking all parts via /api/evertec/transaction/split-payment-status',
      'Customer interaction required on terminal for each part',
      'Split percentages must sum to 100% (allows 0.01% rounding tolerance)',
      'Tax amounts are split proportionally based on percentages',
      'Reference numbers auto-increment for each part',
    ],
  });
}
