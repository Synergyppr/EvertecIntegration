/**
 * Evertec / PlacetoPay Checkout Types
 * Based on official documentation: https://docs.placetopay.dev/checkout/
 */

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication object using Web Services Security UsernameToken Profile 1.1
 * Required for all API requests to PlacetoPay
 */
export interface Auth {
  /** Site identifier (can be public) */
  login: string;
  /** Generated credential: Base64(SHA-256(nonce + seed + secretKey)) */
  tranKey: string;
  /** Random Base64-encoded value per request */
  nonce: string;
  /** Current timestamp in ISO 8601 format (e.g., 2023-06-21T09:56:06-05:00) */
  seed: string;
}

// ============================================================================
// AMOUNT & PAYMENT TYPES
// ============================================================================

export type Currency = 'USD' | 'COP' | 'EUR' | 'MXN' | 'CLP' | 'ARS';

export interface AmountDetail {
  /** Detail type */
  kind: 'discount' | 'additional' | 'vatDevolution' | 'shipping' | 'handlingFee' | 'insurance' | 'giftWrap' | 'subtotal';
  /** Amount value */
  amount: number;
}

export interface Tax {
  /** Tax type */
  kind: 'valueAddedTax' | 'exciseDuty' | 'consumptionTax' | 'other';
  /** Tax amount */
  amount: number;
  /** Tax base amount */
  base?: number;
}

export interface Amount {
  /** Currency code */
  currency: Currency;
  /** Total amount */
  total: number;
  /** Taxes breakdown */
  taxes?: Tax[];
  /** Amount details breakdown */
  details?: AmountDetail[];
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface Recurring {
  /** Payment frequency */
  periodicity: 'D' | 'M' | 'Y';
  /** Interval between payments */
  interval: number;
  /** Next payment date in ISO 8601 */
  nextPayment: string;
  /** Maximum number of periods (optional) */
  maxPeriods?: number;
  /** Days until due date */
  dueDate?: number;
  /** Notification URL */
  notificationUrl?: string;
}

export interface Dispersion {
  /** Merchant agreement ID */
  agreement: string;
  /** Amount to disperse to this merchant */
  amount: Amount;
}

export interface Payment {
  /** Payment reference (unique identifier) */
  reference: string;
  /** Payment description */
  description: string;
  /** Payment amount */
  amount: Amount;
  /** Allow partial payments */
  allowPartial?: boolean;
  /** Shipping information */
  shipping?: {
    name: string;
    surname: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
  };
  /** Recurring payment configuration */
  recurring?: Recurring;
  /** Dispersion configuration for splitting payments */
  dispersion?: Dispersion[];
  /** Subscribe for future payments */
  subscribe?: boolean;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface Subscription {
  /** Subscription reference */
  reference: string;
  /** Subscription description */
  description: string;
}

export interface InstrumentToken {
  /** Token for future charges */
  token: string;
  /** Subtoken identifier */
  subtoken: string;
  /** Franchise (e.g., visa, mastercard) */
  franchise: string;
  /** Last 4 digits of card */
  franchiseImage: string;
  /** Masked card number */
  lastDigits: string;
  /** Valid until date */
  validUntil: string;
  /** Installation identifier */
  installments?: number;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export type SessionType = 'checkin' | 'payment';

export type SessionStatus =
  | 'PENDING'          // Awaiting user action or validation
  | 'APPROVED'         // Successfully completed
  | 'REJECTED'         // Canceled or expired
  | 'APPROVED_PARTIAL' // Partial payment received
  | 'PARTIAL_EXPIRED'; // Partial payment time limit exceeded

export interface Person {
  /** Document type */
  documentType?: string;
  /** Document number */
  document?: string;
  /** First name */
  name?: string;
  /** Last name */
  surname?: string;
  /** Company name (for business) */
  company?: string;
  /** Email address */
  email: string;
  /** Mobile phone */
  mobile?: string;
  /** Address */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
  };
}

export interface CreateSessionRequest {
  /** Session type: checkin (preauth) or payment */
  type?: SessionType;
  /** Locale for the checkout interface (e.g., es_CO, en_US) */
  locale?: string;
  /** Payer information */
  payer?: Person;
  /** Buyer information (if different from payer) */
  buyer?: Person;
  /** Payment configuration */
  payment?: Payment;
  /** Subscription configuration */
  subscription?: Subscription;
  /** Fields to show/collect in checkout */
  fields?: Array<{
    keyword: string;
    value?: string;
    required?: boolean;
  }>;
  /** Return URL after payment */
  returnUrl?: string;
  /** Payment method to filter */
  paymentMethod?: string;
  /** Cancel URL */
  cancelUrl?: string;
  /** IP address of the requester */
  ipAddress?: string;
  /** User agent of the requester */
  userAgent?: string;
  /** Session expiration (ISO 8601) */
  expiration?: string;
  /** Capture address */
  captureAddress?: boolean;
  /** Skip result screen */
  skipResult?: boolean;
  /** Notification URL for async updates */
  notificationUrl?: string;
  /** Authentication data */
  auth: Auth;
}

export interface TransactionResponse {
  /** Transaction status */
  status: {
    status: SessionStatus;
    reason: string;
    message: string;
    date: string;
  };
  /** Internal reference */
  internalReference?: number;
  /** Payment method used */
  paymentMethod?: string;
  /** Payment method name */
  paymentMethodName?: string;
  /** Issuer name */
  issuerName?: string;
  /** Amount */
  amount?: Amount;
  /** Authorization code */
  authorization?: string;
  /** Receipt number */
  receipt?: string;
  /** Franchise */
  franchise?: string;
  /** Refunded flag */
  refunded?: boolean;
  /** Processor fields */
  processorFields?: Array<{
    keyword: string;
    value: string;
    displayOn: string;
  }>;
}

export interface CreateSessionResponse {
  /** Request status */
  status: {
    status: SessionStatus;
    reason: string;
    message: string;
    date: string;
  };
  /** Request identifier */
  requestId: number;
  /** URL to redirect user for payment */
  processUrl: string;
}

export interface GetSessionResponse {
  /** Request identifier */
  requestId: number;
  /** Session status */
  status: {
    status: SessionStatus;
    reason: string;
    message: string;
    date: string;
  };
  /** Request information */
  request: CreateSessionRequest;
  /** Payment information */
  payment?: TransactionResponse[];
  /** Subscription information */
  subscription?: {
    status: {
      status: string;
      reason: string;
      message: string;
      date: string;
    };
    instrument?: InstrumentToken[];
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface EvertecError {
  status: {
    status: 'ERROR' | 'FAILED';
    reason: string;
    message: string;
    date: string;
  };
}

// ============================================================================
// ENVIRONMENT CONFIG TYPES
// ============================================================================

export interface EvertecConfig {
  /** Base URL for API */
  baseUrl: string;
  /** Login credential */
  login: string;
  /** Secret key for tranKey generation */
  secretKey: string;
  /** Default return URL */
  returnUrl: string;
  /** Default notification URL */
  notificationUrl?: string;
}
