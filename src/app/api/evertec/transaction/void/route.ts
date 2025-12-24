/**
 * POST /api/evertec/transaction/void
 * Voids (cancels) a previous transaction
 *
 * The transaction will be processed with no customer interaction.
 * Must be performed before settlement (batch close).
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
import type { VoidRequest, VoidResponse } from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: VoidRequest = {
      ...buildBaseRequest(body),
      receipt_output: body.receipt_output || 'BOTH',
      receipt_email: body.receipt_email || 'yes',
      target_reference: body.target_reference,
      session_id: body.session_id,
    };

    const validation = validateRequiredFields(payload, [
      'reference',
      'last_reference',
      'target_reference',
      'session_id',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    const { data, status } = await makeTerminalRequest<VoidResponse>(
      EVERTEC_ECR_ENDPOINTS.VOID,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/transaction/void',
    description:
      'Voids (cancels) a previous transaction. Must be done before settlement. No customer interaction required.',
    requestBody: {
      type: 'object',
      required: [
        'reference',
        'last_reference',
        'target_reference',
        'session_id',
      ],
      properties: {
        reference: {
          type: 'string',
          description: 'Current transaction reference',
          example: '50',
          required: true,
        },
        last_reference: {
          type: 'string',
          description: 'Previous transaction reference',
          example: '49',
          required: true,
        },
        target_reference: {
          type: 'string',
          description: 'Reference of transaction to void',
          example: '2',
          required: true,
        },
        session_id: {
          type: 'string',
          description: 'Session ID from logon',
          example: 'D8EXL-VTL0W-BK6I3-CAVB4',
          required: true,
        },
        receipt_output: {
          type: 'string',
          enum: ['BOTH', 'HTML', 'PRINTER', 'NONE'],
          default: 'BOTH',
        },
        receipt_email: {
          type: 'string',
          enum: ['yes', 'no'],
          default: 'yes',
        },
      },
    },
    responseBody: {
      success: {
        reference: '50',
        approval_code: '00',
        response_message: 'VOID APPROVED',
        terminal_id: '30DR3479',
      },
    },
    notes: [
      'Can only void transactions before settlement',
      'target_reference must be from the same batch',
      'No customer interaction required',
    ],
  });
}
