/**
 * PlacetoPay Checkout Helper Functions
 * Centralized utilities for PlacetoPay integration
 * Based on: https://docs.placetopay.dev/checkout/
 */

import { NextResponse } from 'next/server';
import { getEvertecConfig, EVERTEC_ENDPOINTS } from '@/app/config/evertec';
import type {
  Auth,
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionResponse,
  EvertecError,
  Payment,
  SessionStatus,
} from '@/app/types/evertec';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that auth object has all required fields
 */
export function validateAuth(auth: any): { valid: boolean; error?: NextResponse } {
  if (!auth || typeof auth !== 'object') {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'auth object is required' },
        { status: 400 }
      ),
    };
  }

  if (!auth.login || typeof auth.login !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'auth.login is required and must be a string' },
        { status: 400 }
      ),
    };
  }

  if (!auth.tranKey || typeof auth.tranKey !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'auth.tranKey is required and must be a string' },
        { status: 400 }
      ),
    };
  }

  if (!auth.nonce || typeof auth.nonce !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'auth.nonce is required and must be a string' },
        { status: 400 }
      ),
    };
  }

  if (!auth.seed || typeof auth.seed !== 'string') {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'auth.seed is required and must be a string (ISO 8601 format)' },
        { status: 400 }
      ),
    };
  }

  // Validate seed is a valid ISO 8601 date
  const seedDate = new Date(auth.seed);
  if (isNaN(seedDate.getTime())) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'auth.seed must be a valid ISO 8601 timestamp' },
        { status: 400 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Validates that a payment object has all required fields
 */
export function validatePayment(payment: Payment): { valid: boolean; error?: NextResponse } {
  if (!payment.reference) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'payment.reference is required' },
        { status: 400 }
      ),
    };
  }

  if (!payment.description) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'payment.description is required' },
        { status: 400 }
      ),
    };
  }

  if (!payment.amount) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'payment.amount is required' },
        { status: 400 }
      ),
    };
  }

  if (!payment.amount.currency) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'payment.amount.currency is required' },
        { status: 400 }
      ),
    };
  }

  if (payment.amount.total === undefined || payment.amount.total === null) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'payment.amount.total is required' },
        { status: 400 }
      ),
    };
  }

  // Validate partial payment constraint - no taxes allowed with partial payments
  if (payment.allowPartial && payment.amount.taxes && payment.amount.taxes.length > 0) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Taxes are not allowed with partial payments',
          message: 'When allowPartial is true, payment.amount.taxes must be empty or undefined',
        },
        { status: 400 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Validates a session request before sending to PlacetoPay
 */
export function validateSessionRequest(
  body: Partial<CreateSessionRequest>
): { valid: boolean; error?: NextResponse } {
  // Validate auth (required)
  if (body.auth) {
    const authValidation = validateAuth(body.auth);
    if (!authValidation.valid) {
      return authValidation;
    }
  }

  // Must have either payment or subscription
  if (!body.payment && !body.subscription) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: 'Either payment or subscription must be provided',
          message: 'A session must have at least a payment or subscription configuration',
        },
        { status: 400 }
      ),
    };
  }

  // Validate payment if provided
  if (body.payment) {
    const paymentValidation = validatePayment(body.payment);
    if (!paymentValidation.valid) {
      return paymentValidation;
    }
  }

  return { valid: true };
}

// ============================================================================
// API REQUEST HELPERS
// ============================================================================

/**
 * Creates a checkout session with PlacetoPay
 * NOTE: Client must provide auth in requestBody - this is a middleware, not the final client
 */
export async function createCheckoutSession(
  requestBody: CreateSessionRequest
): Promise<{ data: CreateSessionResponse | EvertecError; status: number }> {
  const config = getEvertecConfig();

  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[PlacetoPay] Forwarding request with client auth:', {
      login: requestBody.auth.login,
      nonce: requestBody.auth.nonce.substring(0, 10) + '...',
      seed: requestBody.auth.seed,
      tranKey: requestBody.auth.tranKey.substring(0, 10) + '...',
    });
  }

  const response = await fetch(`${config.baseUrl}${EVERTEC_ENDPOINTS.CREATE_SESSION}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data: CreateSessionResponse | EvertecError = await response.json();

  return {
    data,
    status: response.status,
  };
}

/**
 * Gets the status of a checkout session
 * NOTE: Client must provide auth - this is a middleware, not the final client
 */
export async function getCheckoutSessionStatus(
  requestId: number | string,
  auth: Auth
): Promise<{ data: GetSessionResponse | EvertecError; status: number }> {
  const config = getEvertecConfig();

  const payload = { auth };

  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[PlacetoPay] Forwarding get-session request with client auth:', {
      requestId,
      login: auth.login,
      nonce: auth.nonce.substring(0, 10) + '...',
      seed: auth.seed,
      tranKey: auth.tranKey.substring(0, 10) + '...',
    });
  }

  const response = await fetch(
    `${config.baseUrl}${EVERTEC_ENDPOINTS.GET_SESSION}/${requestId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const data: GetSessionResponse | EvertecError = await response.json();

  return {
    data,
    status: response.status,
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Checks if a response is an error
 */
export function isPlacetopayError(data: CreateSessionResponse | GetSessionResponse | EvertecError): data is EvertecError {
  return (
    'status' in data &&
    (data.status.status === 'ERROR' || data.status.status === 'FAILED')
  );
}

/**
 * Handles PlacetoPay API errors
 */
export function handlePlacetopayError(error: unknown): NextResponse {
  console.error('PlacetoPay API error:', error);

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'PlacetoPay API request failed',
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'PlacetoPay API request failed',
      message: 'Unknown error occurred',
    },
    { status: 500 }
  );
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Checks if a session is in a final state (no more updates expected)
 */
export function isSessionFinal(status: SessionStatus): boolean {
  return ['APPROVED', 'REJECTED', 'PARTIAL_EXPIRED'].includes(status);
}

/**
 * Checks if a session is approved
 */
export function isSessionApproved(status: SessionStatus): boolean {
  return status === 'APPROVED' || status === 'APPROVED_PARTIAL';
}

/**
 * Checks if a session is pending
 */
export function isSessionPending(status: SessionStatus): boolean {
  return status === 'PENDING' || status === 'APPROVED_PARTIAL';
}

/**
 * Checks if a session is rejected
 */
export function isSessionRejected(status: SessionStatus): boolean {
  return status === 'REJECTED' || status === 'PARTIAL_EXPIRED';
}

// ============================================================================
// RESPONSE FORMATTING
// ============================================================================

/**
 * Formats an expiration timestamp from milliseconds or date
 */
export function formatExpiration(expirationMs: number | Date): string {
  if (expirationMs instanceof Date) {
    return expirationMs.toISOString();
  }
  return new Date(Date.now() + expirationMs).toISOString();
}

/**
 * Generates a unique payment reference
 */
export function generatePaymentReference(prefix: string = 'PAY'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================================================
// API DOCUMENTATION HELPER
// ============================================================================

/**
 * Creates a standardized API documentation response for GET requests
 */
export function createPlacetopayApiDocumentation(config: {
  endpoint: string;
  method: string;
  description: string;
  requestBody?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  examples?: Record<string, unknown>;
  notes?: string[];
}): NextResponse {
  return NextResponse.json({
    endpoint: config.endpoint,
    method: config.method,
    description: config.description,
    documentation: 'https://docs.placetopay.dev/checkout/',
    ...(config.parameters && { parameters: config.parameters }),
    ...(config.requestBody && { requestBody: config.requestBody }),
    ...(config.responseBody && { responseBody: config.responseBody }),
    ...(config.examples && { examples: config.examples }),
    ...(config.notes && { notes: config.notes }),
  });
}
