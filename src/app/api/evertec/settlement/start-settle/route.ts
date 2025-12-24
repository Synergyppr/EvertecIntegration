/**
 * POST /api/evertec/settlement/start-settle
 * Closes the batch and settles all transactions
 *
 * This process sends all approved transactions to the processor for settlement.
 * No customer interaction required. Typically performed at end of business day.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EVERTEC_ECR_ENDPOINTS } from '@/app/config/evertec-ecr';
import {
  buildBaseRequest,
  validateRequiredFields,
  makeTerminalRequest,
  handleTerminalError,
  createApiDocumentation,
} from '@/app/lib/evertec-ecr-helpers';
import type {
  StartSettleRequest,
  StartSettleResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: StartSettleRequest = {
      ...buildBaseRequest(body),
      receipt_output: body.receipt_output || 'BOTH',
      session_id: body.session_id,
    };

    const validation = validateRequiredFields(payload, [
      'reference',
      'last_reference',
      'session_id',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    const { data, status } = await makeTerminalRequest<StartSettleResponse>(
      EVERTEC_ECR_ENDPOINTS.START_SETTLE,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/settlement/start-settle',
    description:
      'Closes the batch and settles all approved transactions. Typically performed at end of business day. No customer interaction required.',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'session_id'],
      properties: {
        terminal_id: {
          type: 'string',
          description: 'Terminal ID (defaults to env config)',
          example: '30DR3478',
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
          example: '13',
          required: true,
        },
        last_reference: {
          type: 'string',
          description: 'Previous transaction reference',
          example: '12',
          required: true,
        },
        session_id: {
          type: 'string',
          description: 'Session ID from logon',
          example: 'KHVTN-7WMQN-TZ3J0-SRH6Z',
          required: true,
        },
        receipt_output: {
          type: 'string',
          enum: ['BOTH', 'HTML', 'PRINTER', 'NONE'],
          description: 'Receipt output destination',
          default: 'BOTH',
        },
      },
    },
    responseBody: {
      success: {
        reference: '13',
        approval_code: '00',
        response_message: 'SETTLEMENT APPROVED',
        terminal_id: '30DR3478',
        session_id: 'KHVTN-7WMQN-TZ3J0-SRH6Z',
        receipt_output: 'BOTH',
      },
      error: {
        error_code: 'ERROR_CODE',
        error_message: 'Error description',
      },
    },
    notes: [
      'Should be performed at end of business day',
      'All approved transactions will be sent for settlement',
      'Voided transactions will not be included',
      'Terminal will print settlement report',
      'After settlement, a new batch begins',
    ],
  });
}
