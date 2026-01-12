/**
 * POST /api/evertec/refunds/start-ath-movil-refund
 * Processes an ATH Móvil refund transaction
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
  StartAthMovilRefundRequest,
  TransactionResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: StartAthMovilRefundRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
      amounts: body.amounts,
      receipt_output: body.receipt_output || 'BOTH',
      manual_entry_indicator: body.manual_entry_indicator || 'no',
      session_id: body.session_id,
    };

    const required = ['reference', 'last_reference', 'session_id', 'amounts'];
    const validation = validateRequiredFields(payload, required);

    if (!validation.valid) {
      return validation.error!;
    }

    if (!payload.amounts?.total) {
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

    const { data, status } = await makeTerminalRequest<TransactionResponse>(
      EVERTEC_ECR_ENDPOINTS.START_ATH_MOVIL_REFUND,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/refunds/start-ath-movil-refund',
    description: 'Processes an ATH Móvil refund transaction',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'session_id', 'amounts'],
      properties: {
        reference: { type: 'string', example: '100', required: true },
        last_reference: { type: 'string', example: '99', required: true },
        session_id: { type: 'string', example: 'SESSION-ID-HERE', required: true },
        receipt_email: { type: 'string', enum: ['yes', 'no'], default: 'yes' },
        amounts: {
          type: 'object',
          required: ['total'],
          properties: {
            total: { type: 'string', example: '100.00', required: true },
            base_state_tax: {
              type: 'string',
              description: 'Base amount subject to standard state tax rate (requires base_reduced_tax if provided)',
              example: '90.00',
            },
            base_reduced_tax: {
              type: 'string',
              description: 'Base amount subject to reduced state tax rate (required when base_state_tax is provided, use "0.00" if no reduced items)',
              example: '0.00',
            },
            state_tax: {
              type: 'string',
              description: 'Calculated state tax on base_state_tax (requires reduced_tax if provided)',
              example: '9.45',
            },
            reduced_tax: {
              type: 'string',
              description: 'Calculated reduced tax on base_reduced_tax (required when state_tax is provided, use "0.00" if no reduced items)',
              example: '0.00',
            },
            tip: { type: 'string', example: '0.00' },
            city_tax: { type: 'string', example: '0.55' },
          },
        },
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
    notes: [
      'Processes an ATH Móvil refund transaction',
      'IMPORTANT TAX REQUIREMENT: When using tax fields, you MUST provide BOTH pairs:',
      '  - base_state_tax + state_tax (standard rate)',
      '  - base_reduced_tax + reduced_tax (reduced rate)',
      '  Even if you have no reduced tax items, set base_reduced_tax="0.00" and reduced_tax="0.00"',
      '  This is a terminal validation requirement for Puerto Rico tax compliance',
    ],
  });
}
