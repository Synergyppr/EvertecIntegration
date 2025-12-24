# API Playground - Complete User Guide

## 🎯 Overview

The API Playground is your interactive testing interface for **both** Evertec payment integrations:

1. **PlacetoPay** - Online checkout (card-not-present)
2. **Evertec ECR** - Terminal integration (card-present)

Access at: `http://localhost:3000` (after running `npm run dev`)

---

## 📋 Available Endpoints

### 🔵 PlacetoPay - Checkout (2 endpoints)
Online payment processing for e-commerce

- **Create Checkout Session** - Initiate online payment
- **Get Session Status** - Check payment status

### 🟢 Evertec ECR - Terminal (7 endpoints)
Card-present transactions via physical terminal

**Session Management:**
- **Terminal Logon** - Start terminal session
- **Terminal Logoff** - End terminal session

**Sales:**
- **Start Sale** - Standard card payment
- **Start ATH Móvil Sale** - Mobile payment (Puerto Rico)

**Transaction Management:**
- **Void Transaction** - Cancel a transaction
- **Get Transaction Status** - Poll transaction result

**Settlement:**
- **Start Settlement** - Close batch (end of day)

---

## 🚀 How to Use the Playground

### Interface Layout

```
┌─────────────────────────────────────────────────────┐
│  Active Session Data (auto-populated)              │
├──────────────┬──────────────────────────────────────┤
│              │  Endpoint Details                    │
│  Endpoints   │  ├─ Category badge                   │
│  Sidebar     │  ├─ Method (POST/GET)                │
│              │  └─ Path                             │
│  (Grouped    │                                      │
│   by         │  Request Section                     │
│   category)  │  ├─ Quick fields (if applicable)     │
│              │  ├─ JSON body editor                 │
│              │  └─ Execute button                   │
│              │                                      │
│              │  Response Section                    │
│              │  ├─ Status code                      │
│              │  └─ JSON response                    │
└──────────────┴──────────────────────────────────────┘
```

---

## 💡 Key Features

### 1. **Grouped Endpoints**
Endpoints are organized by service and category:
- PlacetoPay - Checkout
- Evertec ECR - Session
- Evertec ECR - Sales
- Evertec ECR - Transaction
- Evertec ECR - Settlement

### 2. **Auto-Populated Session Data**
The playground automatically captures and displays:
- **Session ID** (from logon responses)
- **Transaction ID** (from sale responses)
- **Request ID** (from create-session responses)

These values persist across endpoint calls for easier testing!

### 3. **Pre-filled Examples**
Each endpoint comes with realistic example payloads:
- Valid test data
- All required fields included
- Optional fields demonstrated

### 4. **Smart Request Builder**
For transaction status checks:
- Session ID and Transaction ID fields auto-populate
- Injected automatically into request body
- No manual copy-paste needed!

---

## 📖 Usage Examples

### Example 1: PlacetoPay Checkout Flow

```
1. Select "Create Checkout Session"
2. Choose example: "Basic Payment"
3. Click "Execute Request"
4. Copy the "requestId" from response
5. Select "Get Session Status"
6. Paste requestId in the field
7. Click "Execute Request"
8. View payment status
```

### Example 2: Evertec Terminal Transaction

```
1. Select "Terminal Logon"
   → Click "Execute Request"
   → Session ID auto-captured! ✅

2. Select "Start Sale"
   → Example payload already includes amounts
   → Click "Execute Request"
   → Transaction ID auto-captured! ✅

3. Select "Get Transaction Status"
   → Session ID & Transaction ID auto-filled! ✅
   → Click "Execute Request"
   → Poll until status is APPROVED/REJECTED

4. Select "Start Settlement" (end of day)
   → Session ID already populated
   → Click "Execute Request"

5. Select "Terminal Logoff"
   → Click "Execute Request"
```

---

## 🎨 Visual Indicators

### Color Coding

**Blue** 🔵 = PlacetoPay endpoints
**Green** 🟢 = Evertec ECR endpoints

### Status Badges

- **POST** = Green badge
- **GET** = Blue badge

### Response Status

- **200-299** = Green (Success)
- **400+** = Red (Error)

### Session State

Active session data shows with:
- 🟢 Pulsing green dot
- Card-style display for each value
- Auto-updates on new responses

---

## 🔧 Configuration Requirements

### Before Testing PlacetoPay:
```env
EVERTEC_BASE_URL=https://checkout-test.placetopay.com
EVERTEC_LOGIN=your_login
EVERTEC_SECRET_KEY=your_secret_key
EVERTEC_RETURN_URL=http://localhost:3000/payment/return
EVERTEC_NOTIFICATION_URL=http://localhost:3000/api/notifications
```

### Before Testing Evertec ECR:
```env
EVERTEC_ECR_TERMINAL_URL=http://192.168.0.212:2030
EVERTEC_ECR_API_KEY=your_api_key
EVERTEC_ECR_TERMINAL_ID=30DR3479
EVERTEC_ECR_STATION_NUMBER=1234
EVERTEC_ECR_CASHIER_ID=0001
EVERTEC_ECR_TIMEOUT=30000
```

**Note:** ECR requires terminal to be on local network!

---

## 📝 Request Body Editing

### Tips:
1. **Valid JSON required** - Use proper formatting
2. **Auto-format available** - Most editors will auto-indent
3. **Field descriptions** - Hover over example payloads for hints
4. **Required fields** - Marked in endpoint documentation

### Quick Edits:
```json
// Change amount
"amounts": {
  "total": "250.00",  // ← Edit here
  "base_state_tax": "200.00"
}

// Change reference numbers
"reference": "102",  // ← Sequential numbers
"last_reference": "101"

// Change receipt output
"receipt_output": "HTML"  // Options: BOTH, HTML, PRINTER, NONE
```

---

## 🐛 Troubleshooting

### "Connection refused" error
- **PlacetoPay**: Check internet connection & credentials
- **ECR**: Verify terminal IP address and network connection

### "MISSING_FIELD" error
- Required field not provided
- Check endpoint documentation
- Ensure JSON is valid

### "TIMEOUT" error
- **PlacetoPay**: Check API endpoint availability
- **ECR**: Terminal not responding (check terminal is on)

### "Invalid session_id"
- Session expired (ECR sessions timeout)
- Run "Terminal Logon" again to get new session

### "Terminal not responding"
- Verify terminal IP: `ping 192.168.0.212`
- Check terminal is powered on
- Verify port 2030 is accessible

---

## 🎓 Best Practices

### 1. **Sequential References**
Always use sequential reference numbers:
```
Logon:    reference: "100", last_reference: "99"
Sale:     reference: "101", last_reference: "100"
Void:     reference: "102", last_reference: "101"
```

### 2. **Session Management**
- Always logon before transactions
- Always logoff when done
- One session per cashier/shift

### 3. **Polling Status**
- Use "Get Transaction Status" to poll
- Poll every 2-3 seconds
- Stop when status is APPROVED or REJECTED

### 4. **Settlement**
- Perform at end of business day
- Closes the batch
- Settlement must complete before logoff

---

## 📚 Documentation Links

### In Playground Footer:

**PlacetoPay (Blue Section):**
- Authentication Guide
- How Checkout Works
- Create Session Reference

**Evertec ECR (Green Section):**
- Transaction Flow Steps
- Link to full integration guide
- 37 total endpoints (7 implemented)

---

## 🔄 Complete Workflow Examples

### Daily Terminal Operations

**Morning:**
```
1. Terminal Logon
2. Start Sale (customer 1)
3. Get Transaction Status (confirm)
4. Start Sale (customer 2)
5. Get Transaction Status (confirm)
... throughout the day ...
```

**Evening:**
```
1. Start Settlement (close batch)
2. Terminal Logoff
```

### Void a Transaction

```
1. Start Sale (reference: "50")
2. Customer changes mind
3. Void Transaction (target_reference: "50")
4. Continue with next customer
```

### ATH Móvil Payment (Puerto Rico)

```
1. Terminal Logon
2. Start ATH Móvil Sale
3. Customer scans QR on terminal
4. Get Transaction Status (poll until complete)
5. Settlement at end of day
6. Terminal Logoff
```

---

## ✅ Success Indicators

### PlacetoPay
- Status 200
- `processUrl` in response
- `requestId` captured
- Redirect user to `processUrl` in real app

### Evertec ECR
- Status 200
- `approval_code: "00"` or `"ST"`
- `session_id` captured (logon)
- `trx_id` captured (transactions)
- `response_message: "APPROVED"`

---

## 🎯 Quick Start Checklist

- [ ] Environment variables configured
- [ ] Terminal powered on (for ECR)
- [ ] Terminal on same network (for ECR)
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] Test PlacetoPay create-session
- [ ] Test ECR logon
- [ ] Ready to test transactions!

---

## 💼 Production Considerations

**Before going live:**

1. ✅ Switch to production URLs
2. ✅ Use real credentials (secure!)
3. ✅ Implement error handling
4. ✅ Add logging (no sensitive data)
5. ✅ Test settlement process
6. ✅ Implement retry logic
7. ✅ Add transaction reconciliation
8. ✅ Set up monitoring/alerts

**Security:**
- Never expose terminal IP publicly
- Use HTTPS in production
- Validate all inputs
- Sanitize logs
- Implement rate limiting

---

## 🆘 Support

**Need Help?**
- Check `/api/evertec/README.md` for detailed integration guide
- Review `EVERTEC_INTEGRATION_GUIDE.md` for complete documentation
- Examine example payloads in mockup files
- Test with mock data first before live terminal

**Remaining Endpoints:**
30 additional ECR endpoints can be implemented using the same pattern as the 7 implemented ones. All types, configuration, and helpers are ready!

---

## 🎉 Summary

The API Playground provides:
- ✅ 9 functional endpoints (2 PlacetoPay + 7 ECR)
- ✅ Auto-populating session management
- ✅ Grouped, organized interface
- ✅ Pre-filled realistic examples
- ✅ Real-time testing capability
- ✅ Production-ready architecture
- ✅ Complete documentation

**Ready to process payments! 🚀**
