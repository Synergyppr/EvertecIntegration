# Evertec Integration Complete Guide

This project now integrates **two separate Evertec services**:

1. **PlacetoPay** - Online checkout for card-not-present transactions
2. **Evertec ECR** - Terminal integration for card-present transactions

---

## 📁 Project Structure

```
src/app/
├── api/
│   ├── placetopay/          # 🔵 PlacetoPay (Checkout) Endpoints
│   │   └── checkout/
│   │       ├── create-session/
│   │       └── get-session/
│   └── evertec/             # 🟢 Evertec ECR (Terminal) Endpoints
│       ├── session/         # Logon/Logoff
│       ├── sales/           # Sale transactions
│       ├── transaction/     # Void, Status
│       └── settlement/      # Batch settlement
│
├── types/
│   ├── evertec.ts           # PlacetoPay types
│   └── evertec-ecr.ts       # ECR Terminal types
│
├── config/
│   ├── evertec.ts           # PlacetoPay config
│   └── evertec-ecr.ts       # ECR Terminal config
│
├── auth/
│   └── evertec-auth.ts      # PlacetoPay authentication
│
├── lib/
│   └── evertec-ecr-helpers.ts  # ECR helper functions
│
└── mockup/
    └── evertec-ecr-mockup.ts   # Test data
```

---

## 🔵 PlacetoPay Integration (Online Checkout)

### Location
`/src/app/api/placetopay/checkout/*`

### Purpose
Processes **card-not-present** transactions (online payments, subscriptions)

### Endpoints
- `POST /api/placetopay/checkout/create-session` - Create payment session
- `POST /api/placetopay/checkout/get-session/[requestId]` - Get session status

### Documentation
https://docs.placetopay.dev/checkout/

### Configuration
```env
EVERTEC_BASE_URL=https://checkout-test.placetopay.com
EVERTEC_LOGIN=your_login
EVERTEC_SECRET_KEY=your_secret_key
EVERTEC_RETURN_URL=http://localhost:3000/payment/return
EVERTEC_NOTIFICATION_URL=http://localhost:3000/api/notifications
```

---

## 🟢 Evertec ECR Integration (Terminal)

### Location
`/src/app/api/evertec/*`

### Purpose
Processes **card-present** transactions via physical terminal

### Architecture
```
Your POS → This Middleware → Evertec Terminal (192.168.x.x:2030) → Card Network
```

### Configuration
```env
EVERTEC_ECR_TERMINAL_URL=http://192.168.0.212:2030
EVERTEC_ECR_API_KEY=b443a6cd95a8388d4b3ccea9f3762d41
EVERTEC_ECR_TERMINAL_ID=30DR3479
EVERTEC_ECR_STATION_NUMBER=1234
EVERTEC_ECR_CASHIER_ID=0001
EVERTEC_ECR_TIMEOUT=30000
```

---

## ✅ Implemented Evertec ECR Endpoints (7/37)

### Session Management
- ✅ `POST /api/evertec/session/logon` - Establish session
- ✅ `POST /api/evertec/session/logoff` - End session

### Sales
- ✅ `POST /api/evertec/sales/start-sale` - Card payment
- ✅ `POST /api/evertec/sales/start-ath-movil-sale` - ATH Móvil payment

### Transaction Management
- ✅ `POST /api/evertec/transaction/void` - Cancel transaction
- ✅ `POST /api/evertec/transaction/get-status` - Poll status

### Settlement
- ✅ `POST /api/evertec/settlement/start-settle` - Close batch

---

## 📋 Remaining Evertec ECR Endpoints (30/37)

All remaining endpoints follow the **exact same pattern** as implemented ones.

### Implementation Pattern

Each endpoint requires **3 files**:

1. **Route handler** (`route.ts`)
2. **Type definition** (already in `types/evertec-ecr.ts`)
3. **Config constant** (already in `config/evertec-ecr.ts`)

### Quick Implementation Guide

For any remaining endpoint (e.g., "Start Refund"):

#### 1. Create directory
```bash
mkdir -p src/app/api/evertec/refunds/start-refund
```

#### 2. Create `route.ts`
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
import type { StartRefundRequest, TransactionResponse } from '@/app/types/evertec-ecr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payload: StartRefundRequest = {
      ...buildBaseRequest(body),
      receipt_email: body.receipt_email || 'yes',
      amounts: body.amounts,
      receipt_output: body.receipt_output || 'BOTH',
      manual_entry_indicator: body.manual_entry_indicator || 'no',
      session_id: body.session_id,
    };

    const validation = validateRequiredFields(payload, [
      'reference',
      'last_reference',
      'amounts',
      'session_id',
    ]);

    if (!validation.valid) {
      return validation.error!;
    }

    const { data, status } = await makeTerminalRequest<TransactionResponse>(
      EVERTEC_ECR_ENDPOINTS.START_REFUND,
      payload
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    return handleTerminalError(error);
  }
}

export async function GET() {
  return createApiDocumentation({
    endpoint: '/api/evertec/refunds/start-refund',
    description: 'Process a refund transaction',
    requestBody: { /* ... schema ... */ },
    responseBody: { /* ... schema ... */ },
    notes: ['Add relevant notes'],
  });
}
```

---

## 🔧 Helper Functions Available

All in `/src/app/lib/evertec-ecr-helpers.ts`:

- `buildBaseRequest()` - Adds default terminal config
- `validateRequiredFields()` - Validates required fields
- `makeTerminalRequest()` - Makes HTTP request to terminal
- `handleTerminalError()` - Standardized error handling
- `createApiDocumentation()` - Generates GET documentation

---

## 📝 Complete Endpoint List by Category

### 🔐 Session (2) - ✅ DONE
- [x] Logon
- [x] Logoff

### 💳 Sales (2) - ✅ DONE
- [x] Start Sale
- [x] Start ATH Movil Sale

### 🏦 EBT Transactions (8) - ⏳ TO DO
- [ ] Start EBT FoodStamp Purchase
- [ ] Start EBT FoodStamp Refund
- [ ] Start EBT Cash Purchase
- [ ] Start EBT Cash Purchase with Cashback
- [ ] Start EBT Cash Withdrawal
- [ ] Start EBT Balance Inquiry
- [ ] Start EBT FoodStamp Voucher
- [ ] Start EBT Cash Voucher

### ↩️ Refunds (2) - ⏳ TO DO
- [ ] Start Refund
- [ ] Start ATH Movil Refund

### ⚙️ Transaction Management (2)
- [x] Void (DONE)
- [ ] Tip Adjust

### 💵 Cash (2) - ⏳ TO DO
- [ ] Start Cash
- [ ] Start Cash Refund

### 🔒 Pre-Authorization (2) - ⏳ TO DO
- [ ] Start Pre-Authorization
- [ ] Completion

### 📊 Reporting (3) - ⏳ TO DO
- [ ] Journal
- [ ] Detailed Report
- [ ] Totals Report

### 🖥️ Device Operations (4) - ⏳ TO DO
- [ ] Get Status
- [ ] Start Communication Test
- [ ] Reprint
- [ ] Custom Print

### ✍️ Signature (2) - ⏳ TO DO
- [ ] Get Last Signature
- [ ] Capture Signature

### ✅ Verification (5) - ⏳ TO DO
- [ ] Start Card Verification
- [ ] Start Confirmation Data 2 Options
- [ ] Start Confirmation Data Multiple Options
- [ ] Start Data Request
- [ ] Scan Code

### 📦 Display (1) - ⏳ TO DO
- [ ] Items List

### 📍 Status (1) - ✅ DONE
- [x] Get Transaction Status

### 💰 Settlement (1) - ✅ DONE
- [x] Start Settle

---

## 🧪 Testing

### Using Mockup Data
```typescript
import { mockTransactionFlow } from '@/app/mockup/evertec-ecr-mockup';

// Test complete flow
const { logon, sale, statusRequest } = mockTransactionFlow;
```

### Reference Number Generator
```typescript
import { ReferenceGenerator } from '@/app/mockup/evertec-ecr-mockup';

const refGen = new ReferenceGenerator(100);
const { reference, last_reference } = refGen.getNext();
```

---

## 🚀 Quick Start

### 1. Configure Environment
Copy `.env.example` to `.env` and fill in:
- PlacetoPay credentials (for online payments)
- Terminal IP and credentials (for card-present)

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Endpoints

**Get documentation:**
```bash
curl http://localhost:3000/api/evertec/session/logon
```

**Execute transaction:**
```bash
curl -X POST http://localhost:3000/api/evertec/session/logon \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "100",
    "last_reference": "99"
  }'
```

---

## 📖 Transaction Flow Example

```typescript
// 1. Logon
const logon = await fetch('/api/evertec/session/logon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '100',
    last_reference: '99'
  })
});
const { session_id } = await logon.json();

// 2. Sale
const sale = await fetch('/api/evertec/sales/start-sale', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '101',
    last_reference: '100',
    session_id,
    amounts: { total: '100.00' }
  })
});
const { trx_id } = await sale.json();

// 3. Poll Status
const checkStatus = async () => {
  const status = await fetch('/api/evertec/transaction/get-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, trx_id })
  });
  return status.json();
};

// 4. Settlement (end of day)
await fetch('/api/evertec/settlement/start-settle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '200',
    last_reference: '199',
    session_id
  })
});

// 5. Logoff
await fetch('/api/evertec/session/logoff', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: '201',
    last_reference: '200'
  })
});
```

---

## 🔒 Security Best Practices

1. ✅ Never hardcode credentials (use `.env`)
2. ✅ Never log sensitive card data
3. ✅ Terminal should be on secure local network
4. ✅ Use HTTPS in production
5. ✅ Validate all input data
6. ✅ Implement rate limiting

---

## 📚 Documentation References

- **PlacetoPay Checkout:** https://docs.placetopay.dev/checkout/
- **Evertec ECR:** ECR API Documentation 01.02.07 (Postman Collection)
- **Project README:** `/src/app/api/evertec/README.md`

---

## 🛠️ Next Steps

To complete the integration:

1. **Implement remaining 30 endpoints** using the pattern shown above
2. **Test each endpoint** with your terminal
3. **Add business logic** specific to your POS system
4. **Implement error handling** for your use cases
5. **Add logging/monitoring** for production

Each endpoint follows the **same pattern**, so implementation is straightforward once you understand the structure.

---

## 💡 Key Differences: PlacetoPay vs ECR

| Feature | PlacetoPay (Checkout) | Evertec ECR (Terminal) |
|---------|----------------------|------------------------|
| **Use Case** | Online payments | Card-present (POS) |
| **Location** | `/api/placetopay/*` | `/api/evertec/*` |
| **Connection** | HTTPS to cloud | HTTP to local terminal |
| **Authentication** | SHA-256 signature | API key header |
| **Session** | Per-payment | Per-cashier shift |
| **Settlement** | Automatic | Manual (EOD) |

---

## ✅ Summary

- ✅ **7 core endpoints implemented** (session, sales, void, status, settle)
- ✅ **Complete type system** for all 37 endpoints
- ✅ **Helper functions** for consistent implementation
- ✅ **Comprehensive documentation** with examples
- ✅ **Mockup data** for testing
- ✅ **Environment configuration** for both services
- ✅ **Clear separation** between PlacetoPay and ECR

**Ready for production testing and remaining endpoint implementation!**
