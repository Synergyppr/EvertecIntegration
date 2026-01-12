/**
 * POST /api/evertec/ebt/foodstamp-purchase
 * Processes an EBT FoodStamp purchase transaction
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
  StartEbtFoodStampPurchaseRequest,
  TransactionResponse,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: StartEbtFoodStampPurchaseRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
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

    // Validate Puerto Rico tax compliance
    const taxValidation = validateTransactionAmounts(payload.amounts);
    if (!taxValidation.valid) {
      return taxValidation.error!;
    }

    const { data, status } = await makeTerminalRequest<TransactionResponse>(
      EVERTEC_ECR_ENDPOINTS.START_EBT_FOODSTAMP_PURCHASE,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/ebt/foodstamp-purchase',
    description: 'Processes an EBT FoodStamp purchase transaction. Different data may be requested based on terminal configuration.',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'amounts', 'session_id'],
      properties: {
        reference: { type: 'string', example: '47', required: true },
        last_reference: { type: 'string', example: '46', required: true },
        session_id: { type: 'string', example: 'OFQRY-4IF8L-BL0RQ-Y6HFJ', required: true },
        receipt_email: { type: 'string', enum: ['yes', 'no'], default: 'yes' },
        amounts: {
          type: 'object',
          required: ['total'],
          properties: {
            total: { type: 'string', example: '187.50', required: true },
            base_state_tax: { type: 'string', example: '100.00' },
            base_reduced_tax: { type: 'string', example: '50.00' },
            state_tax: { type: 'string', example: '10.50' },
            reduced_tax: { type: 'string', example: '3.00' },
            city_tax: { type: 'string', example: '1.50' },
          },
        },
        receipt_output: {
          type: 'string',
          enum: ['BOTH', 'HTML', 'PRINTER', 'NONE'],
          default: 'BOTH',
        },
        manual_entry_indicator: { type: 'string', enum: ['yes', 'no'], default: 'no' },
      },
    },
    responseBody: {
      success: {
        reference: '47',
        trx_id: 'c713bedc-fe1c-4782-a328-535349d82fbc',
        approval_code: 'ST',
        response_message: 'SENDING TRANSACTION ID.',
        terminal_id: '30DR3478',
      },
    },
    notes: [
      'EBT FoodStamp transactions are for purchasing food items',
      'Customer interaction required on terminal',
      'Poll transaction status using trx_id',
    ],
  });
}
