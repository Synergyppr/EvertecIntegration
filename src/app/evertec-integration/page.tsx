/**
 * Evertec ECR Integration Documentation Page
 * Comprehensive guide for terminal integration
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evertec ECR Integration Guide | Payment Middleware',
  description: 'Complete documentation for Evertec ECR terminal integration',
};

export default function EvertecIntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Evertec ECR Integration Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Complete documentation for integrating with Evertec ECR payment terminals
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Table of Contents
          </h2>
          <nav className="space-y-2">
            <a href="#overview" className="block text-blue-600 dark:text-blue-400 hover:underline">
              1. Overview
            </a>
            <a href="#authentication" className="block text-blue-600 dark:text-blue-400 hover:underline">
              2. Authentication
            </a>
            <a href="#session-flow" className="block text-blue-600 dark:text-blue-400 hover:underline">
              3. Session Flow
            </a>
            <a href="#endpoints" className="block text-blue-600 dark:text-blue-400 hover:underline">
              4. API Endpoints
            </a>
            <a href="#transaction-types" className="block text-blue-600 dark:text-blue-400 hover:underline">
              5. Transaction Types
            </a>
            <a href="#error-handling" className="block text-blue-600 dark:text-blue-400 hover:underline">
              6. Error Handling
            </a>
            <a href="#examples" className="block text-blue-600 dark:text-blue-400 hover:underline">
              7. Usage Examples
            </a>
          </nav>
        </div>

        {/* Overview */}
        <section id="overview" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Overview
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Evertec ECR (Electronic Cash Register) API enables card-present transactions through physical payment terminals.
              This integration supports a comprehensive range of payment operations including sales, refunds, EBT transactions,
              and terminal management.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Key Features
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Card-Present Transactions</strong>: Process payments with physical card reader</li>
              <li><strong>ATH Móvil Support</strong>: Native support for Puerto Rico's mobile payment system</li>
              <li><strong>EBT Transactions</strong>: Full Electronic Benefits Transfer support (FoodStamp & Cash)</li>
              <li><strong>Pre-Authorization</strong>: Hold and capture payment flows</li>
              <li><strong>Refunds & Voids</strong>: Cancel or reverse transactions</li>
              <li><strong>Settlement</strong>: End-of-day batch processing</li>
              <li><strong>Reporting</strong>: Transaction journals and detailed reports</li>
              <li><strong>Device Management</strong>: Terminal health checks and communication tests</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Terminal Communication
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
              <p className="text-gray-800 dark:text-gray-200">
                Base URL: <span className="text-green-600 dark:text-green-400">http://192.168.x.x:2030</span>
              </p>
              <p className="text-gray-800 dark:text-gray-200 mt-2">
                Protocol: REST API over HTTP
              </p>
              <p className="text-gray-800 dark:text-gray-200 mt-2">
                Format: JSON request/response
              </p>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            2. Authentication
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All requests to the Evertec ECR API require authentication via API key and terminal identification.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Required Configuration
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm mb-4">
              <pre className="text-gray-800 dark:text-gray-200">
{`# Environment Variables
EVERTEC_ECR_TERMINAL_URL=http://192.168.0.212:2030
EVERTEC_ECR_API_KEY=your_api_key_here
EVERTEC_ECR_TERMINAL_ID=30DR3479
EVERTEC_ECR_STATION_NUMBER=1234
EVERTEC_ECR_CASHIER_ID=0001
EVERTEC_ECR_TIMEOUT=30000`}
              </pre>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Base Request Structure
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Every request includes these base fields:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
              <pre className="text-gray-800 dark:text-gray-200">
{`{
  "app_key": "b443a6cd95a8388d4b3ccea9f3762d41",
  "station_number": "1234",
  "terminal_id": "30DR3479",
  "cashier_id": "0001",
  "reference": "1",
  "last_reference": "0"
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Session Flow */}
        <section id="session-flow" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            3. Session Flow
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Terminal operations require an active session. All transactions must occur within a valid session.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Standard Transaction Flow
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Logon</strong> - Establish terminal session
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-2 ml-6 font-mono text-sm">
                  POST /api/evertec/session/logon
                </div>
              </li>
              <li className="mt-4">
                <strong>Transaction</strong> - Process payment(s)
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-2 ml-6 font-mono text-sm">
                  POST /api/evertec/sales/start-sale
                </div>
              </li>
              <li className="mt-4">
                <strong>Status Check</strong> - Poll for completion
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-2 ml-6 font-mono text-sm">
                  POST /api/evertec/transaction/get-status
                </div>
              </li>
              <li className="mt-4">
                <strong>Settlement</strong> - Close batch (end of day)
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-2 ml-6 font-mono text-sm">
                  POST /api/evertec/settlement/start-settle
                </div>
              </li>
              <li className="mt-4">
                <strong>Logoff</strong> - End session
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-2 ml-6 font-mono text-sm">
                  POST /api/evertec/session/logoff
                </div>
              </li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mt-6">
              <p className="text-blue-800 dark:text-blue-300">
                <strong>Important:</strong> The session_id returned from logon must be included in all subsequent requests
                until logoff. Reference numbers must increment sequentially for each request.
              </p>
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section id="endpoints" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            4. API Endpoints (37 Total)
          </h2>
          <div className="prose dark:prose-invert max-w-none">

            {/* Session Management */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Session Management (2)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/session/logon</code> - Establish terminal session</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/session/logoff</code> - End terminal session</li>
            </ul>

            {/* Sales */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Sales (2)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/sales/start-sale</code> - Standard card payment</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/sales/start-ath-movil-sale</code> - ATH Móvil payment</li>
            </ul>

            {/* EBT */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              EBT Transactions (8)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/foodstamp-purchase</code> - EBT FoodStamp purchase</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/foodstamp-refund</code> - EBT FoodStamp refund</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/cash-purchase</code> - EBT Cash purchase</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/cash-purchase-cashback</code> - EBT Cash with cashback</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/cash-withdrawal</code> - EBT Cash withdrawal</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/balance-inquiry</code> - Check EBT balance</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/foodstamp-voucher</code> - EBT FoodStamp voucher</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/ebt/cash-voucher</code> - EBT Cash voucher</li>
            </ul>

            {/* Refunds */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Refunds (2)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/refunds/start-refund</code> - Standard refund</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/refunds/start-ath-movil-refund</code> - ATH Móvil refund</li>
            </ul>

            {/* Transaction Management */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Transaction Management (3)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/transaction/void</code> - Cancel transaction</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/transaction/tip-adjust</code> - Adjust tip amount</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/transaction/get-status</code> - Poll transaction status</li>
            </ul>

            {/* Cash */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Cash Transactions (2)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/cash/start-cash</code> - Cash transaction</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/cash/start-cash-refund</code> - Cash refund</li>
            </ul>

            {/* PreAuth */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Pre-Authorization (2)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/preauth/start-preauth</code> - Pre-authorize amount</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/preauth/completion</code> - Capture pre-authorization</li>
            </ul>

            {/* Settlement */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Settlement (1)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/settlement/start-settle</code> - Close batch</li>
            </ul>

            {/* Reports */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Reports (3)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/reports/journal</code> - Transaction records</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/reports/detailed-report</code> - Detailed report</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/reports/totals-report</code> - Totals summary</li>
            </ul>

            {/* Device */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Device Operations (4)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/device/get-status</code> - Terminal health check</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/device/start-comm</code> - Test communication</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/device/reprint</code> - Reprint receipt</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/device/custom-print</code> - Print custom text</li>
            </ul>

            {/* Signature */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Signature (2)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/signature/get-signature-file</code> - Get signature image</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/signature/capture-signature</code> - Capture signature</li>
            </ul>

            {/* Verification */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Verification (5)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/verification/start-card-verification</code> - Verify card</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/verification/start-confirmation-data-2-opts</code> - 2-option prompt</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/verification/start-confirmation-data-mult-opts</code> - Multi-option prompt</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/verification/start-data-request</code> - Request customer data</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/verification/scan-code</code> - Scan barcode/QR</li>
            </ul>

            {/* Display */}
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6 mb-3">
              Display (1)
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/evertec/display/items-list</code> - Display products</li>
            </ul>
          </div>
        </section>

        {/* Transaction Types */}
        <section id="transaction-types" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            5. Transaction Types
          </h2>
          <div className="prose dark:prose-invert max-w-none space-y-6">

            {/* Standard Sale */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Standard Card Sale
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Process traditional card payments (credit, debit). Customer inserts/swipes card at terminal.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
                <pre className="text-gray-800 dark:text-gray-200">
{`POST /api/evertec/sales/start-sale
{
  "session_id": "abc123",
  "reference": "10",
  "last_reference": "9",
  "amount": "25.50"
}`}
                </pre>
              </div>
            </div>

            {/* ATH Móvil */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ATH Móvil Sale
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Puerto Rico mobile payment system. Customer scans QR code with ATH Móvil app.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
                <pre className="text-gray-800 dark:text-gray-200">
{`POST /api/evertec/sales/start-ath-movil-sale
{
  "session_id": "abc123",
  "reference": "11",
  "last_reference": "10",
  "amount": "15.00"
}`}
                </pre>
              </div>
            </div>

            {/* EBT */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                EBT Transactions
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Electronic Benefits Transfer for government assistance programs (SNAP/FoodStamps, Cash benefits).
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
                <pre className="text-gray-800 dark:text-gray-200">
{`// FoodStamp Purchase
POST /api/evertec/ebt/foodstamp-purchase
{
  "session_id": "abc123",
  "reference": "12",
  "last_reference": "11",
  "amount": "50.00"
}

// Cash Purchase with Cashback
POST /api/evertec/ebt/cash-purchase-cashback
{
  "session_id": "abc123",
  "reference": "13",
  "last_reference": "12",
  "amount": "20.00",
  "cashback_amount": "10.00"
}

// Balance Inquiry
POST /api/evertec/ebt/balance-inquiry
{
  "session_id": "abc123",
  "reference": "14",
  "last_reference": "13"
}`}
                </pre>
              </div>
            </div>

            {/* Pre-Auth */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Pre-Authorization Flow
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Two-step process: authorize amount, then capture later (useful for tips, final amount adjustments).
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
                <pre className="text-gray-800 dark:text-gray-200">
{`// Step 1: Pre-authorize
POST /api/evertec/preauth/start-preauth
{
  "session_id": "abc123",
  "reference": "15",
  "last_reference": "14",
  "amount": "100.00"
}

// Step 2: Complete (capture funds)
POST /api/evertec/preauth/completion
{
  "session_id": "abc123",
  "reference": "16",
  "last_reference": "15",
  "trx_id": "original-preauth-trx-id",
  "amount": "100.00"
}`}
                </pre>
              </div>
            </div>

            {/* Refunds */}
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Refunds & Voids
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Cancel transactions (void) or process refunds for completed sales.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
                <pre className="text-gray-800 dark:text-gray-200">
{`// Void (cancel recent transaction)
POST /api/evertec/transaction/void
{
  "session_id": "abc123",
  "reference": "20",
  "last_reference": "19",
  "trx_id": "transaction-to-cancel"
}

// Refund
POST /api/evertec/refunds/start-refund
{
  "session_id": "abc123",
  "reference": "21",
  "last_reference": "20",
  "amount": "25.50"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section id="error-handling" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            6. Error Handling
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The API returns standardized error responses for all failure scenarios.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              HTTP Status Codes
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">200</code> - Success</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">400</code> - Bad Request (validation error)</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">401</code> - Unauthorized (invalid API key)</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">500</code> - Server Error</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">502</code> - Terminal Communication Error</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Error Response Format
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm mb-4">
              <pre className="text-gray-800 dark:text-gray-200">
{`{
  "error": "Validation Error",
  "message": "Missing required field: session_id",
  "details": {
    "field": "session_id",
    "required": true
  }
}`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Common Error Scenarios
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Missing Required Fields</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Ensure all required fields (reference, last_reference, session_id) are included in requests.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Invalid Session ID</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Session may have expired or was never established. Perform logon again.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Reference Number Mismatch</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Reference numbers must increment sequentially. last_reference must match previous request's reference.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terminal Offline</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Cannot connect to terminal. Verify terminal IP address and network connectivity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section id="examples" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            7. Usage Examples
          </h2>
          <div className="prose dark:prose-invert max-w-none">

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Complete Transaction Flow
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
              <pre className="text-gray-800 dark:text-gray-200">
{`// 1. Establish session
const logonResponse = await fetch('/api/evertec/session/logon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '1',
    last_reference: '0'
  })
});
const { session_id } = await logonResponse.json();

// 2. Process sale
const saleResponse = await fetch('/api/evertec/sales/start-sale', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id,
    reference: '2',
    last_reference: '1',
    amount: '50.00'
  })
});
const { trx_id } = await saleResponse.json();

// 3. Poll for status (repeat until complete)
const statusResponse = await fetch('/api/evertec/transaction/get-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id,
    reference: '3',
    last_reference: '2',
    trx_id
  })
});
const status = await statusResponse.json();

// 4. End session
await fetch('/api/evertec/session/logoff', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id,
    reference: '4',
    last_reference: '3'
  })
});`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              Refund Example
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
              <pre className="text-gray-800 dark:text-gray-200">
{`// Void recent transaction (same day)
const voidResponse = await fetch('/api/evertec/transaction/void', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'active-session-id',
    reference: '10',
    last_reference: '9',
    trx_id: 'original-transaction-id'
  })
});

// Or process standalone refund
const refundResponse = await fetch('/api/evertec/refunds/start-refund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'active-session-id',
    reference: '11',
    last_reference: '10',
    amount: '50.00'
  })
});`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              EBT Balance Check
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
              <pre className="text-gray-800 dark:text-gray-200">
{`const balanceResponse = await fetch('/api/evertec/ebt/balance-inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'active-session-id',
    reference: '5',
    last_reference: '4'
  })
});

const balance = await balanceResponse.json();
console.log('FoodStamp Balance:', balance.foodstamp_balance);
console.log('Cash Balance:', balance.cash_balance);`}
              </pre>
            </div>
          </div>
        </section>

        {/* Back to Playground */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Return to API Playground
          </a>
        </div>
      </div>
    </div>
  );
}
