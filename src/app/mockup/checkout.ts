/**
 * Mockup / Dummy Data for Evertec Checkout Testing
 * Use this data to test the checkout flow without making real API calls
 */

import type {
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionResponse,
  Person,
  Payment,
  Subscription,
  SessionStatus,
} from '../types/evertec';

// ============================================================================
// DUMMY PAYERS
// ============================================================================

export const dummyPayer: Person = {
  documentType: 'CC',
  document: '1234567890',
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  mobile: '+573001234567',
  address: {
    street: '123 Main Street',
    city: 'Bogotá',
    state: 'Cundinamarca',
    postalCode: '110111',
    country: 'CO',
    phone: '+573001234567',
  },
};

export const dummyBuyer: Person = {
  documentType: 'CC',
  document: '9876543210',
  name: 'Jane',
  surname: 'Smith',
  company: 'ACME Corp',
  email: 'jane.smith@example.com',
  mobile: '+573009876543',
  address: {
    street: '456 Business Ave',
    city: 'Medellín',
    state: 'Antioquia',
    postalCode: '050001',
    country: 'CO',
    phone: '+573009876543',
  },
};

// ============================================================================
// DUMMY PAYMENTS
// ============================================================================

export const dummyBasicPayment: Payment = {
  reference: `TEST-${Date.now()}`,
  description: 'Test Payment - Basic Checkout',
  amount: {
    currency: 'COP',
    total: 100000,
    taxes: [
      {
        kind: 'valueAddedTax',
        amount: 19000,
        base: 81000,
      },
    ],
    details: [
      {
        kind: 'subtotal',
        amount: 81000,
      },
      {
        kind: 'shipping',
        amount: 0,
      },
    ],
  },
  allowPartial: false,
};

export const dummyPartialPayment: Payment = {
  reference: `TEST-PARTIAL-${Date.now()}`,
  description: 'Test Payment - Partial Payments Allowed',
  amount: {
    currency: 'COP',
    total: 500000,
    taxes: [
      {
        kind: 'valueAddedTax',
        amount: 95000,
        base: 405000,
      },
    ],
  },
  allowPartial: true,
};

export const dummyRecurringPayment: Payment = {
  reference: `TEST-RECURRING-${Date.now()}`,
  description: 'Test Payment - Monthly Subscription',
  amount: {
    currency: 'USD',
    total: 29.99,
  },
  recurring: {
    periodicity: 'M',
    interval: 1,
    nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxPeriods: 12,
  },
  subscribe: true,
};

export const dummyUSDPayment: Payment = {
  reference: `TEST-USD-${Date.now()}`,
  description: 'Test Payment - USD Currency',
  amount: {
    currency: 'USD',
    total: 150.50,
    taxes: [
      {
        kind: 'valueAddedTax',
        amount: 28.59,
        base: 121.91,
      },
    ],
  },
};

// ============================================================================
// DUMMY SUBSCRIPTIONS
// ============================================================================

export const dummySubscription: Subscription = {
  reference: `TEST-SUB-${Date.now()}`,
  description: 'Test Subscription - Payment Method Tokenization',
};

// ============================================================================
// DUMMY SESSION REQUESTS
// ============================================================================

export const dummyBasicCheckoutRequest: Omit<CreateSessionRequest, 'auth'> = {
  type: 'payment',
  locale: 'es_CO',
  payer: dummyPayer,
  payment: dummyBasicPayment,
  returnUrl: 'https://yoursite.com/payment/return',
  cancelUrl: 'https://yoursite.com/payment/cancel',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  captureAddress: false,
  skipResult: false,
};

export const dummySubscriptionRequest: Omit<CreateSessionRequest, 'auth'> = {
  type: 'payment',
  locale: 'en_US',
  payer: dummyPayer,
  payment: dummyRecurringPayment,
  subscription: dummySubscription,
  returnUrl: 'https://yoursite.com/subscription/return',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

export const dummyPartialPaymentRequest: Omit<CreateSessionRequest, 'auth'> = {
  type: 'payment',
  locale: 'es_CO',
  payer: dummyPayer,
  buyer: dummyBuyer,
  payment: dummyPartialPayment,
  returnUrl: 'https://yoursite.com/payment/return',
  notificationUrl: 'https://yoursite.com/api/notifications',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

// ============================================================================
// DUMMY RESPONSES
// ============================================================================

export const dummyCreateSessionResponse: CreateSessionResponse = {
  status: {
    status: 'PENDING',
    reason: '00',
    message: 'Session created successfully',
    date: new Date().toISOString(),
  },
  requestId: 123456,
  processUrl: 'https://checkout-test.placetopay.com/session/123456/abc123def456',
};

export const generateDummyGetSessionResponse = (
  status: SessionStatus = 'APPROVED'
): GetSessionResponse => ({
  requestId: 123456,
  status: {
    status,
    reason: status === 'APPROVED' ? '00' : status === 'REJECTED' ? '?C' : '00',
    message:
      status === 'APPROVED'
        ? 'The request has been approved successfully'
        : status === 'REJECTED'
        ? 'The request has been rejected'
        : 'The request is pending',
    date: new Date().toISOString(),
  },
  request: {
    ...dummyBasicCheckoutRequest,
    auth: {
      login: 'test_login',
      tranKey: 'dummy_tran_key',
      nonce: 'dummy_nonce',
      seed: new Date().toISOString(),
    },
  },
  payment:
    status === 'APPROVED'
      ? [
          {
            status: {
              status: 'APPROVED',
              reason: '00',
              message: 'Approved transaction',
              date: new Date().toISOString(),
            },
            internalReference: 1234567890,
            paymentMethod: 'visa',
            paymentMethodName: 'Visa',
            issuerName: 'BANCO DE PRUEBAS',
            amount: {
              currency: 'COP',
              total: 100000,
            },
            authorization: '123456',
            receipt: '9876543210',
            franchise: 'CR_VS',
            refunded: false,
          },
        ]
      : undefined,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a random reference for testing
 */
export function generateTestReference(prefix: string = 'TEST'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

/**
 * Creates a test payment with custom amount
 */
export function createTestPayment(
  amount: number,
  currency: 'COP' | 'USD' = 'COP',
  description: string = 'Test Payment'
): Payment {
  return {
    reference: generateTestReference(),
    description,
    amount: {
      currency,
      total: amount,
    },
  };
}
