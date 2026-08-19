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
  validateTerminalUrl,
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
    console.log('--- LOGON DEBUG ---');
    console.log('Terminal URL:', config.terminalUrl);
    console.log('API Key:', config.apiKey ? `${config.apiKey.substring(0, 6)}...${config.apiKey.substring(config.apiKey.length - 4)}` : 'MISSING');
    console.log('Terminal ID:', config.terminalId);
    console.log('Station Number:', config.stationNumber);
    console.log('Cashier ID:', config.cashierId);
    console.log('Timeout:', config.timeout);

    // Extract middleware-only overrides (not forwarded to terminal)
    const terminalUrlOverride: string | undefined = body.terminal_url;
    const apiKeyOverride: string | undefined = body.api_key;
    if (terminalUrlOverride && !validateTerminalUrl(terminalUrlOverride)) {
      return NextResponse.json(
        {
          error_code: 'INVALID_TERMINAL_URL',
          error_message: `Invalid terminal_url format "${terminalUrlOverride}". Expected: http://IP:PORT`,
        } as EvertecEcrError,
        { status: 400 }
      );
    }

    // Build request payload with defaults from config (terminal_url is stripped — not forwarded)
    const payload: LogonRequest = {
      terminal_id: body.terminal_id || config.terminalId,
      station_number: body.station_number || config.stationNumber,
      cashier_id: body.cashier_id || config.cashierId,
      reference: body.reference,
      last_reference: body.last_reference,
    };
    console.log('Logon request payload:', payload);
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
    const fullUrl = buildEndpointUrl(EVERTEC_ECR_ENDPOINTS.LOGON, terminalUrlOverride);
    const effectiveApiKey = apiKeyOverride || config.apiKey;
    const headers = getDefaultHeaders(effectiveApiKey);
    console.log('Request URL:', fullUrl);
    console.log('Request Headers:', JSON.stringify(headers));
    console.log('Request Body:', JSON.stringify(payload));

    const response = await fetch(
      fullUrl,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeout || 30000),
      }
    );

    console.log('Response Status:', response.status);
    console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    // Try to parse as JSON (terminals may not set correct Content-Type header)
    let data: LogonResponse | EvertecEcrError;
    try {
      data = await response.json();
      console.log('Response Body:', JSON.stringify(data));
    } catch {
      // If JSON parsing fails, get text response for debugging
      const textResponse = await response.text().catch(() => 'Unable to read response body');
      console.error('Failed to parse terminal response (raw text):', textResponse.substring(0, 500));

      return NextResponse.json(
        {
          error_code: 'INVALID_RESPONSE',
          error_message: `Terminal returned invalid JSON. Status: ${response.status}. Check EVERTEC_ECR_TERMINAL_URL configuration.`,
        } as EvertecEcrError,
        { status: 502 }
      );
    }

    console.log('--- LOGON DEBUG END ---');
    // Return response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error during logon:', error instanceof Error ? { name: error.name, message: error.message, cause: error.cause } : error);

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
        terminal_url: {
          type: 'string',
          description:
            'Middleware-only: Terminal base URL override (e.g., http://192.168.1.32:2030). Falls back to env EVERTEC_ECR_TERMINAL_URL. Stripped before forwarding to terminal.',
          example: 'http://192.168.1.32:2030',
        },
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
