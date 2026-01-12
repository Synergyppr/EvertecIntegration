/**
 * POST /api/evertec/session/logon
 * Establishes a session with the Evertec ECR terminal
 *
 * The terminal ID must match the one facilitated by Evertec.
 * Returns a session_id that must be included in all subsequent requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEvertecEcrConfig,
  EVERTEC_ECR_ENDPOINTS,
  buildEndpointUrl,
  getDefaultHeaders,
} from '@/app/config/evertec-ecr';
import type {
  LogonRequest,
  LogonResponse,
  EvertecEcrError,
} from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Get configuration
    const config = getEvertecEcrConfig();

    // Build request payload with defaults from config
    const payload: LogonRequest = {
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
      buildEndpointUrl(EVERTEC_ECR_ENDPOINTS.LOGON),
      {
        method: 'POST',
        headers: getDefaultHeaders(config.apiKey),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeout || 30000),
      }
    );

    // Try to parse as JSON (terminals may not set correct Content-Type header)
    let data: LogonResponse | EvertecEcrError;
    try {
      data = await response.json();
    } catch {
      // If JSON parsing fails, get text response for debugging
      const textResponse = await response.text().catch(() => 'Unable to read response body');
      console.error('Failed to parse terminal response:', textResponse.substring(0, 200));

      return NextResponse.json(
        {
          error_code: 'INVALID_RESPONSE',
          error_message: `Terminal returned invalid JSON. Status: ${response.status}. Check EVERTEC_ECR_TERMINAL_URL configuration.`,
        } as EvertecEcrError,
        { status: 502 }
      );
    }

    // Return response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error during logon:', error);

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
 * GET /api/evertec/session/logon
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/evertec/session/logon',
    method: 'POST',
    description:
      'Establishes a session with the Evertec ECR terminal. Returns a session_id required for subsequent transactions.',
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
          example: '100',
          required: true,
        },
        last_reference: {
          type: 'string',
          description: 'Previous transaction reference number',
          example: '99',
          required: true,
        },
      },
    },
    responseBody: {
      success: {
        reference: '100',
        terminal_vid: '30DR3479',
        approval_code: '00',
        station_number: '1234',
        cashier_id: '0001',
        last_reference: '99',
        response_message: 'APPROVED.',
        session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
        merchant_id: '4549102820016',
        terminal_id: '30DR3479',
      },
      error: {
        error_code: 'ERROR_CODE',
        error_message: 'Error description',
      },
    },
    notes: [
      'The terminal_id in the logon must match the one provided by Evertec',
      'The session_id returned must be included in all subsequent requests',
      'Session expires after logoff or terminal timeout',
    ],
  });
}
