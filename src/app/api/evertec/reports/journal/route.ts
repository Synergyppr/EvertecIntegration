/**
 * POST /api/evertec/reports/journal
 * Retrieves transaction records
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
  JournalRequest,
  JournalResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: JournalRequest = {
      ...buildBaseRequest(body),
      target_reference: body.target_reference || 'all',
      session_id: body.session_id,
    };

    const required = ['reference', 'last_reference', 'session_id'];
    const validation = validateRequiredFields(payload, required);

    if (!validation.valid) {
      return validation.error!;
    }

    const { data, status } = await makeTerminalRequest<JournalResponse>(
      EVERTEC_ECR_ENDPOINTS.JOURNAL,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/reports/journal',
    description: 'Retrieves transaction records',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'session_id'],
      properties: {
        reference: { type: 'string', example: '100', required: true },
        last_reference: { type: 'string', example: '99', required: true },
        session_id: { type: 'string', example: 'SESSION-ID-HERE', required: true },
        target_reference: { type: 'string', example: 'all', description: 'Target reference number or "all" for all transactions', default: 'all' },
      },
    },
    responseBody: {
      success: {
        reference: '100',
        approval_code: '00',
        response_message: 'APPROVED',
        terminal_id: '40000260',
        session_id: 'SESSION-ID-HERE',
        target_reference: 'all',
      },
    },
    notes: [
      'Retrieves transaction journal records',
      'Set target_reference to a specific reference number to retrieve a single transaction',
      'Set target_reference to "all" (default) to retrieve all transactions in the current batch',
    ],
  });
}
