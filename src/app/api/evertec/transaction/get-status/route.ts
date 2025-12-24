/**
 * POST /api/evertec/transaction/get-status
 * Polls the status of a transaction using its transaction ID
 *
 * Use this endpoint to check if a transaction has been completed,
 * approved, or rejected after initiating it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { EVERTEC_ECR_ENDPOINTS, getEvertecEcrConfig } from '@/app/config/evertec-ecr';
import {
  validateRequiredFields,
  makeTerminalRequest,
  handleTerminalError,
  createApiDocumentation,
} from '@/app/lib/evertec-ecr-helpers';
import type {
  GetTransactionStatusRequest,
  GetTransactionStatusResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = getEvertecEcrConfig();

    const payload: GetTransactionStatusRequest = {
      session_id: body.session_id,
      terminal_id: body.terminal_id || config.terminalId,
      station_number: body.station_number || config.stationNumber,
      cashier_id: body.cashier_id || config.cashierId,
      trx_id: body.trx_id,
    };

    const validation = validateRequiredFields(payload, [
      'session_id',
      'trx_id',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    const { data, status } =
      await makeTerminalRequest<GetTransactionStatusResponse>(
        EVERTEC_ECR_ENDPOINTS.GET_TRANSACTION_STATUS,
        payload
      );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/transaction/get-status',
    description:
      'Polls the status of a transaction using its transaction ID. Use after initiating a transaction to check completion status.',
    requestBody: {
      type: 'object',
      required: ['session_id', 'trx_id'],
      properties: {
        session_id: {
          type: 'string',
          description: 'Session ID from logon',
          example: 'GRR3V-9J79T-ZORYE-QG2EL',
          required: true,
        },
        trx_id: {
          type: 'string',
          description: 'Transaction ID from transaction initiation',
          example: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
          required: true,
        },
        terminal_id: {
          type: 'string',
          description: 'Terminal ID (defaults to env config)',
          example: '30DR3478',
        },
        station_number: {
          type: 'string',
          description: 'Station number (defaults to env config)',
          example: '12345',
        },
        cashier_id: {
          type: 'string',
          description: 'Cashier ID (defaults to env config)',
          example: '12345',
        },
      },
    },
    responseBody: {
      pending: {
        trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
        status: 'PENDING',
        message: 'Transaction in progress',
      },
      approved: {
        trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
        status: 'APPROVED',
        message: 'Transaction approved',
        transaction: {
          approval_code: '00',
          reference: '67',
          response_message: 'APPROVED',
        },
      },
      rejected: {
        trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
        status: 'REJECTED',
        message: 'Transaction declined',
        error: 'DECLINED',
      },
    },
    notes: [
      'Poll this endpoint at regular intervals (e.g., every 2 seconds)',
      'Status can be: PENDING, APPROVED, REJECTED, or ERROR',
      'Transaction details included when status is APPROVED',
    ],
  });
}
