/**
 * POST /api/evertec/transaction/tip-adjust
 * Adjusts tip on a completed transaction
 *
 * Evertec terminal handles all validation and limits.
 * This endpoint optionally tracks adjustments for history/audit purposes.
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
import {
  getTransaction,
  recordTipAdjustment,
} from '@/app/lib/transaction-store';
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

    // Get current tip amount for optional history tracking (non-blocking)
    const existingTransaction = getTransaction(
      payload.terminal_id,
      payload.target_reference
    );
    const previousTip = existingTransaction?.current_tip || '0.00';

    console.log(`[Tip Adjust] Adjusting tip on transaction ${payload.target_reference}:`, {
      terminal_id: payload.terminal_id,
      target_reference: payload.target_reference,
      previous_tip: previousTip,
      new_tip: payload.tip,
      tracked: !!existingTransaction,
    });

    // Make request to terminal (Evertec handles all validation)
    const { data, status } = await makeTerminalRequest<TipAdjustResponse>(
      EVERTEC_ECR_ENDPOINTS.TIP_ADJUST,
      payload
    );

    const response = data as TipAdjustResponse;
    const success = response.approval_code === '00';

    // Optionally record the adjustment attempt for history (if transaction is tracked)
    if (existingTransaction) {
      recordTipAdjustment(
        payload.terminal_id,
        payload.target_reference,
        {
          adjustment_reference: payload.reference,
          previous_tip: previousTip,
          new_tip: payload.tip,
          success,
          response_message: response.response_message,
        }
      );
    }

    if (success) {
      console.log(`[Tip Adjust] Successfully adjusted tip on transaction ${payload.target_reference}`);
    } else {
      console.warn(`[Tip Adjust] Terminal rejected tip adjustment:`, {
        target_reference: payload.target_reference,
        approval_code: response.approval_code,
        message: response.response_message,
      });
    }

    // Return terminal response as-is (let client handle Evertec errors)
    return NextResponse.json(response, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/transaction/tip-adjust',
    description: 'Adjusts tip on a completed transaction. Evertec terminal handles all validation.',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference', 'session_id', 'target_reference', 'tip'],
      properties: {
        terminal_id: {
          type: 'string',
          example: '40000260',
          description: 'Terminal ID (optional, uses env default)',
        },
        station_number: {
          type: 'string',
          example: '1234',
          description: 'Station number (optional, uses env default)',
        },
        cashier_id: {
          type: 'string',
          example: '123',
          description: 'Cashier ID (optional, uses env default)',
        },
        reference: {
          type: 'string',
          example: '3001',
          required: true,
          description: 'Current transaction reference',
        },
        last_reference: {
          type: 'string',
          example: '3000',
          required: true,
          description: 'Previous transaction reference',
        },
        session_id: {
          type: 'string',
          example: 'KC0P6-UHTD9-4RP5L-S4O0R',
          required: true,
          description: 'Session ID from logon',
        },
        target_reference: {
          type: 'string',
          example: '3000',
          required: true,
          description: 'Reference of transaction to adjust',
        },
        tip: {
          type: 'string',
          example: '0.10',
          required: true,
          description: 'New tip amount in decimal format',
        },
      },
    },
    responseBody: {
      success: {
        reference: '3001',
        last_reference: '3000',
        target_reference: '3000',
        tip: '0.10',
        approval_code: '00',
        response_message: 'APPROVED.',
        terminal_id: '40000260',
        station_number: '1234',
        cashier_id: '123',
        session_id: 'KC0P6-UHTD9-4RP5L-S4O0R',
      },
      error_exceeds_adjustments: {
        approval_code: 'ZY',
        response_message: 'EXCEEDS TIP ADJUSTS.',
        reference: '3001',
        last_reference: '3000',
        target_reference: '3000',
        tip: '0.10',
        terminal_id: '40000260',
      },
      error_not_allowed: {
        approval_code: 'ZY',
        response_message: 'TIP ADJUST NOT ALLOWED.',
        reference: '3001',
        last_reference: '3000',
        target_reference: '3000',
        tip: '0.10',
        terminal_id: '40000260',
      },
    },
    notes: [
      'Adjusts tip on a completed transaction',
      'target_reference must be the reference of an existing approved transaction',
      'tip amount should be in decimal format (e.g., "0.10" for 10 cents)',
      'Terminals typically allow only 1-2 tip adjustments per transaction',
      'If "EXCEEDS TIP ADJUSTS" error: void transaction and create new one with correct tip',
      'All validation is handled by Evertec terminal',
      'Successfully approved transactions are optionally tracked for history',
    ],
  });
}
