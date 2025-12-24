/**
 * POST /api/checkout/get-session/[requestId]
 * Retrieves the status of a checkout session
 * Based on: https://docs.placetopay.dev/checkout/how-checkout-works/
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAuth } from '@/app/auth/evertec-auth';
import { getEvertecConfig, EVERTEC_ENDPOINTS } from '@/app/config/evertec';
import type { GetSessionResponse, EvertecError } from '@/app/types/evertec';

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

    // Get configuration
    const config = getEvertecConfig();

    // Generate authentication
    const auth = generateAuth(config.login, config.secretKey);

    // Build request payload
    const payload = {
      auth,
    };

    // Make request to PlacetoPay API
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

    // Check if response is an error
    if ('status' in data && (data.status.status === 'ERROR' || data.status.status === 'FAILED')) {
      return NextResponse.json(data, { status: response.status });
    }

    // Return successful response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error retrieving session:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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
    description: 'Retrieves the status of a checkout session',
    documentation: 'https://docs.placetopay.dev/checkout/how-checkout-works/',
    parameters: {
      requestId: {
        type: 'number',
        description: 'The session identifier returned from create-session',
        required: true,
      },
    },
    requestBody: {
      type: 'object',
      description: 'Authentication is automatically added by the API',
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
