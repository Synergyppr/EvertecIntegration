/**
 * POST /api/evertec/transaction/split-payment-status
 * Retrieves the status of a split payment transaction
 *
 * Use this endpoint to check the progress and status of all parts
 * within a split payment. Can be polled during processing to monitor
 * real-time progress.
 *
 * Returns:
 * - Overall split payment status (pending, processing, completed, failed)
 * - Status of each individual part
 * - Transaction details for completed parts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEvertecEcrConfig } from '@/app/config/evertec-ecr';
import {
  validateRequiredFields,
  handleTerminalError,
  createApiDocumentation,
} from '@/app/lib/evertec-ecr-helpers';
import { getSplitPayment } from '@/app/lib/split-payment-store';
import type {
  GetSplitPaymentStatusRequest,
  GetSplitPaymentStatusResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = getEvertecEcrConfig();

    const payload: GetSplitPaymentStatusRequest = {
      split_trx_id: body.split_trx_id,
      session_id: body.session_id,
      terminal_id: body.terminal_id || config.terminalId,
      station_number: body.station_number || config.stationNumber,
      cashier_id: body.cashier_id || config.cashierId,
    };

    // Validate required fields
    const validation = validateRequiredFields(payload, [
      'split_trx_id',
      'session_id',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    // Retrieve split payment from store
    const splitPayment = getSplitPayment(payload.split_trx_id);

    if (!splitPayment) {
      return NextResponse.json(
        {
          error_code: 'NOT_FOUND',
          error_message: `Split payment with ID ${payload.split_trx_id} not found. It may have expired or never existed.`,
        },
        { status: 404 }
      );
    }

    // Return split payment status
    const response: GetSplitPaymentStatusResponse = splitPayment;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleTerminalError(error);
  }
}

/**
 * GET /api/evertec/transaction/split-payment-status
 * Returns API documentation
 */
export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/transaction/split-payment-status',
    description:
      'Retrieves the status of a split payment transaction, including status of all individual parts. Can be polled during processing.',
    requestBody: {
      type: 'object',
      required: ['split_trx_id', 'session_id'],
      properties: {
        split_trx_id: {
          type: 'string',
          description: 'Split transaction ID from split-payment endpoint',
          example: 'SPT-1738195234567-ABC123',
          required: true,
        },
        session_id: {
          type: 'string',
          description: 'Session ID from logon',
          example: 'Q9QS9-WDNEX-I9LC2-4UMHZ',
          required: true,
        },
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
      },
    },
    responseBody: {
      completed: {
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
            transaction: {
              approval_code: '00',
              reference: '100',
              response_message: 'APPROVED',
              trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
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
            transaction: {
              approval_code: '00',
              reference: '101',
              response_message: 'APPROVED',
              trx_id: '52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d',
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
            label: 'VISA Partial Payment',
            trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
            status: 'approved',
            message: 'Transaction approved',
            amounts: {
              total: '3.74',
            },
            started_at: '2025-01-29T10:00:00.000Z',
            completed_at: '2025-01-29T10:00:15.000Z',
          },
          {
            part_number: 2,
            payment_method: 'ath-movil',
            label: 'ATH Movil Payment',
            trx_id: '52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d',
            status: 'processing',
            message: 'Processing payment 2 of 3',
            amounts: {
              total: '2.00',
            },
            started_at: '2025-01-29T10:00:16.000Z',
          },
          {
            part_number: 3,
            payment_method: 'card',
            label: 'Cash Payment',
            status: 'pending',
            amounts: {
              total: '0.66',
            },
          },
        ],
        reference: '100',
        total_amounts: {
          total: '6.40',
        },
      },
      failed: {
        split_trx_id: 'SPT-1738195234567-ABC123',
        status: 'failed',
        message: 'Part 2 rejected: Insufficient funds',
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
            status: 'rejected',
            error: 'Insufficient funds',
          },
        ],
        reference: '100',
      },
      not_found: {
        error_code: 'NOT_FOUND',
        error_message:
          'Split payment with ID SPT-XXX not found. It may have expired or never existed.',
      },
    },
    notes: [
      'Poll this endpoint to track split payment progress in real-time',
      'Status can be: pending, processing, completed, or failed',
      'Each part has its own status: pending, processing, approved, rejected, or error',
      'Includes transaction details for completed parts',
      'Split payment records are kept for 24 hours',
      'Use the split_trx_id returned from /api/evertec/sales/split-payment',
    ],
  });
}
