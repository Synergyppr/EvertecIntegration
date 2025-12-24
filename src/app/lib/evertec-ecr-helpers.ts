/**
 * Evertec ECR Helper Utilities
 * Reusable functions for Evertec ECR API endpoints
 */

import { NextResponse } from 'next/server';
import {
  getEvertecEcrConfig,
  buildEndpointUrl,
  getDefaultHeaders,
} from '@/app/config/evertec-ecr';
import type { BaseRequest, EvertecEcrError } from '@/app/types/evertec-ecr';

/**
 * Validates and enriches base request with defaults from config
 */
export function buildBaseRequest<T extends Partial<BaseRequest>>(
  body: T
): T & BaseRequest {
  const config = getEvertecEcrConfig();

  return {
    ...body,
    terminal_id: body.terminal_id || config.terminalId,
    station_number: body.station_number || config.stationNumber,
    cashier_id: body.cashier_id || config.cashierId,
    reference: body.reference || '',
    last_reference: body.last_reference || '',
  } as T & BaseRequest;
}

/**
 * Validates required fields in a request
 */
export function validateRequiredFields(
  payload: Record<string, unknown> | unknown,
  requiredFields: string[]
): { valid: boolean; error?: NextResponse } {
  const payloadObj = payload as Record<string, unknown>;

  for (const field of requiredFields) {
    if (!payloadObj[field]) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'MISSING_FIELD',
            error_message: `${field} is required`,
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Makes a request to the terminal
 */
export async function makeTerminalRequest<TResponse>(
  endpoint: string,
  payload: unknown
): Promise<{ data: TResponse | EvertecEcrError; status: number }> {
  const config = getEvertecEcrConfig();

  try {
    const response = await fetch(buildEndpointUrl(endpoint), {
      method: 'POST',
      headers: getDefaultHeaders(config.apiKey),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeout || 30000),
    });

    const data = await response.json();

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        data: {
          error_code: 'TIMEOUT',
          error_message: 'Terminal request timeout',
        } as EvertecEcrError,
        status: 504,
      };
    }

    throw error;
  }
}

/**
 * Handles errors from terminal requests
 */
export function handleTerminalError(error: unknown): NextResponse {
  console.error('Terminal request error:', error);

  return NextResponse.json(
    {
      error_code: 'INTERNAL_ERROR',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    } as EvertecEcrError,
    { status: 500 }
  );
}

/**
 * Creates a standardized API documentation response
 */
export function createApiDocumentation(config: {
  endpoint: string;
  description: string;
  requestBody: Record<string, unknown>;
  responseBody: Record<string, unknown>;
  notes?: string[];
}) {
  return NextResponse.json({
    endpoint: config.endpoint,
    method: 'POST',
    description: config.description,
    documentation: 'ECR API Documentation 01.02.07',
    requestBody: config.requestBody,
    responseBody: config.responseBody,
    notes: config.notes || [],
  });
}
