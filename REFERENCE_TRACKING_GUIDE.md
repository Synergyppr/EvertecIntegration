# Reference Tracking in API Playground 🎯

## What Was Added

The API Playground now **automatically tracks and manages reference numbers** to make testing much easier!

---

## 📊 Visual Display

After you execute a transaction, you'll see a box at the top with:

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Active Session Data                      [Clear All]      │
├─────────────────────────────────────────────────────────────┤
│ Session ID:              │ Transaction ID:    │ Next Ref:    │
│ 0X898-LQ023-JKT7U-KH1ZH │ eed2e3f4-c55f-...  │ 6            │
│                          │                    │ ↑ Use this!  │
│                          │                    │              │
│ Last Reference:          │                    │              │
│ 5                        │                    │              │
│ ↑ Previous transaction   │                    │              │
└─────────────────────────────────────────────────────────────┘
💡 Auto-Tracking: References auto-increment after each
   transaction. Next transaction will use reference: "6"
   and last_reference: "5"
```

---

## 🔄 How It Works

### **Step 1: Logon**
```bash
POST /api/evertec/session/logon
```

**Request:**
```json
{
  "reference": "1",
  "last_reference": "0"
}
```

**Response:**
```json
{
  "session_id": "ABC-123-XYZ",
  "reference": "1"
}
```

**What You See:**
- ✅ Session ID: `ABC-123-XYZ`
- ✅ Next Reference: `2`
- ✅ Last Reference: `1`

---

### **Step 2: First Transaction**

When you select any endpoint (e.g., Start Sale), the payload **auto-fills**:

```json
{
  "session_id": "ABC-123-XYZ",    // ← Auto-filled!
  "reference": "2",                // ← Auto-filled!
  "last_reference": "1",           // ← Auto-filled!
  "amounts": { "total": "10.00" }
}
```

**Response:**
```json
{
  "trx_id": "uuid-here",
  "reference": "2"
}
```

**What You See:**
- ✅ Session ID: `ABC-123-XYZ`
- ✅ Transaction ID: `uuid-here`
- ✅ Next Reference: `3` ← **Auto-incremented!**
- ✅ Last Reference: `2`

---

### **Step 3: Second Transaction**

Switch to another endpoint (e.g., Split Payment), payload **auto-fills again**:

```json
{
  "session_id": "ABC-123-XYZ",    // ← Auto-filled!
  "reference": "3",                // ← Auto-filled!
  "last_reference": "2",           // ← Auto-filled!
  ...
}
```

---

## 🎨 UI Features

### **1. Next Reference (Highlighted)**
- **Blue border** around the box
- **Bold text** showing the number
- Tooltip: "Use this for your next transaction"

### **2. Last Reference**
- Normal gray box
- Shows previous transaction's reference
- Tooltip: "Previous transaction"

### **3. Auto-Injection**
When you switch endpoints, the UI automatically injects:
- `session_id` (if endpoint needs it)
- `reference` (current/next)
- `last_reference` (previous)

### **4. Clear All Button**
- Red button in top-right
- Clears all tracked data
- Use when starting a fresh testing session

---

## 📝 Example Flow

### **Testing Split Payment:**

1. **Logon**
   - Execute logon with `reference: "100"`, `last_reference: "99"`
   - System tracks: Next Ref = `101`, Last Ref = `100`

2. **Select Split Payment**
   - Payload auto-fills:
     ```json
     {
       "reference": "101",
       "last_reference": "100",
       "session_id": "ABC-123"
     }
     ```

3. **Execute Split Payment**
   - First part uses `ref: 101`
   - Second part uses `ref: 102` (auto-incremented)
   - Third part uses `ref: 103` (auto-incremented)

4. **After Completion**
   - System tracks: Next Ref = `104`, Last Ref = `103`
   - Ready for your next transaction!

---

## 🔍 What Gets Tracked

| Field | When Captured | How Used |
|-------|---------------|----------|
| **session_id** | After logon | Auto-injected in all ECR requests |
| **trx_id** | After sale/transaction | Used for status checks |
| **Next Reference** | After any transaction | Auto-injected as `reference` |
| **Last Reference** | After any transaction | Auto-injected as `last_reference` |

---

## 💡 Pro Tips

### **Tip 1: Clear Before New Session**
If you restart your terminal or get a new session, click **"Clear All"** to reset tracking.

### **Tip 2: Manual Override**
You can still manually edit the reference numbers in the JSON if needed. The auto-tracking won't override your manual changes.

### **Tip 3: Visual Indicator**
The green pulsing dot shows active session data is available.

### **Tip 4: Split Payment**
For split payments with 3 parts:
- You provide: `reference: "100"`
- Part 1 uses: `reference: "100"`
- Part 2 uses: `reference: "101"` (auto)
- Part 3 uses: `reference: "102"` (auto)
- After completion: Next Ref = `103`

---

## 🎯 Benefits

### **Before (Manual Tracking):**
```
You: "Hmm, last reference was 45, so next is... 46?"
You: "Wait, did I use 46 already?"
You: "Let me check the last response..."
You: *Copy-paste session_id*
You: *Type reference numbers manually*
```

### **After (Auto-Tracking):**
```
You: Execute transaction
System: ✅ Tracked! Next ref is 47
You: Switch endpoint
System: ✅ Auto-filled with ref: 47, last_ref: 46
You: Execute → Done!
```

---

## 🚀 Testing Made Easy

### **Complete Test Flow:**

```bash
1. Terminal Logon
   → System captures: session_id, reference

2. Start Sale
   → Auto-filled: session_id, references
   → System tracks: trx_id, next reference

3. Get Transaction Status
   → Auto-filled: session_id, trx_id

4. Split Payment
   → Auto-filled: session_id, references
   → Handles multiple refs internally
   → System tracks: split_trx_id, next reference

5. Split Payment Status
   → Auto-filled: split_trx_id, session_id

6. Void Transaction
   → Auto-filled: session_id, references

... and so on!
```

**No more manual reference tracking!** 🎉

---

## 🔧 Technical Details

### **Reference Increment Logic:**

```typescript
// When response received:
if (response.reference) {
  const currentRef = parseInt(response.reference);

  // Previous reference becomes last reference
  lastReference = currentRef.toString();

  // Next reference is current + 1
  nextReference = (currentRef + 1).toString();
}
```

### **Auto-Injection Logic:**

```typescript
// When switching endpoints:
if (endpoint requires reference) {
  payload.reference = nextReference;
  payload.last_reference = lastReference;
}

if (endpoint requires session_id) {
  payload.session_id = sessionId;
}
```

---

## 📱 Mobile Friendly

The reference tracking box is responsive:
- **Desktop**: 3 columns (Session ID | Trx ID | Next Ref)
- **Tablet**: 2 columns
- **Mobile**: 1 column (stacked)

---

## ✅ Summary

**What You Get:**
- ✅ Automatic reference tracking
- ✅ Auto-increment after each transaction
- ✅ Auto-injection in requests
- ✅ Visual display of next/last references
- ✅ Clear All button for fresh start
- ✅ Smart handling of split payments
- ✅ No more manual math!

**Result:** Testing is now **10x faster and easier**! 🚀
