# Evertec ECR API Documentation

This directory contains the Evertec ECR (Electronic Cash Register) terminal integration endpoints. The terminal processes card-present transactions over HTTP/REST.

## Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Your Application   │   HTTP  │  This Middleware     │   HTTP  │ Evertec Terminal│
│  (Point of Sale)    │ ◄─────► │  (Next.js API)       │ ◄─────► │  (192.168.x.x)  │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
```

## Directory Structure

```
/api/evertec/
├── session/              # Session management
│   ├── logon/           # Establish terminal session
│   └── logoff/          # End terminal session
├── sales/               # Sale transactions
│   ├── start-sale/      # Standard card payment
│   └── start-ath-movil-sale/  # ATH Móvil payment
├── transaction/         # Transaction management
│   ├── void/           # Cancel transaction
│   └── get-status/     # Poll transaction status
└── settlement/          # Batch settlement
    └── start-settle/   # Close batch
```

## API Endpoints Summary

### Session Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evertec/session/logon` | POST | Establish session with terminal |
| `/api/evertec/session/logoff` | POST | End session with terminal |

### Sales Transactions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evertec/sales/start-sale` | POST | Standard card payment |
| `/api/evertec/sales/start-ath-movil-sale` | POST | ATH Móvil payment (Puerto Rico) |

### Transaction Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evertec/transaction/void` | POST | Void/cancel a transaction |
| `/api/evertec/transaction/get-status` | POST | Poll transaction status |

### Settlement
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evertec/settlement/start-settle` | POST | Close batch and settle |

## Complete Endpoint List (37 Total)

### ✅ Implemented (7)
1. ✅ Logon
2. ✅ Logoff
3. ✅ Start Sale
4. ✅ Start ATH Movil Sale
5. ✅ Void
6. ✅ Get Transaction Status
7. ✅ Start Settle

### 📋 To Be Implemented (30)
Following the same pattern as implemented endpoints:

**EBT Transactions (8)**
- Start EBT FoodStamp Purchase
- Start EBT FoodStamp Refund
- Start EBT Cash Purchase
- Start EBT Cash Purchase with Cashback
- Start EBT Cash Withdrawal
- Start EBT Balance Inquiry
- Start EBT FoodStamp Voucher
- Start EBT Cash Voucher

**Refunds (2)**
- Start Refund
- Start ATH Movil Refund

**Transaction Management (1)**
- Tip Adjust

**Cash Transactions (2)**
- Start Cash
- Start Cash Refund

**Pre-Authorization (2)**
- Start Pre-Authorization
- Completion

**Reports (3)**
- Journal
- Detailed Report
- Totals Report

**Device Operations (4)**
- Get Status
- Start Communication Test
- Reprint
- Custom Print

**Signature (2)**
- Get Last Signature
- Capture Signature

**Verification & Data Collection (5)**
- Start Card Verification
- Start Confirmation Data 2 Options
- Start Confirmation Data Multiple Options
- Start Data Request
- Scan Code

**Display (1)**
- Items List

## Usage Flow

### Basic Transaction Flow

```typescript
// 1. Establish session
const logonResponse = await fetch('/api/evertec/session/logon', {
  method: 'POST',
  body: JSON.stringify({
    reference: '100',
    last_reference: '99'
  })
});
const { session_id } = await logonResponse.json();

// 2. Start sale
const saleResponse = await fetch('/api/evertec/sales/start-sale', {
  method: 'POST',
  body: JSON.stringify({
    reference: '101',
    last_reference: '100',
    session_id,
    amounts: {
      total: '100.00',
      base_state_tax: '90.00',
      state_tax: '10.00'
    }
  })
});
const { trx_id } = await saleResponse.json();

// 3. Poll for transaction status
const pollStatus = async () => {
  const statusResponse = await fetch('/api/evertec/transaction/get-status', {
    method: 'POST',
    body: JSON.stringify({ session_id, trx_id })
  });
  const status = await statusResponse.json();

  if (status.status === 'PENDING') {
    setTimeout(pollStatus, 2000); // Poll every 2 seconds
  } else if (status.status === 'APPROVED') {
    console.log('Transaction approved!', status.transaction);
  } else {
    console.log('Transaction failed:', status.message);
  }
};
pollStatus();

// 4. End of day settlement
const settleResponse = await fetch('/api/evertec/settlement/start-settle', {
  method: 'POST',
  body: JSON.stringify({
    reference: '200',
    last_reference: '199',
    session_id
  })
});

// 5. Logoff
await fetch('/api/evertec/session/logoff', {
  method: 'POST',
  body: JSON.stringify({
    reference: '201',
    last_reference: '200'
  })
});
```

## Configuration

All endpoints use configuration from environment variables:

```env
EVERTEC_ECR_TERMINAL_URL=http://192.168.0.212:2030
EVERTEC_ECR_API_KEY=your_api_key
EVERTEC_ECR_TERMINAL_ID=30DR3479
EVERTEC_ECR_STATION_NUMBER=1234
EVERTEC_ECR_CASHIER_ID=0001
EVERTEC_ECR_TIMEOUT=30000
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error_code": "ERROR_CODE",
  "error_message": "Human-readable error description",
  "details": "Additional error context (optional)"
}
```

Common error codes:
- `MISSING_FIELD`: Required field not provided
- `TIMEOUT`: Terminal request timeout
- `INTERNAL_ERROR`: Server error
- `TERMINAL_ERROR`: Error from terminal

## Documentation Standards

Each endpoint provides:
- GET request returns API documentation
- POST request processes the transaction
- Request/response schemas
- Example payloads
- Implementation notes

Example:
```bash
# Get documentation
curl http://localhost:3000/api/evertec/session/logon

# Execute transaction
curl -X POST http://localhost:3000/api/evertec/session/logon \
  -H "Content-Type: application/json" \
  -d '{"reference": "100", "last_reference": "99"}'
```

## Implementation Pattern

All endpoints follow this pattern:

1. **Import dependencies**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { EVERTEC_ECR_ENDPOINTS } from '@/app/config/evertec-ecr';
import {
  buildBaseRequest,
  validateRequiredFields,
  makeTerminalRequest,
  handleTerminalError,
  createApiDocumentation,
} from '@/app/lib/evertec-ecr-helpers';
```

2. **POST handler** - Process transaction
3. **GET handler** - Return documentation

## Type Safety

All request/response types are defined in:
- `/src/app/types/evertec-ecr.ts`

Configuration in:
- `/src/app/config/evertec-ecr.ts`

Helper functions in:
- `/src/app/lib/evertec-ecr-helpers.ts`

## Testing

Use mockup data from:
- `/src/app/mockup/evertec-ecr-mockup.ts`

## References

- ECR API Documentation 01.02.07 (Postman Collection)
- Terminal IP typically on local network (192.168.x.x:2030)
- Session management required before transactions
- Settlement should be performed at end of business day

## Security Notes

1. Never log sensitive card data
2. Terminal communication should be on secure local network
3. API key should be kept confidential
4. Use HTTPS in production if possible
5. Validate all input data
6. Implement rate limiting for production

## Support

For additional endpoints implementation, follow the pattern established in the implemented endpoints. Each endpoint should:
- Use helper functions for consistency
- Include comprehensive documentation
- Handle errors gracefully
- Return typed responses
- Validate input data
