# Split Payment API Documentation

## Overview

The Split Payment feature allows you to divide a single transaction into multiple sequential payments using different payment methods (Card, ATH Movil). This is useful for scenarios where:

- Customers want to split payment across multiple cards
- Partial payment with one method, remainder with another
- Gift card + credit card combinations
- Any scenario requiring multiple payment instruments

## Key Features

- **Sequential Processing**: Transactions are executed one at a time
- **Automatic Polling**: Each transaction is automatically monitored until completion
- **Tax Compliance**: Maintains Puerto Rico tax compliance with proportional tax splits
- **Status Tracking**: Real-time status monitoring for all payment parts
- **Flexible Configuration**: Support for 2-10 split parts with custom percentages

## Architecture

### Under the Hood

Split payments use the native ECR `start-sale` and `start-ath-movil-sale` endpoints. The split payment system:

1. **Validates** the split configuration (percentages must sum to 100%)
2. **Calculates** proportional amounts for each part
3. **Executes** first transaction using `start-sale` or `start-ath-movil-sale`
4. **Polls** transaction status every 2 seconds (configurable)
5. **Waits** for approval before proceeding to next part
6. **Repeats** steps 3-5 for each remaining part
7. **Returns** a split transaction ID for tracking

### Flow Diagram

```
[Client Request]
      ↓
[Validate Split Config]
      ↓
[Calculate Split Amounts]
      ↓
┌─────────────────────────┐
│   Part 1: Start Sale    │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Poll Status (Loop)     │ ←─┐
│  Every 2 seconds        │   │
└───────────┬─────────────┘   │
            ↓                  │
      [Is Approved?] ─No──────┘
            │ Yes
            ↓
┌─────────────────────────┐
│   Part 2: Start Sale    │
└───────────┬─────────────┘
            ↓
       [Repeat...]
            ↓
┌─────────────────────────┐
│  Return Split Trx ID    │
└─────────────────────────┘
```

## API Endpoints

### 1. Start Split Payment

**Endpoint**: `POST /api/evertec/sales/split-payment`

Initiates a split payment transaction.

#### Request Body

```json
{
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
  ],
  "polling_interval": 2000,
  "max_polling_attempts": 60
}
```

#### Response (Success)

```json
{
  "split_trx_id": "SPT-1738195234567-ABC123",
  "status": "completed",
  "message": "All split payments completed successfully",
  "parts": [
    {
      "part_number": 1,
      "payment_method": "card",
      "label": "VISA Partial Payment",
      "trx_id": "41bf40de-2db5-4a5b-87d7-d366e06b1b0c",
      "status": "approved",
      "message": "Transaction approved",
      "amounts": {
        "total": "3.74",
        "base_state_tax": "3.35",
        "base_reduced_tax": "0.00",
        "state_tax": "0.35",
        "reduced_tax": "0.00",
        "city_tax": "0.04"
      },
      "started_at": "2025-01-29T10:00:00.000Z",
      "completed_at": "2025-01-29T10:00:15.000Z"
    },
    {
      "part_number": 2,
      "payment_method": "ath-movil",
      "label": "ATH Movil Payment",
      "trx_id": "52cf51ef-3ec6-5b6c-98e8-e477f17c2c1d",
      "status": "approved",
      "message": "Transaction approved",
      "amounts": {
        "total": "2.00",
        "base_state_tax": "1.79",
        "base_reduced_tax": "0.00",
        "state_tax": "0.19",
        "reduced_tax": "0.00",
        "city_tax": "0.02"
      },
      "started_at": "2025-01-29T10:00:16.000Z",
      "completed_at": "2025-01-29T10:00:30.000Z"
    }
  ],
  "reference": "100",
  "total_amounts": {
    "total": "6.40",
    "base_state_tax": "5.74",
    "base_reduced_tax": "0.00",
    "state_tax": "0.60",
    "reduced_tax": "0.00",
    "city_tax": "0.06"
  }
}
```

### 2. Check Split Payment Status

**Endpoint**: `POST /api/evertec/transaction/split-payment-status`

Checks the status of a split payment transaction.

#### Request Body

```json
{
  "split_trx_id": "SPT-1738195234567-ABC123",
  "session_id": "Q9QS9-WDNEX-I9LC2-4UMHZ"
}
```

#### Response (Processing)

```json
{
  "split_trx_id": "SPT-1738195234567-ABC123",
  "status": "processing",
  "message": "Processing part 2 of 3",
  "parts": [
    {
      "part_number": 1,
      "payment_method": "card",
      "status": "approved",
      "message": "Transaction approved"
    },
    {
      "part_number": 2,
      "payment_method": "ath-movil",
      "status": "processing",
      "message": "Processing payment 2 of 3"
    },
    {
      "part_number": 3,
      "payment_method": "card",
      "status": "pending"
    }
  ],
  "reference": "100"
}
```

## Usage Examples

### Example 1: 50/50 Split Between Two Cards

```javascript
const response = await fetch('/api/evertec/sales/split-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '100',
    last_reference: '99',
    session_id: 'SESSION-ID',
    amounts: {
      total: '100.00',
      base_state_tax: '90.00',
      base_reduced_tax: '0.00',
      state_tax: '9.45',
      reduced_tax: '0.00',
      city_tax: '0.55',
    },
    splits: [
      { payment_method: 'card', percentage: 50.0, label: 'First Card' },
      { payment_method: 'card', percentage: 50.0, label: 'Second Card' },
    ],
  }),
});

const result = await response.json();
console.log('Split Transaction ID:', result.split_trx_id);
```

### Example 2: Card + ATH Movil

```javascript
const response = await fetch('/api/evertec/sales/split-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '200',
    last_reference: '199',
    session_id: 'SESSION-ID',
    amounts: {
      total: '50.00',
      base_state_tax: '45.00',
      base_reduced_tax: '0.00',
      state_tax: '4.73',
      reduced_tax: '0.00',
      city_tax: '0.27',
    },
    splits: [
      { payment_method: 'card', percentage: 40.0, label: 'Card Payment' },
      { payment_method: 'ath-movil', percentage: 60.0, label: 'ATH Movil' },
    ],
  }),
});
```

### Example 3: Monitoring Status

```javascript
async function monitorSplitPayment(splitTrxId, sessionId) {
  const checkStatus = async () => {
    const response = await fetch(
      '/api/evertec/transaction/split-payment-status',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          split_trx_id: splitTrxId,
          session_id: sessionId,
        }),
      }
    );
    return response.json();
  };

  // Poll every 3 seconds
  const interval = setInterval(async () => {
    const status = await checkStatus();
    console.log('Current status:', status.status);
    console.log('Message:', status.message);

    if (status.status === 'completed' || status.status === 'failed') {
      clearInterval(interval);
      console.log('Final result:', status);
    }
  }, 3000);
}
```

## Configuration

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `reference` | string | Yes | - | Starting transaction reference (increments for each part) |
| `last_reference` | string | Yes | - | Previous transaction reference |
| `session_id` | string | Yes | - | Session ID from logon |
| `amounts` | object | Yes | - | Total transaction amounts |
| `splits` | array | Yes | - | Array of split configurations (2-10 parts) |
| `polling_interval` | number | No | 2000 | Milliseconds between status checks |
| `max_polling_attempts` | number | No | 60 | Maximum polling attempts before timeout |
| `receipt_email` | string | No | 'yes' | Send receipt via email |
| `receipt_output` | string | No | 'BOTH' | Receipt output destination |
| `manual_entry_indicator` | string | No | 'no' | Allow manual card entry |

### Split Configuration

Each split part must specify:

- `payment_method`: `'card'` or `'ath-movil'`
- `percentage`: Number between 0 and 100
- `label`: Optional description (recommended)

**Important**: All percentages must sum to exactly 100% (allows 0.01% rounding tolerance).

## Status Values

### Split Payment Status

- `pending`: Not yet started
- `processing`: Currently executing transactions
- `completed`: All parts approved
- `failed`: One or more parts failed

### Individual Part Status

- `pending`: Waiting to start
- `processing`: Transaction in progress
- `approved`: Transaction completed successfully
- `rejected`: Transaction declined
- `error`: System error occurred

## Error Handling

### Common Errors

**Invalid Split Configuration**
```json
{
  "error_code": "INVALID_SPLIT_CONFIG",
  "error_message": "Split percentages must sum to 100%, got 95%"
}
```

**Missing Required Fields**
```json
{
  "error_code": "MISSING_FIELD",
  "error_message": "session_id is required"
}
```

**Split Not Found**
```json
{
  "error_code": "NOT_FOUND",
  "error_message": "Split payment with ID SPT-XXX not found"
}
```

### Handling Failed Parts

If any part fails, the entire split payment stops and returns a `failed` status. Previously approved parts are NOT automatically voided. You must manually void them using the `/api/evertec/transaction/void` endpoint if needed.

## Best Practices

1. **Validate Before Splitting**: Ensure percentages sum to 100% client-side before sending request
2. **Store Split IDs**: Save the `split_trx_id` for later status checks and reconciliation
3. **Handle Failures**: Implement retry logic or manual void for failed split payments
4. **Monitor Progress**: Poll status endpoint if implementing a real-time UI
5. **Reference Management**: Ensure reference numbers are sequential and unique
6. **Tax Compliance**: Always provide complete tax fields when applicable

## Technical Notes

- Split payment state is stored in-memory (24-hour retention)
- For production, use a database for persistent storage
- Reference numbers auto-increment for each part
- Each part is a separate transaction in the terminal
- Polling is synchronous - endpoint waits until all parts complete

## Testing

See `src/app/mockup/split-payment-examples.ts` for complete test examples.

### Quick Test (cURL)

```bash
# Get documentation
curl -X GET http://localhost:3000/api/evertec/sales/split-payment

# Start split payment
curl -X POST http://localhost:3000/api/evertec/sales/split-payment \
  -H "Content-Type: application/json" \
  -d @split-payment-request.json

# Check status
curl -X POST http://localhost:3000/api/evertec/transaction/split-payment-status \
  -H "Content-Type: application/json" \
  -d '{"split_trx_id": "SPT-XXX", "session_id": "SESSION-ID"}'
```

## Limitations

- Maximum 10 split parts per transaction
- In-memory storage (resets on server restart)
- Sequential processing only (no parallel transactions)
- Split payment records expire after 24 hours
- Percentages must sum to exactly 100% (±0.01% tolerance)

## Future Enhancements

Potential improvements for production:
- Database persistence (PostgreSQL/Redis)
- Automatic void on failure
- Parallel transaction processing
- Webhook notifications
- Transaction reconciliation
- Enhanced audit logging
