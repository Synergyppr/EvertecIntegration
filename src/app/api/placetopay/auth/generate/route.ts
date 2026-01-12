/**
 * POST /api/placetopay/auth/generate
 * Helper endpoint to generate PlacetoPay auth credentials
 * Clients can use this to properly generate auth object
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAuth } from '@/app/auth/evertec-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.login || typeof body.login !== 'string') {
      return NextResponse.json(
        {
          error: 'login is required',
          message: 'Please provide your PlacetoPay login identifier',
        },
        { status: 400 }
      );
    }

    if (!body.secretKey || typeof body.secretKey !== 'string') {
      return NextResponse.json(
        {
          error: 'secretKey is required',
          message: 'Please provide your PlacetoPay secret key',
        },
        { status: 400 }
      );
    }

    // Generate auth
    const auth = generateAuth(body.login, body.secretKey);

    return NextResponse.json({
      success: true,
      auth,
      note: 'Use this auth object in your create-session and get-session requests',
    });
  } catch (error) {
    console.error('Auth generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate auth',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/placetopay/auth/generate
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/placetopay/auth/generate',
    method: 'POST',
    description: 'Helper endpoint to generate PlacetoPay authentication credentials',
    documentation: 'https://docs.placetopay.dev/checkout/authentication/',
    requestBody: {
      type: 'object',
      required: ['login', 'secretKey'],
      properties: {
        login: {
          type: 'string',
          description: 'Your PlacetoPay login identifier',
          example: '8196b60bef698bac55d8cd9ae5d841b0',
        },
        secretKey: {
          type: 'string',
          description: 'Your PlacetoPay secret key',
          example: '58FlCK66f83QW2M8',
        },
      },
    },
    responseBody: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        auth: {
          type: 'object',
          properties: {
            login: {
              type: 'string',
              description: 'Your login identifier',
            },
            tranKey: {
              type: 'string',
              description: 'Generated tranKey: Base64(SHA-256(nonce + seed + secretKey))',
            },
            nonce: {
              type: 'string',
              description: 'Generated random nonce (Base64)',
            },
            seed: {
              type: 'string',
              description: 'Current timestamp (ISO 8601)',
            },
          },
        },
      },
    },
    notes: [
      'This endpoint helps clients generate proper auth credentials',
      'The generated auth object can be used in create-session and get-session requests',
      'Auth credentials are valid for 5 minutes from the seed timestamp',
      'You must generate new auth for each API request',
    ],
  });
}
