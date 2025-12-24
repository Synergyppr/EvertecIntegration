/**
 * Evertec ECR Configuration
 * Centralizes all environment variables and configuration for Evertec terminal integration
 *
 * The terminal communicates via HTTP/REST API on a local network.
 * Typical setup: Terminal IP (e.g., 192.168.0.212) on port 2030
 */

import { EvertecEcrConfig } from '../types/evertec-ecr';

/**
 * Retrieves Evertec ECR configuration from environment variables
 * Throws error if required variables are missing
 */
export function getEvertecEcrConfig(): EvertecEcrConfig {
  const terminalUrl = process.env.EVERTEC_ECR_TERMINAL_URL;
  const apiKey = process.env.EVERTEC_ECR_API_KEY;
  const terminalId = process.env.EVERTEC_ECR_TERMINAL_ID;
  const stationNumber = process.env.EVERTEC_ECR_STATION_NUMBER;
  const cashierId = process.env.EVERTEC_ECR_CASHIER_ID;
  const timeout = process.env.EVERTEC_ECR_TIMEOUT;

  if (!terminalUrl) {
    throw new Error(
      'EVERTEC_ECR_TERMINAL_URL is not defined in environment variables'
    );
  }

  if (!apiKey) {
    throw new Error(
      'EVERTEC_ECR_API_KEY is not defined in environment variables'
    );
  }

  if (!terminalId) {
    throw new Error(
      'EVERTEC_ECR_TERMINAL_ID is not defined in environment variables'
    );
  }

  if (!stationNumber) {
    throw new Error(
      'EVERTEC_ECR_STATION_NUMBER is not defined in environment variables'
    );
  }

  if (!cashierId) {
    throw new Error(
      'EVERTEC_ECR_CASHIER_ID is not defined in environment variables'
    );
  }

  return {
    terminalUrl,
    apiKey,
    terminalId,
    stationNumber,
    cashierId,
    timeout: timeout ? parseInt(timeout, 10) : 30000, // Default 30 seconds
  };
}

/**
 * API endpoints for Evertec ECR Terminal
 * All endpoints are POST requests
 */
export const EVERTEC_ECR_ENDPOINTS = {
  // Session Management
  LOGON: '/logon',
  LOGOFF: '/logoff',

  // Sale Transactions
  START_SALE: '/startSale',
  START_ATH_MOVIL_SALE: '/startAthMovilSale',

  // EBT Transactions
  START_EBT_FOODSTAMP_PURCHASE: '/startEbtFoodStampPurchase',
  START_EBT_FOODSTAMP_REFUND: '/startEbtFoodStampRefund',
  START_EBT_CASH_PURCHASE: '/startEbtCashPurchase',
  START_EBT_CASH_PURCHASE_CASHBACK: '/startEbtCashPurchaseCashback',
  START_EBT_CASH_WITHDRAWAL: '/startEbtCashWithdrawal',
  START_EBT_BALANCE_INQUIRY: '/startEbtOthersBalance',
  START_EBT_FOODSTAMP_VOUCHER: '/startEbtFoodStampVoucher',
  START_EBT_CASH_VOUCHER: '/startEbtCashVoucher',

  // Refund Transactions
  START_REFUND: '/startRefund',
  START_ATH_MOVIL_REFUND: '/startAthMovilRefund',

  // Transaction Management
  VOID: '/void',
  TIP_ADJUST: '/tipAdjust',

  // Cash Transactions
  START_CASH: '/startCash',
  START_CASH_REFUND: '/startCashRefund',

  // Pre-Authorization
  START_PRE_AUTH: '/startPreAuth',
  COMPLETION: '/completion',

  // Settlement & Reporting
  START_SETTLE: '/startSettle',
  JOURNAL: '/journal',
  DETAILED_REPORT: '/detailedReport',
  TOTALS_REPORT: '/totalsReport',

  // Device Operations
  GET_STATUS: '/getStatus',
  START_COMM: '/startComm',
  REPRINT: '/reprint',
  CUSTOM_PRINT: '/customPrint',

  // Signature Operations
  GET_SIGNATURE_FILE: '/getSignatureFile',
  CAPTURE_SIGNATURE: '/captureSignature',

  // Verification & Data Collection
  START_CARD_VERIFICATION: '/startCardVerification',
  START_CONFIRMATION_DATA_2_OPTS: '/startConfirmationData2Opts',
  START_CONFIRMATION_DATA_MULT_OPTS: '/startConfirmationDataMultOpts',
  START_DATA_REQUEST: '/startConfirmationDataRequest',

  // Transaction Status
  GET_TRANSACTION_STATUS: '/getTrxStatus',

  // Items List
  ITEMS_LIST: '/itemsList',

  // Scan Code
  SCAN_CODE: '/scanCode',
} as const;

/**
 * Default receipt output configuration
 */
export const DEFAULT_RECEIPT_CONFIG = {
  output: 'BOTH' as const, // BOTH, HTML, PRINTER, NONE
  email: 'yes' as const, // yes, no
} as const;

/**
 * Default transaction configuration
 */
export const DEFAULT_TRANSACTION_CONFIG = {
  manualEntry: 'no' as const,
  forceDuplicate: 'no' as const,
  processCashback: 'no' as const,
} as const;

/**
 * Approval codes and their meanings
 */
export const APPROVAL_CODES = {
  '00': 'APPROVED',
  ST: 'SENDING TRANSACTION ID',
  // Add more codes as documented
} as const;

/**
 * Helper function to validate terminal URL format
 */
export function validateTerminalUrl(url: string): boolean {
  // Should be in format: http://IP:PORT or https://IP:PORT
  const urlPattern = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/;
  return urlPattern.test(url);
}

/**
 * Helper function to build full endpoint URL
 */
export function buildEndpointUrl(endpoint: string): string {
  const config = getEvertecEcrConfig();
  return `${config.terminalUrl}${endpoint}`;
}

/**
 * Helper function to get default headers for terminal requests
 */
export function getDefaultHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    api_key: apiKey,
  };
}
