# Amount Manager UI/UX Guide

## Overview

The Amount Manager is an interactive UI component that simplifies the configuration of transaction amounts for ECR (Electronic Cash Register) transactions in the API Playground. It provides an intuitive modal interface with automatic tax calculations, making it easy to test different amount scenarios during presentations and development.

## Features

### 1. **Manage Amounts Button**
- Appears at the top of the Request section for all endpoints that use the `amounts` object
- Green button labeled "💰 Manage Amounts"
- Only visible for relevant ECR transactions (sales, refunds, EBT, etc.)

### 2. **Amount Configuration Modal**

#### Main Inputs:
- **Total Amount** (Required): The final total amount for the transaction
- **Reduced Tax Base**: Base amount subject to reduced state tax rate
- **Tip Amount**: Optional tip amount
- **Cashback Amount**: Optional cashback amount

#### Auto-Calculated Fields:
The following fields are automatically calculated based on your configured tax percentages:
- `base_state_tax`: Calculated from total minus taxes and extras
- `state_tax`: Calculated using the state tax percentage
- `reduced_tax`: Calculated using the reduced tax percentage
- `city_tax`: Calculated using the city tax percentage

### 3. **Tax Configuration**

Click the "⚙️ Configure Tax %" button to set default tax percentages:

- **City Tax Percentage** (Default: 1.5%)
- **State Tax Percentage** (Default: 10.5%)
- **Reduced Tax Percentage** (Default: 1.0%)

These values are saved in localStorage and persist across sessions.

## How to Use

### Step 1: Navigate to an Amount-Based Endpoint
Select any of these endpoint categories:
- Sales (Start Sale, ATH Móvil Sale, Split Payment)
- EBT Transactions (FoodStamp, Cash Purchase, etc.)
- Refunds
- Cash Transactions
- PreAuth & Completion

### Step 2: Click "Manage Amounts"
The green "💰 Manage Amounts" button appears in the top-right of the Request section.

### Step 3: Configure Amounts
1. Enter the **Total Amount** (e.g., 180.05)
2. Optionally enter **Reduced Tax Base** (e.g., 0.00)
3. Optionally enter **Tip** (e.g., 5.00)
4. Optionally enter **Cashback** (e.g., 20.00)

### Step 4: Review Auto-Calculated Breakdown
The modal shows a real-time preview of all calculated fields:
```
Total: $180.05
├─ Base State Tax: $100.00
├─ State Tax (10.5%): $10.50
├─ Base Reduced Tax: $0.00
├─ Reduced Tax (1.0%): $0.00
├─ City Tax (1.5%): $1.50
└─ Tip: $0.00
```

### Step 5: Apply Amounts
- Press **Enter** or click **Apply Amounts**
- The amounts object in the JSON request body is automatically populated
- The modal closes and you can immediately execute the request

## Keyboard Shortcuts

- **Enter**: Apply amounts and close modal (from any input field)
- **Escape**: Close modal without applying (browser default)

## Tax Configuration Details

### Puerto Rico Tax Compliance
The Amount Manager ensures compliance with Puerto Rico tax requirements:

- Both `base_state_tax` and `base_reduced_tax` must be provided
- Both `state_tax` and `reduced_tax` must be calculated
- Even if you have no reduced tax items, these fields must be set to "0.00"
- This prevents terminal validation errors like "AMOUNT FOR STATE REDUCED TAX NEEDED"

### Custom Tax Percentages
You can configure tax percentages to match your jurisdiction:

1. Click "⚙️ Configure Tax %" in the modal
2. Enter your tax rates (e.g., 1.5% city, 10.5% state, 1.0% reduced)
3. Click "Save Configuration"
4. These values persist across browser sessions

## Example Scenarios

### Scenario 1: Simple Sale ($100 total)
```
Total Amount: 100.00
Reduced Tax Base: 0.00
Tip: 0.00

Auto-Calculated:
- Base State Tax: $91.74
- State Tax (10.5%): $9.63
- City Tax (1.5%): $1.50
- Base Reduced Tax: $0.00
- Reduced Tax (1.0%): $0.00
```

### Scenario 2: Sale with Tip ($200 + $20 tip)
```
Total Amount: 220.00
Reduced Tax Base: 0.00
Tip: 20.00

Auto-Calculated:
- Base State Tax: $183.48
- State Tax (10.5%): $19.27
- City Tax (1.5%): $3.30
- Tip: $20.00
```

### Scenario 3: Mixed Tax Rates ($150 total, $50 reduced items)
```
Total Amount: 150.00
Reduced Tax Base: 50.00
Tip: 0.00

Auto-Calculated:
- Base State Tax: $97.24
- State Tax (10.5%): $10.21
- Base Reduced Tax: $50.00
- Reduced Tax (1.0%): $0.50
- City Tax (1.5%): $2.25
```

## Integration Points

### Supported Endpoints (16 total)
- `ecr-start-sale`
- `ecr-start-ath-movil-sale`
- `ecr-split-payment`
- `ecr-ebt-foodstamp-purchase`
- `ecr-ebt-foodstamp-refund`
- `ecr-ebt-cash-purchase`
- `ecr-ebt-cash-purchase-cashback`
- `ecr-ebt-cash-withdrawal`
- `ecr-ebt-foodstamp-voucher`
- `ecr-ebt-cash-voucher`
- `ecr-start-refund`
- `ecr-start-ath-movil-refund`
- `ecr-start-cash`
- `ecr-start-cash-refund`
- `ecr-start-preauth`
- `ecr-completion`

### JSON Structure
The Amount Manager updates the `amounts` field in your request body:

```json
{
  "terminal_id": "40000260",
  "station_number": "1234",
  "cashier_id": "123",
  "reference": "67",
  "last_reference": "66",
  "amounts": {
    "total": "180.05",
    "base_state_tax": "100.00",
    "base_reduced_tax": "0.00",
    "tip": "0.00",
    "state_tax": "10.50",
    "reduced_tax": "0.00",
    "city_tax": "1.50"
  },
  "receipt_output": "BOTH",
  "receipt_email": "yes",
  "manual_entry_indicator": "no",
  "process_cashback": "no",
  "session_id": "YOUR-SESSION-ID"
}
```

## Presentation Tips

### For Live Demos
1. Pre-configure your preferred tax percentages before the presentation
2. Use round numbers for quick demonstrations (e.g., $100, $200)
3. Show the real-time calculation feature by changing values
4. Highlight the auto-population of the JSON body

### For Testing
1. Test edge cases (0.00 amounts, large amounts, decimal precision)
2. Verify tax compliance with different configurations
3. Compare manual JSON editing vs. Amount Manager efficiency
4. Test keyboard shortcuts for faster workflow

## Technical Details

### Component Location
- **Component**: `/src/app/components/AmountManager.tsx`
- **Integration**: `/src/app/components/ApiPlayground.tsx`

### State Management
- Tax configuration stored in `localStorage` as `evertec_tax_config`
- Modal state managed via React `useState`
- Real-time calculations on every input change

### Calculation Logic
```typescript
// City Tax: percentage of total
cityTax = total × (cityTaxPercent / 100)

// Reduced Tax: percentage of reduced base
reducedTax = baseReduced × (reducedTaxPercent / 100)

// Base State Tax: remainder after subtracting other amounts
baseStateTax = total - cityTax - tip - cashback - baseReduced

// State Tax: percentage of base state tax
stateTax = baseStateTax × (stateTaxPercent / 100)
```

## Troubleshooting

### Modal Not Showing
- Ensure you've selected an endpoint that uses amounts
- Check browser console for JavaScript errors

### Calculations Seem Wrong
- Verify your tax percentages are configured correctly
- Remember: all amounts must sum to the total
- Tax calculations are based on configured percentages

### Values Not Applying
- Ensure you clicked "Apply Amounts" or pressed Enter
- Check that the JSON body is valid before applying amounts

## Future Enhancements

Potential improvements for future versions:
- Preset amount templates (Quick $100, Quick $500, etc.)
- Amount history (recently used amounts)
- Export/import tax configurations
- Multiple tax jurisdiction profiles
- Visual amount breakdown chart

---

**Built with**: React, TypeScript, Tailwind CSS
**Version**: 1.0.0
**Last Updated**: February 2026
