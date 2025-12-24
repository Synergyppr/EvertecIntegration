/**
 * Evertec ECR Mockup Data
 * Sample request/response data for testing and development
 */

import type {
  LogonRequest,
  LogonResponse,
  StartSaleRequest,
  TransactionResponse,
  VoidRequest,
  GetTransactionStatusRequest,
  GetTransactionStatusResponse,
  StartSettleRequest,
  StartSettleResponse,
} from '@/app/types/evertec-ecr';

// ============================================================================
// SESSION MANAGEMENT MOCKUPS
// ============================================================================

export const mockLogonRequest: LogonRequest = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '0001',
  reference: '100',
  last_reference: '99',
};

export const mockLogonResponse: LogonResponse = {
  reference: '100',
  terminal_vid: '30DR3479',
  approval_code: '00',
  station_number: '1234',
  cashier_id: '0001',
  last_reference: '99',
  response_message: 'APPROVED.',
  session_id: 'T5ODA-GN4JR-I2FLV-VQAX8',
  merchant_id: '4549102820016',
  terminal_id: '30DR3479',
};

// ============================================================================
// SALE TRANSACTION MOCKUPS
// ============================================================================

export const mockSaleRequest: StartSaleRequest = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '1234',
  reference: '67',
  last_reference: '66',
  receipt_email: 'yes',
  process_cashback: 'no',
  amounts: {
    total: '180.05',
    base_state_tax: '100.00',
    tip: '0.00',
    state_tax: '10.50',
    city_tax: '1.50',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
  session_id: 'Q9QS9-WDNEX-I9LC2-4UMHZ',
};

export const mockSaleResponse: TransactionResponse = {
  approval_code: 'ST',
  cashier_id: '1234',
  manual_entry_indicator: 'no',
  session_id: 'OFQRY-4IF8L-BL0RQ-Y6HFJ',
  process_cashback: 'no',
  reference: '67',
  trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  station_number: '1234',
  amounts: {
    total: '180.05',
    base_state_tax: '100.00',
    tip: '0.00',
    state_tax: '10.50',
    city_tax: '1.50',
  },
  receipt_output: 'BOTH',
  last_reference: '66',
  response_message: 'SENDING TRANSACTION ID.',
  receipt_email: 'yes',
  terminal_id: '30DR3478',
};

// ============================================================================
// VOID TRANSACTION MOCKUPS
// ============================================================================

export const mockVoidRequest: VoidRequest = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '1234',
  reference: '50',
  last_reference: '49',
  receipt_output: 'BOTH',
  receipt_email: 'yes',
  session_id: 'D8EXL-VTL0W-BK6I3-CAVB4',
  target_reference: '2',
};

// ============================================================================
// TRANSACTION STATUS MOCKUPS
// ============================================================================

export const mockGetStatusRequest: GetTransactionStatusRequest = {
  session_id: 'GRR3V-9J79T-ZORYE-QG2EL',
  terminal_id: '30DR3478',
  station_number: '12345',
  cashier_id: '12345',
  trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
};

export const mockGetStatusPendingResponse: GetTransactionStatusResponse = {
  trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
  status: 'PENDING',
  message: 'Transaction in progress. Customer interaction required.',
};

export const mockGetStatusApprovedResponse: GetTransactionStatusResponse = {
  trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
  status: 'APPROVED',
  message: 'Transaction approved successfully',
  transaction: {
    approval_code: '00',
    reference: '67',
    trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
    terminal_id: '30DR3478',
    station_number: '1234',
    cashier_id: '1234',
    last_reference: '66',
    response_message: 'APPROVED',
    amounts: {
      total: '180.05',
      base_state_tax: '100.00',
      tip: '0.00',
      state_tax: '10.50',
      city_tax: '1.50',
    },
    receipt_output: 'BOTH',
    receipt_email: 'yes',
    manual_entry_indicator: 'no',
  },
};

export const mockGetStatusRejectedResponse: GetTransactionStatusResponse = {
  trx_id: '88ed279d-5580-4b83-8ab9-9044d685dd2e',
  status: 'REJECTED',
  message: 'Transaction declined by issuer',
  error: 'INSUFFICIENT_FUNDS',
};

// ============================================================================
// SETTLEMENT MOCKUPS
// ============================================================================

export const mockSettleRequest: StartSettleRequest = {
  terminal_id: '30DR3478',
  station_number: '1234',
  cashier_id: '1234',
  reference: '13',
  session_id: 'KHVTN-7WMQN-TZ3J0-SRH6Z',
  receipt_output: 'BOTH',
  last_reference: '12',
};

export const mockSettleResponse: StartSettleResponse = {
  reference: '13',
  approval_code: '00',
  terminal_id: '30DR3478',
  station_number: '1234',
  cashier_id: '1234',
  last_reference: '12',
  response_message: 'SETTLEMENT APPROVED',
  session_id: 'KHVTN-7WMQN-TZ3J0-SRH6Z',
  receipt_output: 'BOTH',
};

// ============================================================================
// COMMON TEST SCENARIOS
// ============================================================================

/**
 * Sample transaction flow for testing
 */
export const mockTransactionFlow = {
  // Step 1: Logon
  logon: mockLogonRequest,
  logonResponse: mockLogonResponse,

  // Step 2: Sale
  sale: {
    ...mockSaleRequest,
    session_id: mockLogonResponse.session_id,
  },
  saleResponse: mockSaleResponse,

  // Step 3: Poll Status
  statusRequest: {
    ...mockGetStatusRequest,
    session_id: mockLogonResponse.session_id,
    trx_id: mockSaleResponse.trx_id,
  },
  statusPending: mockGetStatusPendingResponse,
  statusApproved: mockGetStatusApprovedResponse,

  // Step 4: Settlement
  settlement: {
    ...mockSettleRequest,
    session_id: mockLogonResponse.session_id,
  },
  settlementResponse: mockSettleResponse,
};

/**
 * Test reference number generator
 * Use sequential references for testing
 */
export class ReferenceGenerator {
  private currentReference: number;

  constructor(startReference: number = 1) {
    this.currentReference = startReference;
  }

  getNext(): { reference: string; last_reference: string } {
    const reference = this.currentReference.toString();
    const last_reference = (this.currentReference - 1).toString();
    this.currentReference++;
    return { reference, last_reference };
  }

  reset(startReference: number = 1): void {
    this.currentReference = startReference;
  }
}

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
    state_tax: '10.50',
    city_tax: '1.50',
  },
  withTip: {
    total: '225.00',
    base_state_tax: '200.00',
    state_tax: '20.00',
    tip: '5.00',
  },
  withCashback: {
    total: '150.00',
    base_state_tax: '130.00',
    state_tax: '15.00',
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

/**
 * Common terminal configurations for testing
 */
export const mockTerminalConfigs = {
  default: {
    terminal_id: '30DR3479',
    station_number: '1234',
    cashier_id: '0001',
  },
  alternativeStation: {
    terminal_id: '30DR3479',
    station_number: '5678',
    cashier_id: '0002',
  },
  athMovilTerminal: {
    terminal_id: '30DR3473',
    station_number: '1234',
    cashier_id: '0001',
  },
  ebtTerminal: {
    terminal_id: '30DR3478',
    station_number: '1234',
    cashier_id: '0001',
  },
};

/**
 * Mock session IDs for testing
 */
export const mockSessionIds = [
  'T5ODA-GN4JR-I2FLV-VQAX8',
  'OFQRY-4IF8L-BL0RQ-Y6HFJ',
  'D8EXL-VTL0W-BK6I3-CAVB4',
  'KHVTN-7WMQN-TZ3J0-SRH6Z',
  'Q9QS9-WDNEX-I9LC2-4UMHZ',
];

/**
 * Mock transaction IDs for testing
 */
export const mockTransactionIds = [
  '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
  'a4e5a907-79cd-4fe7-b34d-72d48d345188',
  '88ed279d-5580-4b83-8ab9-9044d685dd2e',
  'c713bedc-fe1c-4782-a328-535349d82fbc',
  'd8ea8c06-5103-413d-901a-9e9885c1d9f8',
];

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
