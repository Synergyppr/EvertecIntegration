/**
 * POST /api/placetopay/checkout/get-session/[requestId]
 * Retrieves the status of a checkout session
 * Based on: https://docs.placetopay.dev/checkout/how-checkout-works/
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCheckoutSessionStatus,
  isPlacetopayError,
  handlePlacetopayError,
} from '@/app/lib/placetopay-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    // Validate requestId
    if (!requestId || isNaN(Number(requestId))) {
      return NextResponse.json(
        {
          error: 'Invalid requestId',
          message: 'requestId must be a valid number',
        },
        { status: 400 }
      );
    }

    // Parse request body - client must provide auth
    const body = await request.json();

    // Validate auth is present
    if (!body.auth) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'The "auth" object is required in the request body. Clients must generate their own auth credentials.',
        },
        { status: 400 }
      );
    }

    // Get session status (pass auth from client)
    const { data, status } = await getCheckoutSessionStatus(requestId, body.auth);

    // Check if response is an error
    if (isPlacetopayError(data)) {
      return NextResponse.json(data, { status });
    }

    // Return successful response
    return NextResponse.json(data, { status });
  } catch (error) {
    return handlePlacetopayError(error);
  }
}

/**
 * GET /api/checkout/get-session/[requestId]
 * Returns API documentation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  return NextResponse.json({
    endpoint: `/api/checkout/get-session/${requestId}`,
    method: 'POST',
    description: 'Retrieves the status of a checkout session. This is a middleware - clients must provide their own auth credentials.',
    documentation: 'https://docs.placetopay.dev/checkout/how-checkout-works/',
    notes: [
      'This is a MIDDLEWARE endpoint - clients must provide auth in the request body',
      'Use the same auth credentials that were used to create the session',
    ],
    parameters: {
      requestId: {
        type: 'number',
        description: 'The session identifier returned from create-session',
        required: true,
      },
    },
    requestBody: {
      type: 'object',
      required: ['auth'],
      properties: {
        auth: {
          type: 'object',
          required: ['login', 'tranKey', 'nonce', 'seed'],
          description: 'Authentication credentials - must be provided by client',
          properties: {
            login: {
              type: 'string',
              description: 'Client login identifier',
            },
            tranKey: {
              type: 'string',
              description: 'Base64(SHA-256(nonce + seed + secretKey))',
            },
            nonce: {
              type: 'string',
              description: 'Base64-encoded random value',
            },
            seed: {
              type: 'string',
              description: 'Current timestamp in ISO 8601 format',
            },
          },
        },
      },
    },
    responseBody: {
      type: 'object',
      properties: {
        requestId: {
          type: 'number',
        },
        status: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'APPROVED_PARTIAL', 'PARTIAL_EXPIRED'],
            },
            reason: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            date: {
              type: 'string',
            },
          },
        },
        request: {
          type: 'object',
          description: 'Original request data',
        },
        payment: {
          type: 'array',
          description: 'Payment transaction details',
        },
        subscription: {
          type: 'object',
          description: 'Subscription details (if applicable)',
        },
      },
    },
  });
}
