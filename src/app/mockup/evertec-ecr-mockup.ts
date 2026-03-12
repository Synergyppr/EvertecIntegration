/**
 * Evertec ECR Mockup Data
 * Sample request/response data for testing and development
 *
 * TERMINAL ROUTING — every request supports two optional override fields:
 *   terminal_url  — Base URL of the physical terminal (e.g., "http://10.10.6.35:2030").
 *                   Falls back to env EVERTEC_ECR_TERMINAL_URL when omitted.
 *                   Middleware-only: stripped before forwarding to the device.
 *   terminal_id   — Terminal identifier assigned by Evertec (e.g., "40000260").
 *                   Falls back to env EVERTEC_ECR_TERMINAL_ID when omitted.
 *
 * This means the same middleware instance can serve multiple POS terminals
 * simultaneously — each caller just includes its own terminal_url + terminal_id.
 *
 * AUTO-INCREMENTING REFERENCE CHAIN:
 * All mock requests follow a sequential reference chain for realistic testing.
 * Each step's `reference` is unique; `last_reference` points to the previous step's reference.
 * First transaction (logon) uses last_reference: "" per Evertec spec.
 *
 * Standard Sale Flow:
 *   Logon      → ref=1,  last=""
 *   Sale       → ref=2,  last=1
 *   TipAdjust  → ref=3,  last=2   (target_reference=2)
 *   Void       → ref=4,  last=3   (target_reference=2)
 *   Refund     → ref=5,  last=4
 *   Settle     → ref=6,  last=5
 *   Logoff     → ref=7,  last=6
 *
 * Pre-Auth Flow:
 *   Logon      → ref=1,  last=""
 *   PreAuth    → ref=2,  last=1
 *   Completion → ref=3,  last=2   (target_reference=2)
 *   Settle     → ref=4,  last=3
 *   Logoff     → ref=5,  last=4
 *
 * For testing in API Playground:
 * 1. Start with Terminal Logon to get a session_id
 * 2. Replace "REPLACE-WITH-YOUR-SESSION-ID" with your actual session_id in subsequent requests
 * 3. Follow the reference chain — each step uses the reference shown above
 */

import type {
  LogonRequest,
  LogonResponse,
  LogoffRequest,
  StartSaleRequest,
  TransactionResponse,
  VoidRequest,
  VoidResponse,
  TipAdjustRequest,
  TipAdjustResponse,
  StartRefundRequest,
  StartCashRequest,
  StartCashRefundRequest,
  GetTransactionStatusRequest,
  GetTransactionStatusResponse,
  StartSettleRequest,
  StartSettleResponse,
  StartPreAuthRequest,
  CompletionRequest,
  JournalRequest,
  JournalResponse,
} from '@/app/types/evertec-ecr';

// ============================================================================
// SHARED TERMINAL CONFIG
// ============================================================================

const TERMINAL_URL = 'http://10.10.6.35:2030';
const TERMINAL_ID = '40000260';
const STATION_NUMBER = '1234';
const CASHIER_ID = '123';

// ============================================================================
// SESSION MANAGEMENT MOCKUPS
// ============================================================================

/**
 * Step 1 of standard flow — first transaction, so last_reference is ""
 */
export const mockLogonRequest: LogonRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '1',
  last_reference: '',
};

export const mockLogonResponse: LogonResponse = {
  reference: '1',
  terminal_vid: TERMINAL_ID,
  approval_code: '00',
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  last_reference: '',
  response_message: 'APPROVED.',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  merchant_id: '4549102820016',
  terminal_id: TERMINAL_ID,
};

/**
 * Step 7 of standard flow (after settle)
 */
export const mockLogoffRequest: LogoffRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '7',
  last_reference: '6',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
};

// ============================================================================
// BASE TRANSACTION MOCKUP (generic template for spread usage)
// ============================================================================

/**
 * Generic base transaction — use as a spread source for EBT, refund, cash endpoints.
 * Does not include process_cashback (use mockSaleRequest for card sales).
 */
export const mockBaseTransactionRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '2',
  last_reference: '1',
  receipt_email: 'yes' as const,
  amounts: {
    total: '180.05',
    base_state_tax: '100.00',
    base_reduced_tax: '0.00',
    tip: '0.00',
    state_tax: '10.50',
    reduced_tax: '0.00',
    city_tax: '1.50',
  },
  receipt_output: 'BOTH' as const,
  manual_entry_indicator: 'no' as const,
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
};

// ============================================================================
// SALE TRANSACTION MOCKUPS
// ============================================================================

/**
 * Step 2 of standard flow — sale after successful logon
 *
 * IMPORTANT TAX REQUIREMENTS:
 * When using tax fields, you MUST provide BOTH base amounts AND calculated tax amounts:
 * - base_state_tax + state_tax (for standard tax rate items)
 * - base_reduced_tax + reduced_tax (for reduced tax rate items)
 * Even if you don't have reduced tax items, set both to "0.00"
 *
 * This is a terminal validation requirement for Puerto Rico tax compliance.
 */
export const mockSaleRequest: StartSaleRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '2',
  last_reference: '1',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  receipt_email: 'yes',
  amounts: {
    total: '180.05',
    base_state_tax: '100.00',
    base_reduced_tax: '0.00',
    tip: '0.00',
    state_tax: '10.50',
    reduced_tax: '0.00',
    city_tax: '1.50',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
  process_cashback: 'no',
};

/**
 * Initial response — approval_code "ST" means async, must poll /getTrxStatus
 */
export const mockSaleResponse: TransactionResponse = {
  approval_code: 'ST',
  cashier_id: CASHIER_ID,
  manual_entry_indicator: 'no',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  process_cashback: 'no',
  reference: '2',
  trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  station_number: STATION_NUMBER,
  amounts: {
    total: '180.05',
    base_state_tax: '100.00',
    base_reduced_tax: '0.00',
    tip: '0.00',
    state_tax: '10.50',
    reduced_tax: '0.00',
    city_tax: '1.50',
  },
  receipt_output: 'BOTH',
  last_reference: '1',
  response_message: 'SENDING TRANSACTION ID.',
  receipt_email: 'yes',
  terminal_id: TERMINAL_ID,
};

// ============================================================================
// TIP ADJUSTMENT MOCKUPS
// ============================================================================

/**
 * Step 3 of standard flow — tip adjustment on the sale (ref=2)
 */
export const mockTipAdjustRequest: TipAdjustRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '3',
  last_reference: '2',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  target_reference: '2',
  tip: '5.00',
};

export const mockTipAdjustResponse: TipAdjustResponse = {
  reference: '3',
  approval_code: '00',
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  last_reference: '2',
  response_message: 'APPROVED',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  target_reference: '2',
  tip: '5.00',
};

// ============================================================================
// VOID TRANSACTION MOCKUPS
// ============================================================================

/**
 * Step 4 of standard flow — void the sale (target_reference=2)
 */
export const mockVoidRequest: VoidRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '4',
  last_reference: '3',
  receipt_output: 'BOTH',
  receipt_email: 'yes',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  target_reference: '2',
};

export const mockVoidResponse: VoidResponse = {
  reference: '4',
  approval_code: '00',
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  last_reference: '3',
  response_message: 'APPROVED',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  receipt_output: 'BOTH',
  receipt_email: 'yes',
  target_reference: '2',
};

// ============================================================================
// REFUND MOCKUPS
// ============================================================================

/**
 * Step 5 of standard flow — refund after void
 */
export const mockRefundRequest: StartRefundRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '5',
  last_reference: '4',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  receipt_email: 'yes',
  amounts: {
    total: '180.05',
    base_state_tax: '100.00',
    base_reduced_tax: '0.00',
    tip: '0.00',
    state_tax: '10.50',
    reduced_tax: '0.00',
    city_tax: '1.50',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
};

// ============================================================================
// CASH TRANSACTION MOCKUPS
// ============================================================================

export const mockCashRequest: StartCashRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '2',
  last_reference: '1',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  receipt_email: 'yes',
  amounts: {
    total: '50.00',
    base_state_tax: '44.84',
    state_tax: '4.71',
    city_tax: '0.45',
  },
  receipt_output: 'BOTH',
};

export const mockCashRefundRequest: StartCashRefundRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '3',
  last_reference: '2',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  receipt_email: 'yes',
  amounts: {
    total: '50.00',
    base_state_tax: '44.84',
    state_tax: '4.71',
    city_tax: '0.45',
  },
  receipt_output: 'BOTH',
};

// ============================================================================
// TRANSACTION STATUS MOCKUPS
// ============================================================================

/**
 * Poll status using trx_id from sale response
 */
export const mockGetStatusRequest: GetTransactionStatusRequest = {
  terminal_url: TERMINAL_URL,
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  trx_id: 'REPLACE-WITH-TRX-ID-FROM-SALE-RESPONSE',
};

export const mockGetStatusPendingResponse: GetTransactionStatusResponse = {
  trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  status: 'PENDING',
  message: 'Transaction in progress. Customer interaction required.',
};

export const mockGetStatusApprovedResponse: GetTransactionStatusResponse = {
  trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  status: 'APPROVED',
  message: 'Transaction approved successfully',
  transaction: {
    approval_code: '00',
    reference: '2',
    trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
    terminal_id: TERMINAL_ID,
    station_number: STATION_NUMBER,
    cashier_id: CASHIER_ID,
    last_reference: '1',
    response_message: 'APPROVED',
    amounts: {
      total: '180.05',
      base_state_tax: '100.00',
      base_reduced_tax: '0.00',
      tip: '0.00',
      state_tax: '10.50',
      reduced_tax: '0.00',
      city_tax: '1.50',
    },
    receipt_output: 'BOTH',
    receipt_email: 'yes',
    manual_entry_indicator: 'no',
  },
};

export const mockGetStatusRejectedResponse: GetTransactionStatusResponse = {
  trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  status: 'REJECTED',
  message: 'Transaction declined by issuer',
  error: 'INSUFFICIENT_FUNDS',
};

// ============================================================================
// SETTLEMENT MOCKUPS
// ============================================================================

/**
 * Step 6 of standard flow — settle after all transactions
 */
export const mockSettleRequest: StartSettleRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '6',
  last_reference: '5',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  receipt_output: 'BOTH',
};

/**
 * Initial response — approval_code "ST" means async, must poll /getTrxStatus
 */
export const mockSettleResponse: StartSettleResponse = {
  reference: '6',
  approval_code: 'ST',
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  last_reference: '5',
  response_message: 'SENDING TRANSACTION ID.',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  receipt_output: 'BOTH',
};

// ============================================================================
// PRE-AUTHORIZATION MOCKUPS
// ============================================================================

/**
 * Pre-Auth Flow Step 2 — after logon (ref=1, last="")
 */
export const mockPreAuthRequest: StartPreAuthRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '2',
  last_reference: '1',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  amounts: {
    total: '100.00',
  },
  receipt_output: 'BOTH',
  receipt_email: 'yes',
  force_duplicate: 'no',
  manual_entry_indicator: 'no',
};

/**
 * Pre-Auth Flow Step 3 — capture the pre-auth (target_reference=2)
 */
export const mockCompletionRequest: CompletionRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '3',
  last_reference: '2',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  target_reference: '2',
  force_duplicate: 'no',
  amounts: {
    total: '100.00',
    base_state_tax: '90.00',
    base_reduced_tax: '0.00',
    state_tax: '9.45',
    reduced_tax: '0.00',
    city_tax: '0.55',
  },
  receipt_output: 'BOTH',
  receipt_email: 'yes',
};

// ============================================================================
// JOURNAL / REPORTING MOCKUPS
// ============================================================================

export const mockJournalRequest: JournalRequest = {
  terminal_url: TERMINAL_URL,
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  reference: '6',
  last_reference: '5',
  session_id: 'REPLACE-WITH-YOUR-SESSION-ID',
  target_reference: 'all',
};

export const mockJournalResponse: JournalResponse = {
  reference: '6',
  approval_code: '00',
  terminal_id: TERMINAL_ID,
  station_number: STATION_NUMBER,
  cashier_id: CASHIER_ID,
  last_reference: '5',
  response_message: 'APPROVED',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  target_reference: 'all',
};

// ============================================================================
// COMPLETE TESTING FLOWS
// ============================================================================

/**
 * Standard Sale Flow — sequential references for copy-paste testing
 * Each step feeds into the next; replace session_id after logon
 */
export const mockSaleFlow = {
  // Step 1: Logon (last_reference="" for first transaction)
  logon: mockLogonRequest,
  logonResponse: mockLogonResponse,

  // Step 2: Sale (replace session_id with value from logon response)
  sale: mockSaleRequest,
  saleResponse: mockSaleResponse,

  // Step 3: Poll status using trx_id from sale response
  statusRequest: mockGetStatusRequest,
  statusPending: mockGetStatusPendingResponse,
  statusApproved: mockGetStatusApprovedResponse,

  // Step 4: Tip Adjustment on sale ref=2
  tipAdjust: mockTipAdjustRequest,
  tipAdjustResponse: mockTipAdjustResponse,

  // Step 5: Void the sale ref=2
  void: mockVoidRequest,
  voidResponse: mockVoidResponse,

  // Step 6: Settle the batch
  settle: mockSettleRequest,
  settleResponse: mockSettleResponse,

  // Step 7: Logoff
  logoff: mockLogoffRequest,
};

/**
 * Pre-Auth Completion Flow
 */
export const mockPreAuthFlow = {
  // Step 1: Logon
  logon: mockLogonRequest,
  logonResponse: mockLogonResponse,

  // Step 2: Pre-Auth
  preAuth: mockPreAuthRequest,

  // Step 3: Completion (captures pre-auth)
  completion: mockCompletionRequest,

  // Step 4: Settle
  settle: {
    ...mockSettleRequest,
    reference: '4',
    last_reference: '3',
  } as StartSettleRequest,
};

// ============================================================================
// COMMON TEST SCENARIOS (legacy alias kept for backwards compat)
// ============================================================================

/** @deprecated Use mockSaleFlow instead */
export const mockTransactionFlow = mockSaleFlow;

// ============================================================================
// REFERENCE GENERATOR
// ============================================================================

/**
 * Test reference number generator
 * Use sequential references for testing.
 *
 * Per Evertec spec:
 * - References must be unique per terminal per batch (range 1–999,999)
 * - last_reference = reference of last successfully responded transaction
 * - Use "" for last_reference on the very first transaction (e.g., logon)
 */
export class ReferenceGenerator {
  private currentReference: number;

  constructor(startReference: number = 1) {
    this.currentReference = startReference;
  }

  getNext(): { reference: string; last_reference: string } {
    const reference = this.currentReference.toString();
    const last_reference = this.currentReference === 1 ? '' : (this.currentReference - 1).toString();
    this.currentReference++;
    return { reference, last_reference };
  }

  reset(startReference: number = 1): void {
    this.currentReference = startReference;
  }
}

// ============================================================================
// SAMPLE AMOUNTS
// ============================================================================

/**
 * Sample amounts for different transaction types
 */
export const mockAmounts = {
  simple: {
    total: '100.00',
  },
  withTaxes: {
    total: '180.05',
    base_state_tax: '100.00',
    base_reduced_tax: '0.00',
    state_tax: '10.50',
    reduced_tax: '0.00',
    city_tax: '1.50',
  },
  withTip: {
    total: '225.00',
    base_state_tax: '200.00',
    base_reduced_tax: '0.00',
    state_tax: '20.00',
    reduced_tax: '0.00',
    tip: '5.00',
  },
  withCashback: {
    total: '150.00',
    base_state_tax: '130.00',
    base_reduced_tax: '0.00',
    state_tax: '15.00',
    reduced_tax: '0.00',
    cashback: '20.00',
  },
  complex: {
    total: '250.00',
    base_state_tax: '150.00',
    base_reduced_tax: '50.00',
    state_tax: '15.00',
    reduced_tax: '3.00',
    city_tax: '2.00',
    tip: '30.00',
  },
};

// ============================================================================
// TERMINAL CONFIGURATIONS
// ============================================================================

/**
 * Common terminal configurations for testing.
 *
 * Each entry shows a complete terminal identity including terminal_url.
 * When terminal_url is omitted the middleware falls back to EVERTEC_ECR_TERMINAL_URL.
 * Multiple POS stations can use the same middleware by passing different configs.
 */
export const mockTerminalConfigs = {
  /** Uses env defaults — no override required */
  default: {
    terminal_id: TERMINAL_ID,
    station_number: STATION_NUMBER,
    cashier_id: CASHIER_ID,
  },
  /** Explicit terminal URL — useful when targeting a specific device IP */
  terminalA: {
    terminal_url: TERMINAL_URL,
    terminal_id: TERMINAL_ID,
    station_number: STATION_NUMBER,
    cashier_id: CASHIER_ID,
  },
  terminalB: {
    terminal_url: 'http://192.168.1.47:2030',
    terminal_id: '40000267',
    station_number: '5678',
    cashier_id: '0002',
  },
  athMovilTerminal: {
    terminal_url: 'http://192.168.1.55:2030',
    terminal_id: '30DR3473',
    station_number: STATION_NUMBER,
    cashier_id: CASHIER_ID,
  },
  ebtTerminal: {
    terminal_url: 'http://192.168.1.60:2030',
    terminal_id: '30DR3478',
    station_number: STATION_NUMBER,
    cashier_id: CASHIER_ID,
  },
};

// ============================================================================
// SAMPLE SESSION & TRANSACTION IDS
// ============================================================================

export const mockSessionIds = [
  'T5ODA-GN4JR-I2FLV-VQAX8',
  'OFQRY-4IF8L-BL0RQ-Y6HFJ',
  'D8EXL-VTL0W-BK6I3-CAVB4',
  'KHVTN-7WMQN-TZ3J0-SRH6Z',
  'Q9QS9-WDNEX-I9LC2-4UMHZ',
];

export const mockTransactionIds = [
  '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  'a4e5a907-79cd-4fe7-b34d-72d48d345188',
  '88ed279d-5580-4b83-8ab9-9044d685dd2e',
  'c713bedc-fe1c-4782-a328-535349d82fbc',
  'd8ea8c06-5103-413d-901a-9e9885c1d9f8',
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Helper to create a mock sale request with custom values
 */
export function createMockSaleRequest(
  overrides: Partial<StartSaleRequest> = {}
): StartSaleRequest {
  return {
    ...mockSaleRequest,
    ...overrides,
  };
}

/**
 * Helper to simulate terminal delay (for testing async operations)
 */
export async function simulateTerminalDelay(ms: number = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
