/**
 * Evertec ECR (Electronic Cash Register) API Types
 * Based on ECR API Documentation 01.02.07
 *
 * This file contains all type definitions for the Evertec terminal integration.
 * The terminal communicates over HTTP/REST and processes card-present transactions.
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

/**
 * Receipt output destination
 */
export type ReceiptOutput = 'BOTH' | 'HTML' | 'PRINTER' | 'NONE' | 'both';

/**
 * Yes/No indicator
 */
export type YesNo = 'yes' | 'no';

/**
 * Data type for data request operations
 */
export type DataRequestType =
  | 'PHONE'
  | 'EMAIL'
  | 'NUMERIC'
  | 'ALPHANUMERIC'
  | 'ZIP_CODE';

// ============================================================================
// AMOUNT STRUCTURES
// ============================================================================

/**
 * Transaction amounts breakdown
 *
 * IMPORTANT TAX REQUIREMENT (Puerto Rico Compliance):
 * When using tax fields, you MUST provide BOTH base amounts AND calculated taxes:
 * - base_state_tax + state_tax (for items subject to standard state tax rate)
 * - base_reduced_tax + reduced_tax (for items subject to reduced state tax rate)
 *
 * Even if you have no items with reduced tax, you MUST include:
 * base_reduced_tax: "0.00" and reduced_tax: "0.00"
 *
 * This is a terminal validation requirement. Omitting these fields will result in:
 * Error: "AMOUNT FOR STATE REDUCED TAX NEEDED" (Approval Code: ZY)
 */
export interface TransactionAmounts {
  /** Total transaction amount */
  total: string;
  /** Base amount subject to standard state tax rate (requires base_reduced_tax if provided) */
  base_state_tax?: string;
  /** Base amount subject to reduced state tax rate (required when base_state_tax is provided, use "0.00" if no reduced items) */
  base_reduced_tax?: string;
  /** Tip amount */
  tip?: string;
  /** Calculated state tax on base_state_tax (requires reduced_tax if provided) */
  state_tax?: string;
  /** Calculated reduced tax on base_reduced_tax (required when state_tax is provided, use "0.00" if no reduced items) */
  reduced_tax?: string;
  /** City tax amount */
  city_tax?: string;
  /** Cashback amount */
  cashback?: string;
}

// ============================================================================
// BASE REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Base fields present in all requests
 */
export interface BaseRequest {
  /** Terminal identifier provided by Evertec */
  terminal_id: string;
  /** Station number identifier */
  station_number: string;
  /** Cashier identifier */
  cashier_id: string;
  /** Current transaction reference */
  reference: string;
  /** Previous transaction reference */
  last_reference: string;
  /** Session ID obtained from logon */
  session_id?: string;
}

/**
 * Base fields present in all responses
 */
export interface BaseResponse {
  /** Transaction reference */
  reference: string;
  /** Terminal virtual ID */
  terminal_vid?: string;
  /** Terminal ID */
  terminal_id?: string;
  /** Approval code */
  approval_code: string;
  /** Station number */
  station_number: string;
  /** Cashier ID */
  cashier_id: string;
  /** Last reference */
  last_reference: string;
  /** Response message */
  response_message: string;
  /** Merchant ID */
  merchant_id?: string;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Logon request - establishes session with terminal
 */
export interface LogonRequest extends BaseRequest {
  // Only base fields required
}

/**
 * Logon response - returns session ID
 */
export interface LogonResponse extends BaseResponse {
  /** Session ID for subsequent requests */
  session_id: string;
}

/**
 * Logoff request - ends session with terminal
 */
export interface LogoffRequest extends BaseRequest {
  // Only base fields required
}

/**
 * Logoff response
 */
export interface LogoffResponse extends BaseResponse {
  // Only base fields
}

// ============================================================================
// SALE TRANSACTIONS
// ============================================================================

/**
 * Sale request - standard card payment
 */
export interface StartSaleRequest extends BaseRequest {
  /** Email receipt indicator */
  receipt_email: YesNo;
  /** Process cashback indicator */
  process_cashback: YesNo;
  /** Transaction amounts */
  amounts: TransactionAmounts;
  /** Receipt output destination */
  receipt_output: ReceiptOutput;
  /** Manual entry indicator */
  manual_entry_indicator: YesNo;
  /** Force duplicate transaction */
  force_duplicate?: YesNo;
}

/**
 * Transaction response with trx_id
 */
export interface TransactionResponse extends BaseResponse {
  /** Unique transaction ID */
  trx_id: string;
  /** Transaction amounts */
  amounts: TransactionAmounts;
  /** Receipt output */
  receipt_output: ReceiptOutput;
  /** Receipt email indicator */
  receipt_email: YesNo;
  /** Manual entry indicator */
  manual_entry_indicator: YesNo;
  /** Process cashback indicator */
  process_cashback?: YesNo;
  /** Session ID */
  session_id?: string;
  /** Force duplicate */
  force_duplicate?: YesNo;
}

/**
 * ATH Movil Sale request (Puerto Rico mobile payment)
 */
export interface StartAthMovilSaleRequest extends StartSaleRequest {
  // Same as StartSaleRequest
}

/**
 * ATH Movil Sale response
 */
export interface StartAthMovilSaleResponse extends TransactionResponse {
  // Same as TransactionResponse
}

// ============================================================================
// EBT TRANSACTIONS (Electronic Benefits Transfer)
// ============================================================================

/**
 * EBT FoodStamp Purchase request
 */
export interface StartEbtFoodStampPurchaseRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
  force_duplicate?: YesNo;
}

/**
 * EBT FoodStamp Refund request
 */
export interface StartEbtFoodStampRefundRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
}

/**
 * EBT Cash Purchase request
 */
export interface StartEbtCashPurchaseRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
}

/**
 * EBT Cash Purchase with Cashback request
 */
export interface StartEbtCashPurchaseCashbackRequest extends BaseRequest {
  receipt_email: YesNo;
  process_cashback: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
  force_duplicate: YesNo;
}

/**
 * EBT Cash Withdrawal request
 */
export interface StartEbtCashWithdrawalRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: {
    total: string;
  };
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
}

/**
 * EBT Balance Inquiry request
 */
export interface StartEbtBalanceInquiryRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
  manual_entry_indicator: YesNo;
}

/**
 * EBT FoodStamp Voucher request
 */
export interface StartEbtFoodStampVoucherRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
  force_duplicate: YesNo;
}

/**
 * EBT Cash Voucher request
 */
export interface StartEbtCashVoucherRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
  force_duplicate: YesNo;
}

// ============================================================================
// REFUND TRANSACTIONS
// ============================================================================

/**
 * Refund request
 */
export interface StartRefundRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
  force_duplicate?: YesNo;
}

/**
 * ATH Movil Refund request
 */
export interface StartAthMovilRefundRequest extends BaseRequest {
  receipt_email: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  manual_entry_indicator: YesNo;
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

/**
 * Void request - cancels a previous transaction
 */
export interface VoidRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
  /** Reference of transaction to void */
  target_reference: string;
}

/**
 * Void response
 */
export interface VoidResponse extends BaseResponse {
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
  session_id: string;
  target_reference: string;
}

/**
 * Tip Adjust request - adjusts tip on a completed transaction
 */
export interface TipAdjustRequest extends BaseRequest {
  /** Reference of transaction to adjust */
  target_reference: string;
  /** New tip amount */
  tip: string;
}

/**
 * Tip Adjust response
 */
export interface TipAdjustResponse extends BaseResponse {
  target_reference: string;
  tip: string;
  session_id: string;
}

// ============================================================================
// CASH TRANSACTIONS
// ============================================================================

/**
 * Cash transaction request
 */
export interface StartCashRequest extends BaseRequest {
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
}

/**
 * Cash refund request
 */
export interface StartCashRefundRequest extends BaseRequest {
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
}

// ============================================================================
// PRE-AUTHORIZATION & COMPLETION
// ============================================================================

/**
 * Pre-Authorization request - reserves amount on card
 */
export interface StartPreAuthRequest extends BaseRequest {
  amounts: {
    total: string;
  };
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
  force_duplicate: YesNo;
  manual_entry_indicator: YesNo;
}

/**
 * Completion request - captures a pre-authorized transaction
 */
export interface CompletionRequest extends BaseRequest {
  /** Reference of pre-auth transaction */
  target_reference: string;
  force_duplicate: YesNo;
  amounts: TransactionAmounts;
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
}

// ============================================================================
// SETTLEMENT & REPORTING
// ============================================================================

/**
 * Settle request - closes batch and settles transactions
 */
export interface StartSettleRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
}

/**
 * Settle response
 */
export interface StartSettleResponse extends BaseResponse {
  receipt_output: ReceiptOutput;
  session_id: string;
}

/**
 * Journal request - retrieves transaction records
 */
export interface JournalRequest extends BaseRequest {
  /** Target reference or 'all' for all transactions */
  target_reference: string;
}

/**
 * Journal response
 */
export interface JournalResponse extends BaseResponse {
  session_id: string;
  target_reference: string;
}

/**
 * Detailed Report request
 */
export interface DetailedReportRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
}

/**
 * Totals Report request
 */
export interface TotalsReportRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
}

// ============================================================================
// DEVICE OPERATIONS
// ============================================================================

/**
 * Device Status request - checks terminal health
 */
export interface GetStatusRequest extends BaseRequest {
  // Only base fields
}

/**
 * Device Status response
 */
export interface GetStatusResponse extends BaseResponse {
  /** Device status information */
  status?: string;
  /** Additional status details */
  details?: Record<string, unknown>;
}

/**
 * Communication Test request
 */
export interface StartCommRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
}

/**
 * Reprint request - reprints last receipt
 */
export interface ReprintRequest extends BaseRequest {
  receipt_output: ReceiptOutput;
}

/**
 * Custom Print request - prints custom text
 */
export interface CustomPrintRequest extends BaseRequest {
  /** Text to print */
  receipt_output: string;
}

// ============================================================================
// SIGNATURE OPERATIONS
// ============================================================================

/**
 * Get Signature File request - retrieves signature image
 */
export interface GetSignatureFileRequest extends BaseRequest {
  // Only base fields
}

/**
 * Get Signature File response
 */
export interface GetSignatureFileResponse extends BaseResponse {
  /** Base64 encoded signature image */
  signature_data?: string;
  session_id: string;
}

/**
 * Capture Signature request - prompts for signature capture
 */
export interface CaptureSignatureRequest extends BaseRequest {
  // Only base fields
}

/**
 * Capture Signature response
 */
export interface CaptureSignatureResponse extends BaseResponse {
  session_id: string;
}

// ============================================================================
// VERIFICATION & DATA COLLECTION
// ============================================================================

/**
 * Card Verification request - verifies card without charging
 */
export interface StartCardVerificationRequest extends BaseRequest {
  force_duplicate: YesNo;
  receipt_output: ReceiptOutput;
  receipt_email: YesNo;
  manual_entry_indicator: YesNo;
  /** Additional verification fields */
  allow_debit?: YesNo;
}

/**
 * Confirmation Data with 2 Options request
 */
export interface StartConfirmationData2OptsRequest extends BaseRequest {
  /** Display line 1 */
  line_1: string;
  /** Display line 2 */
  line_2: string;
  /** Display line 3 */
  line_3?: string;
  /** Display line 4 */
  line_4?: string;
  /** Display line 5 */
  line_5?: string;
  /** Option 1 text */
  option_1: string;
  /** Option 2 text */
  option_2: string;
}

/**
 * Confirmation Data with Multiple Options request
 */
export interface StartConfirmationDataMultOptsRequest extends BaseRequest {
  /** Display line 1 */
  line_1: string;
  /** Display line 2 */
  line_2: string;
  /** Option 1 text */
  option_1: string;
  /** Option 2 text */
  option_2: string;
  /** Option 3 text */
  option_3?: string;
  /** Option 4 text */
  option_4?: string;
  /** Option 5 text */
  option_5?: string;
}

/**
 * Data Request - prompts customer for input
 */
export interface StartDataRequestRequest extends BaseRequest {
  /** Type of data to request */
  data_type: DataRequestType;
  /** Prompt message to display */
  information_requested: string;
  /** Default value to prefill */
  default_value?: string;
}

/**
 * Data Request response
 */
export interface DataRequestResponse extends BaseResponse {
  /** Data entered by customer */
  customer_data?: string;
  session_id: string;
}

// ============================================================================
// TRANSACTION STATUS
// ============================================================================

/**
 * Get Transaction Status request - polls for transaction result
 */
export interface GetTransactionStatusRequest {
  session_id: string;
  terminal_id: string;
  station_number: string;
  cashier_id: string;
  /** Transaction ID to check */
  trx_id: string;
}

/**
 * Transaction Status response
 */
export interface GetTransactionStatusResponse {
  /** Transaction ID */
  trx_id: string;
  /** Current status */
  status: string;
  /** Status message */
  message: string;
  /** Transaction details if completed */
  transaction?: TransactionResponse;
  /** Error details if failed */
  error?: string;
}

// ============================================================================
// ITEMS LIST (DISPLAY)
// ============================================================================

/**
 * Product line item for display
 */
export interface ProductLineItem {
  /** Left-aligned text for line 1 */
  line_1_left: string;
  /** Right-aligned text for line 1 */
  line_1_right: string;
  /** Left-aligned text for line 2 */
  line_2_left?: string;
  /** Right-aligned text for line 2 */
  line_2_right?: string;
}

/**
 * Items List request - displays products on terminal
 */
export interface ItemsListRequest extends BaseRequest {
  /** Title to display */
  title: string;
  /** List of products to display */
  products: ProductLineItem[];
}

/**
 * Items List response
 */
export interface ItemsListResponse extends BaseResponse {
  session_id: string;
}

// ============================================================================
// SCAN CODE
// ============================================================================

/**
 * Scan Code request - initiates barcode/QR scan
 */
export interface ScanCodeRequest extends BaseRequest {
  // Only base fields
}

/**
 * Scan Code response
 */
export interface ScanCodeResponse extends BaseResponse {
  /** Scanned code data */
  scanned_code?: string;
  session_id: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error response from terminal
 */
export interface EvertecEcrError {
  /** Error code */
  error_code: string;
  /** Error message */
  error_message: string;
  /** Additional error details */
  details?: string;
  /** Request reference if available */
  reference?: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Evertec ECR configuration
 */
export interface EvertecEcrConfig {
  /** Terminal base URL (IP:PORT) */
  terminalUrl: string;
  /** API key for terminal authentication */
  apiKey: string;
  /** Terminal ID */
  terminalId: string;
  /** Default station number */
  stationNumber: string;
  /** Default cashier ID */
  cashierId: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}
