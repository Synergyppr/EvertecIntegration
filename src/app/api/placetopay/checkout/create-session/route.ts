/**
 * POST /api/placetopay/checkout/create-session
 * Creates a new checkout session with PlacetoPay
 * Based on: https://docs.placetopay.dev/checkout/create-session/
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateSessionRequest,
  createCheckoutSession,
  isPlacetopayError,
  handlePlacetopayError,
} from '@/app/lib/placetopay-helpers';
import type { CreateSessionRequest } from '@/app/types/evertec';

export async function POST(request: NextRequest) {
  try {
    // Parse request body - client must provide auth
    const body: CreateSessionRequest = await request.json();

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

    // Validate request
    const validation = validateSessionRequest(body);
    if (!validation.valid) {
      return validation.error!;
    }

    // Create session (auth is already in body from client)
    const { data, status } = await createCheckoutSession(body);

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
 * GET /api/checkout/create-session
 * Returns API documentation and example payloads
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/checkout/create-session',
    method: 'POST',
    description: 'Creates a new checkout session with PlacetoPay/Evertec. This is a middleware - clients must provide their own auth credentials.',
    documentation: 'https://docs.placetopay.dev/checkout/create-session/',
    notes: [
      'This is a MIDDLEWARE endpoint - clients must generate and provide their own auth object',
      'Use the generateAuth helper from @/app/auth/evertec-auth.ts to create auth credentials',
      'Auth must include: login, tranKey (Base64(SHA-256(nonce + seed + secretKey))), nonce (Base64), and seed (ISO 8601)',
    ],
    requestBody: {
      type: 'object',
      required: ['auth', 'payment or subscription'],
      properties: {
        auth: {
          type: 'object',
          required: ['login', 'tranKey', 'nonce', 'seed'],
          description: 'Authentication credentials - clients must generate this',
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
