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
import type {
  BaseRequest,
  EvertecEcrError,
  TransactionAmounts,
} from '@/app/types/evertec-ecr';

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
 * Validates Puerto Rico tax compliance for transaction amounts
 *
 * IMPORTANT: Puerto Rico tax law requires paired tax fields:
 * - If base_state_tax is provided, base_reduced_tax MUST also be provided
 * - If state_tax is provided, reduced_tax MUST also be provided
 * - Even if no reduced tax items exist, use "0.00" for both fields
 *
 * This validation prevents terminal rejection error code ZY:
 * "AMOUNT FOR STATE REDUCED TAX NEEDED"
 *
 * @param amounts - Transaction amounts object to validate
 * @returns Validation result with error response if invalid
 */
export function validateTransactionAmounts(
  amounts: TransactionAmounts
): { valid: boolean; error?: NextResponse } {
  // Check if any tax fields are provided
  const hasBaseStateTax = amounts.base_state_tax !== undefined;
  const hasBaseReducedTax = amounts.base_reduced_tax !== undefined;
  const hasStateTax = amounts.state_tax !== undefined;
  const hasReducedTax = amounts.reduced_tax !== undefined;

  // If any tax field is provided, all four must be provided
  const hasSomeTaxFields =
    hasBaseStateTax || hasBaseReducedTax || hasStateTax || hasReducedTax;

  if (hasSomeTaxFields) {
    // Validate all required tax fields are present
    if (!hasBaseStateTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: base_state_tax is required when using tax fields. Set to "0.00" if no standard tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    if (!hasBaseReducedTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: base_reduced_tax is required when using tax fields. Set to "0.00" if no reduced tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    if (!hasStateTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: state_tax is required when using tax fields. Set to "0.00" if no standard tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    if (!hasReducedTax) {
      return {
        valid: false,
        error: NextResponse.json(
          {
            error_code: 'TAX_VALIDATION_ERROR',
            error_message:
              'Puerto Rico tax compliance: reduced_tax is required when using tax fields. Set to "0.00" if no reduced tax items.',
          } as EvertecEcrError,
          { status: 400 }
        ),
      };
    }

    // Validate that tax fields are valid numeric strings
    const taxFields = [
      amounts.base_state_tax,
      amounts.base_reduced_tax,
      amounts.state_tax,
      amounts.reduced_tax,
    ];

    for (const field of taxFields) {
      if (field && isNaN(parseFloat(field))) {
        return {
          valid: false,
          error: NextResponse.json(
            {
              error_code: 'TAX_VALIDATION_ERROR',
              error_message: `Tax field value "${field}" is not a valid numeric string`,
            } as EvertecEcrError,
            { status: 400 }
          ),
        };
      }
    }
  }

  return { valid: true };
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
