/**
 * POST /api/evertec/device/get-status
 * Checks terminal health and status
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
  GetStatusRequest,
  TransactionResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: GetStatusRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
      
      receipt_output: body.receipt_output || 'BOTH',
      manual_entry_indicator: body.manual_entry_indicator || 'no',
      session_id: body.session_id,
      ...body,
    };

    const required = ['reference', 'last_reference', 'session_id'];
    const validation = validateRequiredFields(payload, required);

    if (!validation.valid) {
      return validation.error!;
    }

    

    const { data, status } = await makeTerminalRequest<TransactionResponse>(
      EVERTEC_ECR_ENDPOINTS.GET_STATUS,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/device/get-status',
    description: 'Checks terminal health and status',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'session_id'],
      properties: {
        reference: { type: 'string', example: '100', required: true },
        last_reference: { type: 'string', example: '99', required: true },
        session_id: { type: 'string', example: 'SESSION-ID-HERE', required: true },
        receipt_email: { type: 'string', enum: ['yes', 'no'], default: 'yes' },
        
        receipt_output: { type: 'string', enum: ['BOTH', 'HTML', 'PRINTER', 'NONE'], default: 'BOTH' },
        manual_entry_indicator: { type: 'string', enum: ['yes', 'no'], default: 'no' },
      },
    },
    responseBody: {
      success: {
        reference: '100',
        approval_code: '00',
        response_message: 'APPROVED',
        terminal_id: '30DR3478',
      },
    },
    notes: ['Checks terminal health and status'],
  });
}
