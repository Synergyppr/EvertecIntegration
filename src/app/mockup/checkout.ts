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
  name: 'Juan',
  surname: 'Rivera',
  email: 'juan.rivera@example.com',
  mobile: '+17871234567',
  address: {
    street: '123 Calle Principal',
    city: 'San Juan',
    state: 'PR',
    postalCode: '00901',
    country: 'US',
    phone: '+17871234567',
  },
};

export const dummyBuyer: Person = {
  name: 'Maria',
  surname: 'González',
  company: 'Caribbean Business Solutions Inc',
  email: 'maria.gonzalez@example.com',
  mobile: '+17879876543',
  address: {
    street: '456 Avenida Ponce de León',
    city: 'Guaynabo',
    state: 'PR',
    postalCode: '00968',
    country: 'US',
    phone: '+17879876543',
  },
};

// ============================================================================
// DUMMY PAYMENTS
// ============================================================================

export const dummyBasicPayment: Payment = {
  reference: `PR-${Date.now()}`,
  description: 'Basic Payment - Puerto Rico',
  amount: {
    currency: 'USD',
    total: 125.00,
    taxes: [
      {
        kind: 'stateTax',
        amount: 11.50,
        base: 100.00,
      },
      {
        kind: 'municipalTax',
        amount: 6.00,
        base: 100.00,
      },
      {
        kind: 'reducedStateTax',
        amount: 7.50,
        base: 100.00,
      },
    ],
    details: [
      {
        kind: 'subtotal',
        amount: 100.00,
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
  reference: `PR-PARTIAL-${Date.now()}`,
  description: 'Large Purchase - Partial Payments Allowed (Puerto Rico)',
  amount: {
    currency: 'USD',
    total: 5000.00,
    // Note: Taxes are not allowed with partial payments per PlacetoPay documentation
  },
  allowPartial: true,
};

export const dummyRecurringPayment: Payment = {
  reference: `PR-RECURRING-${Date.now()}`,
  description: 'Monthly Membership Fee - Puerto Rico',
  amount: {
    currency: 'USD',
    total: 35.00,
    taxes: [
      {
        kind: 'stateTax',
        amount: 1.50,
        base: 30.00,
      },
      {
        kind: 'municipalTax',
        amount: 1.80,
        base: 30.00,
      },
      {
        kind: 'reducedStateTax',
        amount: 1.70,
        base: 30.00,
      },
    ],
    details: [
      {
        kind: 'subtotal',
        amount: 30.00,
      },
    ],
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
        kind: 'stateTax',
        amount: 15.00,
        base: 121.91,
      },
      {
        kind: 'municipalTax',
        amount: 7.50,
        base: 121.91,
      },
      {
        kind: 'reducedStateTax',
        amount: 6.09,
        base: 121.91,
      },
    ],
  },
};

export const dummyDispersionPayment: Payment = {
  reference: `TEST-DISPERSION-${Date.now()}`,
  description: 'Test Payment - Dispersion (Multiple Merchants)',
  amount: {
    currency: 'COP',
    total: 300000,
  },
  dispersion: [
    {
      agreement: 'MERCHANT-1',
      amount: {
        currency: 'COP',
        total: 200000,
      },
    },
    {
      agreement: 'MERCHANT-2',
      amount: {
        currency: 'COP',
        total: 100000,
      },
    },
  ],
};

export const dummyPaymentWithSubscription: Payment = {
  reference: `PR-PAY-SUB-${Date.now()}`,
  description: 'Payment with Optional Subscription - Puerto Rico',
  amount: {
    currency: 'USD',
    total: 55.00,
    taxes: [
      {
        kind: 'stateTax',
        amount: 2.50,
        base: 47.00,
      },
      {
        kind: 'municipalTax',
        amount: 2.82,
        base: 47.00,
      },
      {
        kind: 'reducedStateTax',
        amount: 2.68,
        base: 47.00,
      },
    ],
  },
  subscribe: true, // Allows user to opt-in to save payment method
};

// ============================================================================
// DUMMY SUBSCRIPTIONS
// ============================================================================

export const dummySubscription: Subscription = {
  reference: `PR-SUB-${Date.now()}`,
  description: 'Payment Method Tokenization - Puerto Rico',
};

// ============================================================================
// DUMMY SESSION REQUESTS
// ============================================================================

/**
 * Generates a dummy auth object for testing
 * NOTE: Clients should generate real auth using the generateAuth helper
 */
export function generateDummyAuth() {
  return {
    login: 'test_login',
    tranKey: 'dGVzdF90cmFuS2V5X2V4YW1wbGU=', // Example Base64
    nonce: 'ZHVtbXlfbm9uY2U=', // Example Base64
    seed: new Date().toISOString(),
  };
}

export const dummyBasicCheckoutRequest: CreateSessionRequest = {
  auth: {
    login: 'test_login',
    tranKey: 'dGVzdF90cmFuS2V5X2V4YW1wbGU=',
    nonce: 'ZHVtbXlfbm9uY2U=',
    seed: '2026-01-08T18:30:38.290Z',
  },
  locale: 'en_US',
  payer: {
    name: 'John',
    surname: 'Doe',
    email: 'John.Doe@syn.paulsonpuertorico.com',
  },
  payment: {
    reference: 'Golf-Course-1750',
    description: 'BBR 18 Holes Golf Course',
    amount: {
      currency: 'USD',
      total: 17.50,
      taxes: [
        {
          kind: 'stateTax',
          amount: 0.95,
          base: 15.70,
        },
        {
          kind: 'municipalTax',
          amount: 0.47,
          base: 15.70,
        },
        {
          kind: 'reducedStateTax',
          amount: 0.38,
          base: 15.70,
        },
      ],
    },
  },
  returnUrl: 'https://puertorico-merchant.com/payment/return',
  ipAddress: '66.50.0.1', // Puerto Rico IP range
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

/**
 * Recurring payment request (payment with recurring config)
 * Note: Use dummySubscriptionOnlyRequest for tokenization without payment
 */
export const dummySubscriptionRequest: CreateSessionRequest = {
  auth: generateDummyAuth(),
  locale: 'en_US',
  payer: dummyPayer,
  payment: dummyRecurringPayment,
  returnUrl: 'https://puertorico-merchant.com/subscription/return',
  notificationUrl: 'https://puertorico-merchant.com/api/placetopay/notifications',
  ipAddress: '66.50.0.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

export const dummyPartialPaymentRequest: CreateSessionRequest = {
  auth: generateDummyAuth(),
  locale: 'en_US',
  payer: dummyPayer,
  buyer: dummyBuyer,
  payment: dummyPartialPayment,
  returnUrl: 'https://puertorico-merchant.com/payment/return',
  notificationUrl: 'https://puertorico-merchant.com/api/placetopay/notifications',
  ipAddress: '66.50.0.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

export const dummyDispersionRequest: CreateSessionRequest = {
  auth: generateDummyAuth(),
  locale: 'es_CO',
  payer: dummyPayer,
  payment: dummyDispersionPayment,
  returnUrl: 'https://yoursite.com/payment/return',
  notificationUrl: 'https://yoursite.com/api/placetopay/notifications',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

export const dummyPreAuthRequest: CreateSessionRequest = {
  auth: generateDummyAuth(),
  locale: 'en_US',
  payer: dummyPayer,
  payment: dummyUSDPayment,
  returnUrl: 'https://yoursite.com/preauth/return',
  notificationUrl: 'https://yoursite.com/api/placetopay/notifications',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

export const dummySubscriptionOnlyRequest: CreateSessionRequest = {
  auth: generateDummyAuth(),
  locale: 'en_US',
  payer: dummyPayer,
  subscription: dummySubscription,
  returnUrl: 'https://puertorico-merchant.com/subscription/return',
  notificationUrl: 'https://puertorico-merchant.com/api/placetopay/notifications',
  ipAddress: '66.50.0.1',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
