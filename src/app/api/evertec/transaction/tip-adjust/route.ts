/**
 * POST /api/evertec/transaction/tip-adjust
 * Adjusts tip on a completed transaction
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
  TipAdjustRequest,
  TipAdjustResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: TipAdjustRequest = {
      ...buildBaseRequest(body),
      target_reference: body.target_reference,
      tip: body.tip,
      session_id: body.session_id,
    };

    const required = ['reference', 'last_reference', 'session_id', 'target_reference', 'tip'];
    const validation = validateRequiredFields(payload, required);

    if (!validation.valid) {
      return validation.error!;
    }

    const { data, status } = await makeTerminalRequest<TipAdjustResponse>(
      EVERTEC_ECR_ENDPOINTS.TIP_ADJUST,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/transaction/tip-adjust',
    description: 'Adjusts tip on a completed transaction',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'session_id', 'target_reference', 'tip'],
      properties: {
        terminal_id: { type: 'string', example: '40000260', description: 'Terminal ID (optional, uses env default)' },
        station_number: { type: 'string', example: '1234', description: 'Station number (optional, uses env default)' },
        cashier_id: { type: 'string', example: '123', description: 'Cashier ID (optional, uses env default)' },
        reference: { type: 'string', example: '13', required: true, description: 'Current transaction reference' },
        last_reference: { type: 'string', example: '12', required: true, description: 'Previous transaction reference' },
        session_id: { type: 'string', example: 'KC0P6-UHTD9-4RP5L-S4O0R', required: true, description: 'Session ID from logon' },
        target_reference: { type: 'string', example: '4', required: true, description: 'Reference of transaction to adjust' },
        tip: { type: 'string', example: '5.00', required: true, description: 'New tip amount' },
      },
    },
    responseBody: {
      success: {
        reference: '13',
        last_reference: '12',
        target_reference: '4',
        tip: '5.00',
        approval_code: '00',
        response_message: 'APPROVED',
        terminal_id: '40000260',
        station_number: '1234',
        cashier_id: '123',
        session_id: 'KC0P6-UHTD9-4RP5L-S4O0R',
      },
    },
    notes: [
      'Adjusts tip on a completed transaction',
      'target_reference must be the reference of an existing approved transaction',
      'tip amount should be in decimal format (e.g., "5.00")',
    ],
  });
}
