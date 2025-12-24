/**
 * POST /api/evertec/session/logoff
 * Ends the session with the Evertec ECR terminal
 *
 * After logoff, a new logon is required to process transactions.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEvertecEcrConfig,
  EVERTEC_ECR_ENDPOINTS,
  buildEndpointUrl,
  getDefaultHeaders,
} from '@/app/config/evertec-ecr';
import type {
  LogoffRequest,
  LogoffResponse,
  EvertecEcrError,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Get configuration
    const config = getEvertecEcrConfig();

    // Build request payload
    const payload: LogoffRequest = {
      terminal_id: body.terminal_id || config.terminalId,
      station_number: body.station_number || config.stationNumber,
      cashier_id: body.cashier_id || config.cashierId,
      reference: body.reference,
      last_reference: body.last_reference,
    };

    // Validate required fields
    if (!payload.reference) {
      return NextResponse.json(
        {
          error_code: 'MISSING_FIELD',
          error_message: 'reference is required',
        } as EvertecEcrError,
        { status: 400 }
      );
    }

    if (!payload.last_reference) {
      return NextResponse.json(
        {
          error_code: 'MISSING_FIELD',
          error_message: 'last_reference is required',
        } as EvertecEcrError,
        { status: 400 }
      );
    }

    // Make request to terminal
    const response = await fetch(
      buildEndpointUrl(EVERTEC_ECR_ENDPOINTS.LOGOFF),
      {
        method: 'POST',
        headers: getDefaultHeaders(config.apiKey),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeout || 30000),
      }
    );

    const data: LogoffResponse | EvertecEcrError = await response.json();

    // Return response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error during logoff:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          error_code: 'TIMEOUT',
          error_message: 'Terminal request timeout',
        } as EvertecEcrError,
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error_code: 'INTERNAL_ERROR',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      } as EvertecEcrError,
      { status: 500 }
    );
  }
}

/**
 * GET /api/evertec/session/logoff
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/evertec/session/logoff',
    method: 'POST',
    description:
      'Ends the session with the Evertec ECR terminal. A new logon is required for subsequent transactions.',
    documentation: 'ECR API Documentation 01.02.07',
    requestBody: {
      type: 'object',
      required: ['reference', 'last_reference'],
      properties: {
        terminal_id: {
          type: 'string',
          description:
            'Terminal identifier (defaults to env EVERTEC_ECR_TERMINAL_ID)',
          example: '30DR3479',
        },
        station_number: {
          type: 'string',
          description:
            'Station number (defaults to env EVERTEC_ECR_STATION_NUMBER)',
          example: '1234',
        },
        cashier_id: {
          type: 'string',
          description: 'Cashier ID (defaults to env EVERTEC_ECR_CASHIER_ID)',
          example: '0001',
        },
        reference: {
          type: 'string',
          description: 'Current transaction reference number',
          example: '101',
          required: true,
        },
        last_reference: {
          type: 'string',
          description: 'Previous transaction reference number',
          example: '100',
          required: true,
        },
      },
    },
    responseBody: {
      success: {
        reference: '101',
        terminal_vid: '30DR3479',
        approval_code: '00',
        cashier_id: '0001',
        station_number: '1234',
        last_reference: '100',
        response_message: 'APPROVED.',
        merchant_id: '4549102820016',
        terminal_id: '30DR3479',
      },
      error: {
        error_code: 'ERROR_CODE',
        error_message: 'Error description',
      },
    },
  });
}
