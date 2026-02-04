/**
 * Split Payment Examples
 * Real-world examples of split payment requests based on ECR requirements
 */

/**
 * Example 1: VISA + ATH Movil Split (from spreadsheet scenario)
 *
 * Total: $6.40
 * - Part 1 (VISA): $3.74 (58.438%)
 * - Part 2 (ATH Movil): $2.00 (31.250%)
 * - Part 3 (Cash): $0.66 (10.312%)
 */
export const exampleVISAandATHMovilSplit = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '1234',
  reference: '100',
  last_reference: '99',
  session_id: 'Q9QS9-WDNEX-I9LC2-4UMHZ',
  receipt_email: 'yes',
  amounts: {
    total: '6.40',
    base_state_tax: '5.74',
    base_reduced_tax: '0.00',
    state_tax: '0.60',
    reduced_tax: '0.00',
    city_tax: '0.06',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
  splits: [
    {
      payment_method: 'card',
      percentage: 58.438,
      label: 'VISA Partial Payment',
    },
    {
      payment_method: 'ath-movil',
      percentage: 31.25,
      label: 'ATH Movil Payment',
    },
    {
      payment_method: 'card',
      percentage: 10.312,
      label: 'Cash/Card Payment',
    },
  ],
  polling_interval: 2000,
  max_polling_attempts: 60,
};

/**
 * Example 2: 50/50 Split between two cards
 *
 * Scenario: Customer wants to split payment evenly across two credit cards
 */
export const example5050Split = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '1234',
  reference: '200',
  last_reference: '199',
  session_id: 'ABC12-DEF34-GHI56-JKL78',
  receipt_email: 'yes',
  amounts: {
    total: '100.00',
    base_state_tax: '90.00',
    base_reduced_tax: '0.00',
    state_tax: '9.45',
    reduced_tax: '0.00',
    city_tax: '0.55',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
  splits: [
    {
      payment_method: 'card',
      percentage: 50.0,
      label: 'First Card',
    },
    {
      payment_method: 'card',
      percentage: 50.0,
      label: 'Second Card',
    },
  ],
};

/**
 * Example 3: Partial payment with ATH Movil covering remainder
 *
 * Scenario: Customer pays $20 with card, remainder with ATH Movil
 * Total: $50.00
 */
export const examplePartialCardFullATHMovil = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '1234',
  reference: '300',
  last_reference: '299',
  session_id: 'XYZ12-ABC34-DEF56-GHI78',
  receipt_email: 'yes',
  amounts: {
    total: '50.00',
    base_state_tax: '45.00',
    base_reduced_tax: '0.00',
    state_tax: '4.73',
    reduced_tax: '0.00',
    city_tax: '0.27',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
  splits: [
    {
      payment_method: 'card',
      percentage: 40.0,
      label: 'Card Payment ($20)',
    },
    {
      payment_method: 'ath-movil',
      percentage: 60.0,
      label: 'ATH Movil Remainder ($30)',
    },
  ],
};

/**
 * Example 4: Complex 3-way split with mixed payment methods
 *
 * Scenario: Gift card + Credit card + ATH Movil
 * Total: $200.00
 */
export const exampleComplexSplit = {
  terminal_id: '30DR3479',
  station_number: '1234',
  cashier_id: '1234',
  reference: '400',
  last_reference: '399',
  session_id: 'QWE12-RTY34-UIO56-PAS78',
  receipt_email: 'yes',
  amounts: {
    total: '200.00',
    base_state_tax: '180.00',
    base_reduced_tax: '0.00',
    state_tax: '18.90',
    reduced_tax: '0.00',
    city_tax: '1.10',
  },
  receipt_output: 'BOTH',
  manual_entry_indicator: 'no',
  splits: [
    {
      payment_method: 'card',
      percentage: 25.0,
      label: 'Gift Card ($50)',
    },
    {
      payment_method: 'card',
      percentage: 50.0,
      label: 'Credit Card ($100)',
    },
    {
      payment_method: 'ath-movil',
      percentage: 25.0,
      label: 'ATH Movil ($50)',
    },
  ],
};

/**
 * Example 5: Simple two-part split (most common use case)
 *
 * Scenario: Customer wants to use two different cards
 */
export const exampleSimpleTwoPartSplit = {
  reference: '500',
  last_reference: '499',
  session_id: 'SESSION-ID-HERE',
  amounts: {
    total: '75.50',
    base_state_tax: '68.00',
    base_reduced_tax: '0.00',
    state_tax: '7.14',
    reduced_tax: '0.00',
    city_tax: '0.36',
  },
  splits: [
    {
      payment_method: 'card',
      percentage: 60.0,
      label: 'First Card',
    },
    {
      payment_method: 'card',
      percentage: 40.0,
      label: 'Second Card',
    },
  ],
};

/**
 * Expected Response Format
 */
export const exampleSuccessResponse = {
  split_trx_id: 'SPT-1738195234567-ABC123',
  status: 'completed',
  message: 'All split payments completed successfully',
  parts: [
    {
      part_number: 1,
      payment_method: 'card',
      label: 'VISA Partial Payment',
      trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
      status: 'approved',
      message: 'Transaction approved',
      amounts: {
        total: '3.74',
        base_state_tax: '3.35',
        base_reduced_tax: '0.00',
        state_tax: '0.35',
        reduced_tax: '0.00',
        city_tax: '0.04',
      },
      transaction: {
        approval_code: '00',
        reference: '100',
        response_message: 'APPROVED',
        trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
      },
      started_at: '2025-01-29T10:00:00.000Z',
      completed_at: '2025-01-29T10:00:15.000Z',
    },
    {
      part_number: 2,
      payment_method: 'ath-movil',
      label: 'ATH Movil Payment',
      trx_id: '52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d',
      status: 'approved',
      message: 'Transaction approved',
      amounts: {
        total: '2.00',
        base_state_tax: '1.79',
        base_reduced_tax: '0.00',
        state_tax: '0.19',
        reduced_tax: '0.00',
        city_tax: '0.02',
      },
      transaction: {
        approval_code: '00',
        reference: '101',
        response_message: 'APPROVED',
        trx_id: '52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d',
      },
      started_at: '2025-01-29T10:00:16.000Z',
      completed_at: '2025-01-29T10:00:30.000Z',
    },
  ],
  reference: '100',
  total_amounts: {
    total: '6.40',
    base_state_tax: '5.74',
    base_reduced_tax: '0.00',
    state_tax: '0.60',
    reduced_tax: '0.00',
    city_tax: '0.06',
  },
};

/**
 * Status Check Request Example
 */
export const exampleStatusCheckRequest = {
  split_trx_id: 'SPT-1738195234567-ABC123',
  session_id: 'Q9QS9-WDNEX-I9LC2-4UMHZ',
};

/**
 * Processing Status Response Example
 */
export const exampleProcessingResponse = {
  split_trx_id: 'SPT-1738195234567-ABC123',
  status: 'processing',
  message: 'Processing part 2 of 3',
  parts: [
    {
      part_number: 1,
      payment_method: 'card',
      label: 'VISA Partial Payment',
      trx_id: '41bf40de-2db5-4a5b-87d7-d366e06b1b0c',
      status: 'approved',
      message: 'Transaction approved',
      amounts: { total: '3.74' },
      started_at: '2025-01-29T10:00:00.000Z',
      completed_at: '2025-01-29T10:00:15.000Z',
    },
    {
      part_number: 2,
      payment_method: 'ath-movil',
      label: 'ATH Movil Payment',
      trx_id: '52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d',
      status: 'processing',
      message: 'Processing payment 2 of 3',
      amounts: { total: '2.00' },
      started_at: '2025-01-29T10:00:16.000Z',
    },
    {
      part_number: 3,
      payment_method: 'card',
      label: 'Cash/Card Payment',
      status: 'pending',
      amounts: { total: '0.66' },
    },
  ],
  reference: '100',
  total_amounts: { total: '6.40' },
};

/**
 * CURL Examples for Testing
 */
export const curlExamples = {
  splitPayment: `
# Start a split payment transaction
curl -X POST http://localhost:3000/api/evertec/sales/split-payment \\
  -H "Content-Type: application/json" \\
  -d '{
    "reference": "100",
    "last_reference": "99",
    "session_id": "Q9QS9-WDNEX-I9LC2-4UMHZ",
    "amounts": {
      "total": "6.40",
      "base_state_tax": "5.74",
      "base_reduced_tax": "0.00",
      "state_tax": "0.60",
      "reduced_tax": "0.00",
      "city_tax": "0.06"
    },
    "splits": [
      {
        "payment_method": "card",
        "percentage": 58.438,
        "label": "VISA Partial Payment"
      },
      {
        "payment_method": "ath-movil",
        "percentage": 31.25,
        "label": "ATH Movil Payment"
      },
      {
        "payment_method": "card",
        "percentage": 10.312,
        "label": "Cash Payment"
      }
    ]
  }'
`,

  checkStatus: `
# Check split payment status
curl -X POST http://localhost:3000/api/evertec/transaction/split-payment-status \\
  -H "Content-Type: application/json" \\
  -d '{
    "split_trx_id": "SPT-1738195234567-ABC123",
    "session_id": "Q9QS9-WDNEX-I9LC2-4UMHZ"
  }'
`,

  documentation: `
# Get API documentation
curl -X GET http://localhost:3000/api/evertec/sales/split-payment
curl -X GET http://localhost:3000/api/evertec/transaction/split-payment-status
`,
};
