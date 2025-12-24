/**
 * POST /api/evertec/sales/start-ath-movil-sale
 * Initiates an ATH Móvil payment transaction (Puerto Rico mobile payment method)
 *
 * ATH Móvil is a popular mobile wallet payment system in Puerto Rico.
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
  StartAthMovilSaleRequest,
  StartAthMovilSaleResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: StartAthMovilSaleRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
      process_cashback: body.process_cashback || 'no',
      amounts: body.amounts,
      receipt_output: body.receipt_output || 'BOTH',
      manual_entry_indicator: body.manual_entry_indicator || 'no',
      force_duplicate: body.force_duplicate,
      session_id: body.session_id,
    };

    const validation = validateRequiredFields(payload, [
      'reference',
      'last_reference',
      'amounts',
      'session_id',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    if (!payload.amounts.total) {
      return NextResponse.json(
        {
          error_code: 'MISSING_FIELD',
          error_message: 'amounts.total is required',
        },
        { status: 400 }
      );
    }

    const { data, status } =
      await makeTerminalRequest<StartAthMovilSaleResponse>(
        EVERTEC_ECR_ENDPOINTS.START_ATH_MOVIL_SALE,
        payload
      );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/sales/start-ath-movil-sale',
    description:
      'Initiates an ATH Móvil payment transaction. ATH Móvil is a mobile wallet payment system popular in Puerto Rico.',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'amounts', 'session_id'],
      properties: {
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
          example: 'OWNYQ-CZ3QJ-B46RO-1BQ85',
          required: true,
        },
        amounts: {
          type: 'object',
          required: ['total'],
          properties: {
            total: {
              type: 'string',
              example: '180.05',
              required: true,
            },
            base_state_tax: { type: 'string', example: '100.00' },
            tip: { type: 'string', example: '0.00' },
            state_tax: { type: 'string', example: '10.50' },
            city_tax: { type: 'string', example: '1.50' },
          },
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
        process_cashback: {
          type: 'string',
          enum: ['yes', 'no'],
          default: 'no',
        },
        manual_entry_indicator: {
          type: 'string',
          enum: ['yes', 'no'],
          default: 'no',
        },
      },
    },
    responseBody: {
      success: {
        approval_code: 'ST',
        trx_id: 'a4e5a907-79cd-4fe7-b34d-72d48d345188',
        reference: '67',
        response_message: 'SENDING TRANSACTION ID.',
        terminal_id: '30DR3473',
      },
    },
    notes: [
      'Requires terminal configured for ATH Móvil',
      'Customer will use ATH Móvil app to complete payment',
      'Poll transaction status using trx_id',
    ],
  });
}
