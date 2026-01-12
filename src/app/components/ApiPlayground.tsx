'use client';

import { useState } from 'react';
import {
  dummyBasicCheckoutRequest,
  dummyPartialPaymentRequest,
  dummySubscriptionRequest,
  dummySubscriptionOnlyRequest,
  generateDummyAuth,
} from '../mockup/checkout';
import {
  mockLogonRequest,
  mockBaseTransactionRequest,
  mockSaleRequest,
  mockVoidRequest,
  mockGetStatusRequest,
  mockSettleRequest,
} from '../mockup/evertec-ecr-mockup';
import type { CreateSessionRequest } from '../types/evertec';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  category: string;
}

interface ApiResponse {
  status: number;
  data: unknown;
}

type ExamplePayload = Partial<Omit<CreateSessionRequest, 'auth'>> | Record<string, unknown> | unknown;

const API_ENDPOINTS: ApiEndpoint[] = [
  // PlacetoPay Checkout
  { id: 'generate-auth', name: 'Generate Auth', method: 'POST', path: '/api/placetopay/auth/generate', description: 'Generate PlacetoPay auth credentials', category: 'PlacetoPay - Checkout' },
  { id: 'create-session', name: 'Create Checkout Session', method: 'POST', path: '/api/placetopay/checkout/create-session', description: 'Creates checkout session', category: 'PlacetoPay - Checkout' },
  { id: 'get-session', name: 'Get Session Status', method: 'POST', path: '/api/placetopay/checkout/get-session/:requestId', description: 'Get session status', category: 'PlacetoPay - Checkout' },
  { id: 'notifications', name: 'Notification Handler', method: 'POST', path: '/api/placetopay/notifications', description: 'Receives async notifications', category: 'PlacetoPay - Checkout' },

  // Evertec ECR - Session
  { id: 'ecr-logon', name: 'Terminal Logon', method: 'POST', path: '/api/evertec/session/logon', description: 'Establish terminal session', category: 'Evertec ECR - Session' },
  { id: 'ecr-logoff', name: 'Terminal Logoff', method: 'POST', path: '/api/evertec/session/logoff', description: 'End terminal session', category: 'Evertec ECR - Session' },

  // Evertec ECR - Sales
  { id: 'ecr-start-sale', name: 'Start Sale', method: 'POST', path: '/api/evertec/sales/start-sale', description: 'Standard card payment', category: 'Evertec ECR - Sales' },
  { id: 'ecr-start-ath-movil-sale', name: 'Start ATH Móvil Sale', method: 'POST', path: '/api/evertec/sales/start-ath-movil-sale', description: 'ATH Móvil payment', category: 'Evertec ECR - Sales' },

  // Evertec ECR - EBT (8 endpoints)
  { id: 'ecr-ebt-foodstamp-purchase', name: 'EBT FoodStamp Purchase', method: 'POST', path: '/api/evertec/ebt/foodstamp-purchase', description: 'EBT FoodStamp purchase', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-foodstamp-refund', name: 'EBT FoodStamp Refund', method: 'POST', path: '/api/evertec/ebt/foodstamp-refund', description: 'EBT FoodStamp refund', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-cash-purchase', name: 'EBT Cash Purchase', method: 'POST', path: '/api/evertec/ebt/cash-purchase', description: 'EBT Cash purchase', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-cash-purchase-cashback', name: 'EBT Cash Purchase + Cashback', method: 'POST', path: '/api/evertec/ebt/cash-purchase-cashback', description: 'EBT Cash with cashback', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-cash-withdrawal', name: 'EBT Cash Withdrawal', method: 'POST', path: '/api/evertec/ebt/cash-withdrawal', description: 'EBT Cash withdrawal', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-balance-inquiry', name: 'EBT Balance Inquiry', method: 'POST', path: '/api/evertec/ebt/balance-inquiry', description: 'Check EBT balance', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-foodstamp-voucher', name: 'EBT FoodStamp Voucher', method: 'POST', path: '/api/evertec/ebt/foodstamp-voucher', description: 'EBT FoodStamp voucher', category: 'Evertec ECR - EBT' },
  { id: 'ecr-ebt-cash-voucher', name: 'EBT Cash Voucher', method: 'POST', path: '/api/evertec/ebt/cash-voucher', description: 'EBT Cash voucher', category: 'Evertec ECR - EBT' },

  // Evertec ECR - Refunds
  { id: 'ecr-start-refund', name: 'Start Refund', method: 'POST', path: '/api/evertec/refunds/start-refund', description: 'Standard refund', category: 'Evertec ECR - Refunds' },
  { id: 'ecr-start-ath-movil-refund', name: 'Start ATH Móvil Refund', method: 'POST', path: '/api/evertec/refunds/start-ath-movil-refund', description: 'ATH Móvil refund', category: 'Evertec ECR - Refunds' },

  // Evertec ECR - Transaction
  { id: 'ecr-void', name: 'Void Transaction', method: 'POST', path: '/api/evertec/transaction/void', description: 'Cancel transaction', category: 'Evertec ECR - Transaction' },
  { id: 'ecr-tip-adjust', name: 'Tip Adjust', method: 'POST', path: '/api/evertec/transaction/tip-adjust', description: 'Adjust tip amount', category: 'Evertec ECR - Transaction' },
  { id: 'ecr-get-status', name: 'Get Transaction Status', method: 'POST', path: '/api/evertec/transaction/get-status', description: 'Poll transaction status', category: 'Evertec ECR - Transaction' },

  // Evertec ECR - Cash
  { id: 'ecr-start-cash', name: 'Start Cash', method: 'POST', path: '/api/evertec/cash/start-cash', description: 'Cash transaction', category: 'Evertec ECR - Cash' },
  { id: 'ecr-start-cash-refund', name: 'Start Cash Refund', method: 'POST', path: '/api/evertec/cash/start-cash-refund', description: 'Cash refund', category: 'Evertec ECR - Cash' },

  // Evertec ECR - PreAuth
  { id: 'ecr-start-preauth', name: 'Start Pre-Authorization', method: 'POST', path: '/api/evertec/preauth/start-preauth', description: 'Pre-authorize amount', category: 'Evertec ECR - PreAuth' },
  { id: 'ecr-completion', name: 'Completion', method: 'POST', path: '/api/evertec/preauth/completion', description: 'Capture pre-auth', category: 'Evertec ECR - PreAuth' },

  // Evertec ECR - Settlement
  { id: 'ecr-settle', name: 'Start Settlement', method: 'POST', path: '/api/evertec/settlement/start-settle', description: 'Close batch (EOD)', category: 'Evertec ECR - Settlement' },

  // Evertec ECR - Reports
  { id: 'ecr-journal', name: 'Journal', method: 'POST', path: '/api/evertec/reports/journal', description: 'Transaction records', category: 'Evertec ECR - Reports' },
  { id: 'ecr-detailed-report', name: 'Detailed Report', method: 'POST', path: '/api/evertec/reports/detailed-report', description: 'Detailed report', category: 'Evertec ECR - Reports' },
  { id: 'ecr-totals-report', name: 'Totals Report', method: 'POST', path: '/api/evertec/reports/totals-report', description: 'Totals summary', category: 'Evertec ECR - Reports' },

  // Evertec ECR - Device
  { id: 'ecr-get-device-status', name: 'Get Device Status', method: 'POST', path: '/api/evertec/device/get-status', description: 'Terminal health check', category: 'Evertec ECR - Device' },
  { id: 'ecr-start-comm', name: 'Communication Test', method: 'POST', path: '/api/evertec/device/start-comm', description: 'Test communication', category: 'Evertec ECR - Device' },
  { id: 'ecr-reprint', name: 'Reprint', method: 'POST', path: '/api/evertec/device/reprint', description: 'Reprint receipt', category: 'Evertec ECR - Device' },
  { id: 'ecr-custom-print', name: 'Custom Print', method: 'POST', path: '/api/evertec/device/custom-print', description: 'Print custom text', category: 'Evertec ECR - Device' },

  // Evertec ECR - Signature
  { id: 'ecr-get-signature', name: 'Get Signature File', method: 'POST', path: '/api/evertec/signature/get-signature-file', description: 'Get signature image', category: 'Evertec ECR - Signature' },
  { id: 'ecr-capture-signature', name: 'Capture Signature', method: 'POST', path: '/api/evertec/signature/capture-signature', description: 'Capture signature', category: 'Evertec ECR - Signature' },

  // Evertec ECR - Verification
  { id: 'ecr-card-verification', name: 'Card Verification', method: 'POST', path: '/api/evertec/verification/start-card-verification', description: 'Verify card', category: 'Evertec ECR - Verification' },
  { id: 'ecr-confirmation-2opts', name: 'Confirmation 2 Options', method: 'POST', path: '/api/evertec/verification/start-confirmation-data-2-opts', description: '2-option prompt', category: 'Evertec ECR - Verification' },
  { id: 'ecr-confirmation-multopts', name: 'Confirmation Multiple Options', method: 'POST', path: '/api/evertec/verification/start-confirmation-data-mult-opts', description: 'Multi-option prompt', category: 'Evertec ECR - Verification' },
  { id: 'ecr-data-request', name: 'Data Request', method: 'POST', path: '/api/evertec/verification/start-data-request', description: 'Request customer data', category: 'Evertec ECR - Verification' },
  { id: 'ecr-scan-code', name: 'Scan Code', method: 'POST', path: '/api/evertec/verification/scan-code', description: 'Scan barcode/QR', category: 'Evertec ECR - Verification' },

  // Evertec ECR - Display
  { id: 'ecr-items-list', name: 'Items List', method: 'POST', path: '/api/evertec/display/items-list', description: 'Display products', category: 'Evertec ECR - Display' },
];

const EXAMPLE_PAYLOADS: Record<string, ExamplePayload> = {
  // PlacetoPay Examples
  'generate-auth': {
    login: '8196b60bef698bac55d8cd9ae5d841b0',
    secretKey: '58FlCK66f83QW2M8',
  },
  'create-session': dummyBasicCheckoutRequest,
  'create-session-basic': dummyBasicCheckoutRequest,
  'create-session-recurring': dummySubscriptionRequest,
  'create-session-subscription': dummySubscriptionOnlyRequest,
  'create-session-partial': dummyPartialPaymentRequest,
  'get-session': { auth: generateDummyAuth() },
  'notifications': { requestId: 123456, status: { status: 'APPROVED', reason: '00', message: 'Approved', date: new Date().toISOString() } },

  // Evertec ECR Examples - Session
  'ecr-logon': mockLogonRequest,
  'ecr-logoff': { reference: '101', last_reference: '100' },

  // Sales
  'ecr-start-sale': mockSaleRequest,
  'ecr-start-ath-movil-sale': { ...mockSaleRequest, terminal_id: '30DR3473' },

  // EBT - all use similar structure with amounts
  'ecr-ebt-foodstamp-purchase': { ...mockBaseTransactionRequest },
  'ecr-ebt-foodstamp-refund': { ...mockBaseTransactionRequest },
  'ecr-ebt-cash-purchase': { ...mockBaseTransactionRequest },
  'ecr-ebt-cash-purchase-cashback': { ...mockSaleRequest, process_cashback: 'yes', amounts: { ...mockSaleRequest.amounts, cashback: '20.00' } },
  'ecr-ebt-cash-withdrawal': { ...mockBaseTransactionRequest, amounts: { total: '100.00' } },
  'ecr-ebt-balance-inquiry': { reference: '80', last_reference: '79', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', receipt_output: 'BOTH', receipt_email: 'yes', manual_entry_indicator: 'no' },
  'ecr-ebt-foodstamp-voucher': { ...mockBaseTransactionRequest, force_duplicate: 'no' },
  'ecr-ebt-cash-voucher': { ...mockBaseTransactionRequest, force_duplicate: 'no' },

  // Refunds
  'ecr-start-refund': { ...mockBaseTransactionRequest },
  'ecr-start-ath-movil-refund': { ...mockBaseTransactionRequest, terminal_id: '30DR3473' },

  // Transaction Management
  'ecr-void': mockVoidRequest,
  'ecr-tip-adjust': { reference: '50', last_reference: '49', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', target_reference: '49', tip: '5.00' },
  'ecr-get-status': mockGetStatusRequest,

  // Cash
  'ecr-start-cash': { ...mockBaseTransactionRequest },
  'ecr-start-cash-refund': { ...mockBaseTransactionRequest },

  // PreAuth
  'ecr-start-preauth': { reference: '124', last_reference: '123', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', amounts: { total: '100.00' }, receipt_output: 'BOTH', receipt_email: 'yes', manual_entry_indicator: 'no', force_duplicate: 'no' },
  'ecr-completion': { reference: '125', last_reference: '124', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', target_reference: '124', amounts: { total: '100.00' }, force_duplicate: 'no', receipt_output: 'BOTH', receipt_email: 'yes' },

  // Settlement
  'ecr-settle': mockSettleRequest,

  // Reports
  'ecr-journal': { reference: '54', last_reference: '53', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', target_reference: 'all' },
  'ecr-detailed-report': { reference: '75', last_reference: '74', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', receipt_output: 'HTML' },
  'ecr-totals-report': { reference: '79', last_reference: '75', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', receipt_output: 'HTML' },

  // Device
  'ecr-get-device-status': { reference: '56', last_reference: '55', session_id: 'REPLACE-WITH-YOUR-SESSION-ID' },
  'ecr-start-comm': { reference: '431', last_reference: '430', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', receipt_output: 'BOTH' },
  'ecr-reprint': { reference: '120', last_reference: '119', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', receipt_output: 'BOTH' },
  'ecr-custom-print': { reference: '20', last_reference: '19', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', receipt_output: 'Custom receipt text here' },

  // Signature
  'ecr-get-signature': { reference: '56', last_reference: '55', session_id: 'REPLACE-WITH-YOUR-SESSION-ID' },
  'ecr-capture-signature': { reference: '200', last_reference: '199', session_id: 'REPLACE-WITH-YOUR-SESSION-ID' },

  // Verification
  'ecr-card-verification': { reference: '220', last_reference: '219', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', force_duplicate: 'no', receipt_output: 'HTML', receipt_email: 'yes', manual_entry_indicator: 'no' },
  'ecr-confirmation-2opts': { reference: '210', last_reference: '206', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', line_1: 'Confirm?', line_2: 'Please select', option_1: 'Yes', option_2: 'No' },
  'ecr-confirmation-multopts': { reference: '211', last_reference: '210', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', line_1: 'Select option', line_2: 'Choose one', option_1: 'Option 1', option_2: 'Option 2', option_3: 'Option 3' },
  'ecr-data-request': { reference: '213', last_reference: '211', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', data_type: 'PHONE', information_requested: 'Enter phone number', default_value: '7871234567' },
  'ecr-scan-code': { reference: '73', last_reference: '71', session_id: 'REPLACE-WITH-YOUR-SESSION-ID' },

  // Display
  'ecr-items-list': { reference: '71', last_reference: '70', session_id: 'REPLACE-WITH-YOUR-SESSION-ID', title: 'Cart Items', products: [{ line_1_left: 'Product 1', line_1_right: '$10.00' }, { line_1_left: 'Product 2', line_1_right: '$20.00' }] },
};

export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('create-session');
  const [selectedExample, setSelectedExample] = useState<string>('create-session-basic');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(EXAMPLE_PAYLOADS['create-session-basic'], null, 2)
  );
  const [requestId, setRequestId] = useState<string>('123456');
  const [trxId, setTrxId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = API_ENDPOINTS.find((e) => e.id === selectedEndpoint);

  // Group endpoints by category
  const groupedEndpoints = API_ENDPOINTS.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  const handleEndpointChange = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
    setResponse(null);
    setError(null);

    // Set default payload based on endpoint
    const defaultPayload = EXAMPLE_PAYLOADS[endpointId] || EXAMPLE_PAYLOADS['create-session-basic'];
    setSelectedExample(endpointId);
    setRequestBody(JSON.stringify(defaultPayload, null, 2));
  };

  const handleExampleChange = (exampleKey: string) => {
    setSelectedExample(exampleKey);
    setRequestBody(JSON.stringify(EXAMPLE_PAYLOADS[exampleKey], null, 2));
  };

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let url = endpoint?.path || '';
      let bodyToSend = requestBody;

      // Handle path parameters
      if (selectedEndpoint === 'get-session') {
        url = url.replace(':requestId', requestId);
      }

      // For ECR get-status, inject trx_id and session_id if provided
      if (selectedEndpoint === 'ecr-get-status' && (trxId || sessionId)) {
        try {
          const bodyObj = JSON.parse(requestBody);
          if (trxId) bodyObj.trx_id = trxId;
          if (sessionId) bodyObj.session_id = sessionId;
          bodyToSend = JSON.stringify(bodyObj, null, 2);
        } catch {
          // If parsing fails, use original body
        }
      }

      const res = await fetch(url, {
        method: endpoint?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint?.method === 'POST' ? bodyToSend : undefined,
      });

      const data = await res.json();
      setResponse({ status: res.status, data });

      // Auto-extract useful values from responses for easier testing
      if (data) {
        if (data.session_id && !sessionId) {
          setSessionId(data.session_id);
        }
        if (data.trx_id && !trxId) {
          setTrxId(data.trx_id);
        }
        if (data.requestId && selectedEndpoint === 'create-session') {
          setRequestId(data.requestId.toString());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Evertec Payment Middleware - API Playground</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive API testing interface for PlacetoPay (online checkout) and Evertec ECR (terminal) integrations
        </p>
      </div>

      {/* Session State Indicator */}
      {(sessionId || trxId || requestId !== '123456') && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Active Session Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {sessionId && (
              <div className="bg-white dark:bg-gray-800 rounded p-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Session ID:</span>
                <p className="font-mono text-xs break-all">{sessionId}</p>
              </div>
            )}
            {trxId && (
              <div className="bg-white dark:bg-gray-800 rounded p-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <p className="font-mono text-xs break-all">{trxId}</p>
              </div>
            )}
            {requestId !== '123456' && (
              <div className="bg-white dark:bg-gray-800 rounded p-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Request ID:</span>
                <p className="font-mono text-xs">{requestId}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Endpoints */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
            <div className="space-y-4">
              {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {endpoints.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => handleEndpointChange(ep.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedEndpoint === ep.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{ep.name}</span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              ep.method === 'POST' ? 'bg-green-500' : 'bg-blue-500'
                            } text-white`}
                          >
                            {ep.method}
                          </span>
                        </div>
                        <p className="text-xs opacity-90 break-all">{ep.path}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Request & Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Endpoint Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{endpoint?.name}</h2>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    endpoint?.category.includes('PlacetoPay')
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {endpoint?.category}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-lg font-semibold ${
                  endpoint?.method === 'POST'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {endpoint?.method}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{endpoint?.description}</p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-sm break-all">
              {endpoint?.path}
            </div>
          </div>

          {/* Request Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Request</h3>
              {selectedEndpoint === 'create-session' && (
                <select
                  value={selectedExample}
                  onChange={(e) => handleExampleChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="create-session-basic">Basic Payment</option>
                  <option value="create-session-recurring">Recurring Payment</option>
                  <option value="create-session-subscription">Subscription (Tokenization Only)</option>
                  <option value="create-session-partial">Partial Payment ⚠️ Requires Setup</option>
                </select>
              )}
            </div>

            {/* Partial Payment Warning */}
            {selectedEndpoint === 'create-session' && selectedExample === 'create-session-partial' && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                      Merchant Account Permissions May Be Required
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      While PlacetoPay documentation shows setting <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">allowPartial: true</code>, some merchant accounts may require additional permissions. If you receive an error stating &ldquo;Partial payment not allowed to your site&rdquo;, contact PlacetoPay support at <a href="mailto:soporte@placetopay.com" className="underline font-medium">soporte@placetopay.com</a> to verify your account has this feature enabled.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Path Parameters */}
            {selectedEndpoint === 'get-session' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Request ID</label>
                <input
                  type="text"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  placeholder="Enter request ID"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            )}

            {/* ECR Status Quick Fields */}
            {selectedEndpoint === 'ecr-get-status' && (
              <div className="mb-4 space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                    💡 These values auto-populate from responses for easier testing
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Session ID</label>
                  <input
                    type="text"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="From logon response"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="From sale response"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            )}

            {endpoint?.method === 'POST' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  spellCheck={false}
                />
              </div>
            )}

            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Executing...' : 'Execute Request'}
            </button>
          </div>

          {/* Response Section */}
          {(response || error) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Response</h3>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-800 dark:text-red-200 font-semibold">Error</p>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {response && (
                <>
                  <div className="mb-4">
                    <span className="text-sm font-medium">Status Code: </span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {response.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Documentation Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PlacetoPay Documentation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            PlacetoPay Documentation
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://docs.placetopay.dev/checkout/authentication/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Authentication Guide
              </a>
            </li>
            <li>
              <a
                href="https://docs.placetopay.dev/checkout/how-checkout-works/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                How Checkout Works
              </a>
            </li>
            <li>
              <a
                href="https://docs.placetopay.dev/checkout/create-session/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create Session Reference
              </a>
            </li>
          </ul>
        </div>

        {/* Evertec ECR Documentation */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Evertec ECR Documentation
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-medium">Reference:</span> ECR API Documentation 01.02.07
            </li>
            <li>
              <span className="font-medium">Total Endpoints:</span> 37/37 (100% ✅)
            </li>
            <li>
              <span className="font-medium">Transaction Flow:</span>
              <ol className="list-decimal list-inside ml-4 mt-1 space-y-1 text-xs">
                <li>Logon → Get session_id</li>
                <li>Start Sale → Get trx_id</li>
                <li>Poll Status → Check result</li>
                <li>Settle (EOD) → Close batch</li>
                <li>Logoff → End session</li>
              </ol>
            </li>
            <li className="mt-3">
              <a
                href="/evertec-integration"
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                View Full Integration Guide
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
