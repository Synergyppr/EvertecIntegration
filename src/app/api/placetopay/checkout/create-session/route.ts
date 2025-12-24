/**
 * POST /api/checkout/create-session
 * Creates a new checkout session with PlacetoPay
 * Based on: https://docs.placetopay.dev/checkout/create-session/
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAuth } from '@/app/auth/evertec-auth';
import { getEvertecConfig, EVERTEC_ENDPOINTS } from '@/app/config/evertec';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  EvertecError,
} from '@/app/types/evertec';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Get configuration
    const config = getEvertecConfig();

    // Generate authentication
    const auth = generateAuth(config.login, config.secretKey);

    // Build complete request payload
    const payload: CreateSessionRequest = {
      ...body,
      auth,
    };

    // Validate required fields
    if (!payload.payment && !payload.subscription) {
      return NextResponse.json(
        {
          error: 'Either payment or subscription must be provided',
        },
        { status: 400 }
      );
    }

    // Make request to PlacetoPay API
    const response = await fetch(`${config.baseUrl}${EVERTEC_ENDPOINTS.CREATE_SESSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: CreateSessionResponse | EvertecError = await response.json();

    // Check if response is an error
    if ('status' in data && (data.status.status === 'ERROR' || data.status.status === 'FAILED')) {
      return NextResponse.json(data, { status: response.status });
    }

    // Return successful response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating checkout session:', error);

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
 * GET /api/checkout/create-session
 * Returns API documentation and example payloads
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/checkout/create-session',
    method: 'POST',
    description: 'Creates a new checkout session with PlacetoPay/Evertec',
    documentation: 'https://docs.placetopay.dev/checkout/create-session/',
    requestBody: {
      type: 'object',
      required: ['payment or subscription'],
      properties: {
        type: {
          type: 'string',
          enum: ['checkin', 'payment'],
          description: 'Session type: checkin (preauth) or payment',
          default: 'payment',
        },
        locale: {
          type: 'string',
          description: 'Locale for the checkout interface (e.g., es_CO, en_US)',
          default: 'es_CO',
        },
        payer: {
          type: 'object',
          description: 'Payer information',
        },
        buyer: {
          type: 'object',
          description: 'Buyer information (if different from payer)',
        },
        payment: {
          type: 'object',
          required: ['reference', 'description', 'amount'],
          properties: {
            reference: {
              type: 'string',
              description: 'Unique payment reference',
            },
            description: {
              type: 'string',
              description: 'Payment description',
            },
            amount: {
              type: 'object',
              required: ['currency', 'total'],
              properties: {
                currency: {
                  type: 'string',
                  enum: ['USD', 'COP', 'EUR', 'MXN', 'CLP', 'ARS'],
                },
                total: {
                  type: 'number',
                  description: 'Total amount',
                },
              },
            },
            allowPartial: {
              type: 'boolean',
              description: 'Allow partial payments',
              default: false,
            },
            recurring: {
              type: 'object',
              description: 'Recurring payment configuration',
            },
          },
        },
        subscription: {
          type: 'object',
          description: 'Subscription configuration for tokenizing payment methods',
        },
        returnUrl: {
          type: 'string',
          description: 'URL to redirect after payment',
        },
        cancelUrl: {
          type: 'string',
          description: 'URL to redirect if payment is canceled',
        },
        notificationUrl: {
          type: 'string',
          description: 'URL for async status notifications',
        },
        ipAddress: {
          type: 'string',
          description: 'IP address of the requester',
        },
        userAgent: {
          type: 'string',
          description: 'User agent of the requester',
        },
        expiration: {
          type: 'string',
          description: 'Session expiration (ISO 8601)',
        },
      },
    },
    responseBody: {
      type: 'object',
      properties: {
        status: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
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
        requestId: {
          type: 'number',
          description: 'Session identifier',
        },
        processUrl: {
          type: 'string',
          description: 'URL to redirect user for payment',
        },
      },
    },
  });
}
