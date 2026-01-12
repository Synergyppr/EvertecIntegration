/**
 * POST /api/evertec/sales/start-sale
 * Initiates a standard card payment transaction
 *
 * The customer will be prompted to insert/swipe/tap their card on the terminal.
 * Different data may be requested based on the terminal's configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EVERTEC_ECR_ENDPOINTS } from '@/app/config/evertec-ecr';
import {
  buildBaseRequest,
  validateRequiredFields,
  validateTransactionAmounts,
  makeTerminalRequest,
  handleTerminalError,
  createApiDocumentation,
} from '@/app/lib/evertec-ecr-helpers';
import type {
  StartSaleRequest,
  TransactionResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Build request payload with defaults
    const payload: StartSaleRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
      process_cashback: body.process_cashback || 'no',
      amounts: body.amounts,
      receipt_output: body.receipt_output || 'BOTH',
      manual_entry_indicator: body.manual_entry_indicator || 'no',
      force_duplicate: body.force_duplicate,
      session_id: body.session_id,
    };

    // Validate required fields
    const validation = validateRequiredFields(payload, [
      'reference',
      'last_reference',
      'amounts',
      'session_id',
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

    // Validate Puerto Rico tax compliance
    const taxValidation = validateTransactionAmounts(payload.amounts);
    if (!taxValidation.valid) {
      return taxValidation.error!;
    }

    // Make request to terminal
    const { data, status } = await makeTerminalRequest<TransactionResponse>(
      EVERTEC_ECR_ENDPOINTS.START_SALE,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

/**
 * GET /api/evertec/sales/start-sale
 * Returns API documentation
 */
export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/sales/start-sale',
    description:
      'Initiates a standard card payment transaction. Customer will be prompted to present their card on the terminal.',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'amounts', 'session_id'],
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
          description: 'Transaction reference',
          example: '67',
          required: true,
        },
        last_reference: {
          type: 'string',
          description: 'Previous transaction reference',
          example: '66',
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
        process_cashback: {
          type: 'string',
          enum: ['yes', 'no'],
          description: 'Allow cashback processing',
          default: 'no',
        },
        amounts: {
          type: 'object',
          required: ['total'],
          properties: {
            total: {
              type: 'string',
              description: 'Total amount',
              example: '180.05',
              required: true,
            },
            base_state_tax: {
              type: 'string',
              description: 'Base amount subject to standard state tax rate (requires base_reduced_tax if provided)',
              example: '100.00',
            },
            base_reduced_tax: {
              type: 'string',
              description: 'Base amount subject to reduced state tax rate (required when base_state_tax is provided, use "0.00" if no reduced items)',
              example: '0.00',
            },
            tip: {
              type: 'string',
              description: 'Tip amount',
              example: '0.00',
            },
            state_tax: {
              type: 'string',
              description: 'Calculated state tax on base_state_tax (requires reduced_tax if provided)',
              example: '10.50',
            },
            reduced_tax: {
              type: 'string',
              description: 'Calculated reduced tax on base_reduced_tax (required when state_tax is provided, use "0.00" if no reduced items)',
              example: '0.00',
            },
            city_tax: {
              type: 'string',
              description: 'City tax amount',
              example: '1.50',
            },
          },
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
      },
    },
    responseBody: {
      success: {
        approval_code: 'ST',
        cashier_id: '1234',
        manual_entry_indicator: 'no',
        session_id: 'OFQRY-4IF8L-BL0RQ-Y6HFJ',
        process_cashback: 'no',
        reference: '67',
        trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
        station_number: '1234',
        amounts: {
          total: '180.05',
          base_state_tax: '100.00',
          base_reduced_tax: '0.00',
          tip: '0.00',
          state_tax: '10.50',
          reduced_tax: '0.00',
          city_tax: '1.50',
        },
        receipt_output: 'BOTH',
        last_reference: '66',
        response_message: 'SENDING TRANSACTION ID.',
        receipt_email: 'yes',
        terminal_id: '30DR3478',
      },
      error: {
        error_code: 'ERROR_CODE',
        error_message: 'Error description',
      },
    },
    notes: [
      'Returns a trx_id that should be used to poll transaction status',
      'Customer interaction required on terminal',
      'Use /api/evertec/transaction/get-status to check transaction result',
      'IMPORTANT TAX REQUIREMENT: When using tax fields, you MUST provide BOTH pairs:',
      '  - base_state_tax + state_tax (standard rate)',
      '  - base_reduced_tax + reduced_tax (reduced rate)',
      '  Even if you have no reduced tax items, set base_reduced_tax="0.00" and reduced_tax="0.00"',
      '  This is a terminal validation requirement for Puerto Rico tax compliance',
    ],
  });
}
