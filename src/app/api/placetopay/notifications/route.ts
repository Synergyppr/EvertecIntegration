/**
 * POST /api/placetopay/notifications
 * Receives async notifications from PlacetoPay when sessions reach final states
 * Based on: https://docs.placetopay.dev/checkout/how-checkout-works/
 *
 * IMPORTANT: This endpoint should be configured as the notificationUrl when creating sessions
 * PlacetoPay will POST to this endpoint when a payment is completed
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCheckoutSessionStatus,
  isPlacetopayError,
  isSessionFinal,
  isSessionApproved,
  handlePlacetopayError,
} from '@/app/lib/placetopay-helpers';
import type { GetSessionResponse } from '@/app/types/evertec';

/**
 * Handles notification from PlacetoPay about session status changes
 *
 * According to docs: "PlacetoPay sends an asynchronous notification when a session
 * reaches a final state"
 *
 * The notification contains the requestId, and we should query the full session status
 * to verify and process it.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse notification payload
    const body = await request.json();

    // Extract requestId from notification
    const { requestId, status: notificationStatus } = body;

    if (!requestId) {
      return NextResponse.json(
        {
          error: 'Missing requestId',
          message: 'The notification must include a requestId',
        },
        { status: 400 }
      );
    }

    // Log the notification for debugging
    console.log('[PlacetoPay Notification]', {
      requestId,
      status: notificationStatus,
      timestamp: new Date().toISOString(),
    });

    // Query the actual session status from PlacetoPay
    // This is important for security - always verify with the API, don't trust notification alone
    const { data, status: httpStatus } = await getCheckoutSessionStatus(requestId);

    // Check if response is an error
    if (isPlacetopayError(data)) {
      console.error('[PlacetoPay Notification] Error fetching session:', data);
      return NextResponse.json(
        {
          error: 'Failed to verify session status',
          details: data,
        },
        { status: httpStatus }
      );
    }

    const sessionData = data as GetSessionResponse;
    const sessionStatus = sessionData.status.status;

    // Verify the session is in a final state
    if (!isSessionFinal(sessionStatus)) {
      console.warn('[PlacetoPay Notification] Session not in final state:', {
        requestId,
        status: sessionStatus,
      });
    }

    // Process the payment based on status
    if (isSessionApproved(sessionStatus)) {
      // Handle approved payment
      console.log('[PlacetoPay Notification] Payment approved:', {
        requestId,
        status: sessionStatus,
        payment: sessionData.payment,
        reference: sessionData.request.payment?.reference,
      });

      // TODO: Implement your business logic here:
      // - Update order status in database
      // - Send confirmation email
      // - Fulfill the order
      // - Update inventory
      // etc.

      // Example:
      // await updateOrderStatus(sessionData.request.payment?.reference, 'PAID');
      // await sendConfirmationEmail(sessionData);
    } else {
      // Handle rejected/expired payment
      console.log('[PlacetoPay Notification] Payment not approved:', {
        requestId,
        status: sessionStatus,
        reason: sessionData.status.reason,
        message: sessionData.status.message,
      });

      // TODO: Implement your business logic here:
      // - Update order status to failed
      // - Send failure notification
      // - Release reserved inventory
      // etc.

      // Example:
      // await updateOrderStatus(sessionData.request.payment?.reference, 'FAILED');
      // await sendPaymentFailedEmail(sessionData);
    }

    // Return success response to PlacetoPay
    // This tells PlacetoPay we received and processed the notification
    return NextResponse.json(
      {
        success: true,
        message: 'Notification processed successfully',
        requestId,
        status: sessionStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PlacetoPay Notification] Error processing notification:', error);
    return handlePlacetopayError(error);
  }
}

/**
 * GET /api/placetopay/notifications
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/placetopay/notifications',
    method: 'POST',
    description: 'Receives async notifications from PlacetoPay when sessions reach final states',
    documentation: 'https://docs.placetopay.dev/checkout/how-checkout-works/',
    usage: {
      configuration: 'Set this endpoint as the notificationUrl when creating a session',
      security: 'Always verify the session status by calling getRequestInformation',
      implementation: 'Implement your business logic in the TODO sections of this file',
    },
    requestBody: {
      type: 'object',
      properties: {
        requestId: {
          type: 'number',
          description: 'The session identifier',
          required: true,
        },
        status: {
          type: 'object',
          description: 'Status information from the notification',
        },
      },
    },
    responseBody: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Whether the notification was processed successfully',
        },
        message: {
          type: 'string',
          description: 'Processing message',
        },
        requestId: {
          type: 'number',
          description: 'The session identifier that was processed',
        },
        status: {
          type: 'string',
          description: 'The final session status',
        },
      },
    },
    notes: [
      'PlacetoPay calls this endpoint when a session reaches a final state',
      'Always verify the status by calling the PlacetoPay API (getRequestInformation)',
      'Never trust the notification payload alone - always verify with the API',
      'Implement your business logic in the TODO sections of this file',
      'Return 200 OK to acknowledge receipt of the notification',
    ],
  });
}
