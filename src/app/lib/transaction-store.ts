/**
 * Transaction Tracking In-Memory Store
 *
 * Tracks transaction details including tip adjustment counts
 * to prevent exceeding terminal limits (typically 1-2 adjustments per transaction)
 *
 * NOTE: This is a simple in-memory store for demo/testing purposes.
 * In production, use a proper database (PostgreSQL, Redis, etc.)
 * to persist transaction state across server restarts.
 */

import type {
  TransactionRecord,
  TipAdjustmentHistory,
  TransactionAmounts,
} from '@/app/types/evertec-ecr';

/**
 * Internal type with metadata and adjustment history
 */
interface StoredTransaction extends TransactionRecord {
  _stored_at: number;
  adjustment_history: TipAdjustmentHistory[];
}

/**
 * In-memory storage for transaction tracking
 * Key format: "terminal_id:reference" to ensure uniqueness per terminal
 */
const transactionStore = new Map<string, StoredTransaction>();

/**
 * Store lifetime in milliseconds (default: 7 days)
 * After this time, entries are eligible for cleanup
 */
const STORE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Default maximum tip adjustments allowed per transaction
 * This can be overridden per transaction based on terminal configuration
 */
const DEFAULT_MAX_TIP_ADJUSTMENTS = 1;

/**
 * Creates a store key from terminal_id and reference
 */
function createKey(terminal_id: string, reference: string): string {
  return `${terminal_id}:${reference}`;
}

/**
 * Saves or updates a transaction record
 */
export function saveTransaction(
  terminal_id: string,
  reference: string,
  data: Partial<TransactionRecord>
): void {
  const key = createKey(terminal_id, reference);
  const existing = transactionStore.get(key);

  const record: StoredTransaction = {
    reference,
    terminal_id,
    original_tip: data.original_tip || '0.00',
    current_tip: data.current_tip || data.original_tip || '0.00',
    tip_adjustment_count: data.tip_adjustment_count || 0,
    max_tip_adjustments: data.max_tip_adjustments || DEFAULT_MAX_TIP_ADJUSTMENTS,
    amounts: data.amounts,
    status: data.status || 'pending',
    approval_code: data.approval_code,
    created_at: data.created_at || new Date().toISOString(),
    last_adjusted_at: data.last_adjusted_at,
    _stored_at: existing?._stored_at || Date.now(),
    adjustment_history: existing?.adjustment_history || [],
  };

  transactionStore.set(key, record);

  // Trigger cleanup occasionally (5% chance)
  if (Math.random() < 0.05) {
    cleanupExpiredEntries();
  }
}

/**
 * Retrieves a transaction record
 */
export function getTransaction(
  terminal_id: string,
  reference: string
): TransactionRecord | null {
  const key = createKey(terminal_id, reference);
  const stored = transactionStore.get(key);

  if (!stored) return null;

  // Remove internal metadata before returning
  const { _stored_at, adjustment_history, ...record } = stored;
  return record;
}

/**
 * Updates an existing transaction record
 */
export function updateTransaction(
  terminal_id: string,
  reference: string,
  updates: Partial<TransactionRecord>
): boolean {
  const key = createKey(terminal_id, reference);
  const existing = transactionStore.get(key);

  if (!existing) {
    return false;
  }

  const updated: StoredTransaction = {
    ...existing,
    ...updates,
  };

  transactionStore.set(key, updated);
  return true;
}

/**
 * Checks if a transaction can be tip-adjusted
 */
export function canAdjustTip(
  terminal_id: string,
  reference: string
): { can_adjust: boolean; reason?: string; current_count?: number; max_count?: number } {
  const transaction = getTransaction(terminal_id, reference);

  if (!transaction) {
    return {
      can_adjust: false,
      reason: 'Transaction not found in local records',
    };
  }

  if (transaction.status === 'voided') {
    return {
      can_adjust: false,
      reason: 'Transaction has been voided',
    };
  }

  if (transaction.status !== 'approved') {
    return {
      can_adjust: false,
      reason: `Transaction status is ${transaction.status}, must be approved`,
    };
  }

  if (transaction.tip_adjustment_count >= transaction.max_tip_adjustments) {
    return {
      can_adjust: false,
      reason: `Maximum tip adjustments (${transaction.max_tip_adjustments}) reached`,
      current_count: transaction.tip_adjustment_count,
      max_count: transaction.max_tip_adjustments,
    };
  }

  return {
    can_adjust: true,
    current_count: transaction.tip_adjustment_count,
    max_count: transaction.max_tip_adjustments,
  };
}

/**
 * Records a tip adjustment attempt
 */
export function recordTipAdjustment(
  terminal_id: string,
  reference: string,
  adjustment: {
    adjustment_reference: string;
    previous_tip: string;
    new_tip: string;
    success: boolean;
    response_message?: string;
  }
): boolean {
  const key = createKey(terminal_id, reference);
  const stored = transactionStore.get(key);

  if (!stored) {
    return false;
  }

  const adjustmentRecord: TipAdjustmentHistory = {
    adjustment_number: stored.adjustment_history.length + 1,
    previous_tip: adjustment.previous_tip,
    new_tip: adjustment.new_tip,
    adjustment_reference: adjustment.adjustment_reference,
    adjusted_at: new Date().toISOString(),
    success: adjustment.success,
    response_message: adjustment.response_message,
  };

  stored.adjustment_history.push(adjustmentRecord);

  // If successful, update the transaction record
  if (adjustment.success) {
    stored.current_tip = adjustment.new_tip;
    stored.tip_adjustment_count += 1;
    stored.last_adjusted_at = adjustmentRecord.adjusted_at;
  }

  transactionStore.set(key, stored);
  return true;
}

/**
 * Gets tip adjustment history for a transaction
 */
export function getTipAdjustmentHistory(
  terminal_id: string,
  reference: string
): TipAdjustmentHistory[] {
  const key = createKey(terminal_id, reference);
  const stored = transactionStore.get(key);

  return stored?.adjustment_history || [];
}

/**
 * Marks a transaction as voided
 */
export function voidTransaction(
  terminal_id: string,
  reference: string
): boolean {
  return updateTransaction(terminal_id, reference, {
    status: 'voided',
  });
}

/**
 * Checks if transaction exists
 */
export function transactionExists(
  terminal_id: string,
  reference: string
): boolean {
  const key = createKey(terminal_id, reference);
  return transactionStore.has(key);
}

/**
 * Deletes a transaction (for cleanup or testing)
 */
export function deleteTransaction(
  terminal_id: string,
  reference: string
): boolean {
  const key = createKey(terminal_id, reference);
  return transactionStore.delete(key);
}

/**
 * Cleans up expired entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  transactionStore.forEach((value, key) => {
    if (now - value._stored_at > STORE_LIFETIME_MS) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => transactionStore.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`[Transaction Store] Cleaned up ${keysToDelete.length} expired entries`);
  }
}

/**
 * Gets store statistics (for debugging)
 */
export function getTransactionStoreStats(): {
  total_entries: number;
  oldest_entry_age_ms: number | null;
  by_status: Record<string, number>;
  total_adjustments: number;
} {
  const now = Date.now();
  let oldestAge: number | null = null;
  const byStatus: Record<string, number> = {};
  let totalAdjustments = 0;

  transactionStore.forEach((value) => {
    const age = now - value._stored_at;
    if (oldestAge === null || age > oldestAge) {
      oldestAge = age;
    }

    // Count by status
    byStatus[value.status] = (byStatus[value.status] || 0) + 1;

    // Count total adjustments
    totalAdjustments += value.adjustment_history.length;
  });

  return {
    total_entries: transactionStore.size,
    oldest_entry_age_ms: oldestAge,
    by_status: byStatus,
    total_adjustments: totalAdjustments,
  };
}

/**
 * Clears all transactions (for testing only)
 */
export function clearAllTransactions(): void {
  transactionStore.clear();
  console.log('[Transaction Store] All transactions cleared');
}
