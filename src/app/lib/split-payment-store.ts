/**
 * Split Payment In-Memory Store
 *
 * NOTE: This is a simple in-memory store for demo/testing purposes.
 * In production, use a proper database (PostgreSQL, Redis, etc.)
 * to persist split payment state across server restarts.
 */

import type { SplitPaymentResponse } from '@/app/types/evertec-ecr';

/**
 * Internal type with metadata
 */
interface StoredSplitPayment extends SplitPaymentResponse {
  _stored_at?: number;
}

/**
 * In-memory storage for split payment transactions
 */
const splitPaymentStore = new Map<string, StoredSplitPayment>();

/**
 * Store lifetime in milliseconds (default: 24 hours)
 * After this time, entries are eligible for cleanup
 */
const STORE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Saves split payment state
 */
export function saveSplitPayment(
  split_trx_id: string,
  data: SplitPaymentResponse
): void {
  const stored: StoredSplitPayment = {
    ...data,
    _stored_at: Date.now(),
  };

  splitPaymentStore.set(split_trx_id, stored);

  // Trigger cleanup occasionally (10% chance)
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }
}

/**
 * Retrieves split payment state
 */
export function getSplitPayment(
  split_trx_id: string
): SplitPaymentResponse | null {
  const stored = splitPaymentStore.get(split_trx_id);
  if (!stored) return null;

  // Remove internal metadata before returning
  const { _stored_at, ...response } = stored;
  return response;
}

/**
 * Updates split payment state
 */
export function updateSplitPayment(
  split_trx_id: string,
  updates: Partial<SplitPaymentResponse>
): boolean {
  const existing = splitPaymentStore.get(split_trx_id);
  if (!existing) {
    return false;
  }

  splitPaymentStore.set(split_trx_id, {
    ...existing,
    ...updates,
  });

  return true;
}

/**
 * Checks if split payment exists
 */
export function splitPaymentExists(split_trx_id: string): boolean {
  return splitPaymentStore.has(split_trx_id);
}

/**
 * Deletes split payment (for cleanup or testing)
 */
export function deleteSplitPayment(split_trx_id: string): boolean {
  return splitPaymentStore.delete(split_trx_id);
}

/**
 * Cleans up expired entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  splitPaymentStore.forEach((value, key) => {
    if (value._stored_at && now - value._stored_at > STORE_LIFETIME_MS) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => splitPaymentStore.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`Cleaned up ${keysToDelete.length} expired split payment entries`);
  }
}

/**
 * Gets store statistics (for debugging)
 */
export function getStoreStats(): {
  total_entries: number;
  oldest_entry_age_ms: number | null;
} {
  const now = Date.now();
  let oldestAge: number | null = null;

  splitPaymentStore.forEach((value) => {
    if (value._stored_at) {
      const age = now - value._stored_at;
      if (oldestAge === null || age > oldestAge) {
        oldestAge = age;
      }
    }
  });

  return {
    total_entries: splitPaymentStore.size,
    oldest_entry_age_ms: oldestAge,
  };
}
