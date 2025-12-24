/**
 * Evertec Authentication Utility
 * Implements Web Services Security UsernameToken Profile 1.1
 * Based on: https://docs.placetopay.dev/checkout/authentication/
 */

import { Auth } from '../types/evertec';
import crypto from 'crypto';

/**
 * Generates a random nonce (Base64-encoded)
 * The nonce is an arbitrary random value identifying each request as unique
 */
export function generateNonce(): string {
  const randomBytes = crypto.randomBytes(16);
  return randomBytes.toString('base64');
}

/**
 * Generates the current seed (timestamp in ISO 8601 format)
 * The system permits only 5-minute deviation from actual server time
 */
export function generateSeed(): string {
  return new Date().toISOString();
}

/**
 * Generates the tranKey using the formula:
 * Base64(SHA-256(nonce + seed + secretKey))
 *
 * @param nonce - Base64-encoded nonce
 * @param seed - ISO 8601 timestamp
 * @param secretKey - Secret key from environment
 * @returns Base64-encoded tranKey
 */
export function generateTranKey(
  nonce: string,
  seed: string,
  secretKey: string
): string {
  // Concatenate nonce + seed + secretKey
  const concatenated = nonce + seed + secretKey;

  // Hash using SHA-256 and get raw binary output
  const hash = crypto.createHash('sha256').update(concatenated).digest();

  // Encode the raw binary hash in Base64
  return hash.toString('base64');
}

/**
 * Generates a complete authentication object for PlacetoPay API requests
 *
 * @param login - Site identifier (from environment)
 * @param secretKey - Secret key (from environment)
 * @returns Complete Auth object ready for API requests
 */
export function generateAuth(login: string, secretKey: string): Auth {
  const nonce = generateNonce();
  const seed = generateSeed();
  const tranKey = generateTranKey(nonce, seed, secretKey);

  return {
    login,
    tranKey,
    nonce,
    seed,
  };
}

/**
 * Validates that an Auth object is properly formatted
 *
 * @param auth - Auth object to validate
 * @returns True if valid, false otherwise
 */
export function validateAuth(auth: Auth): boolean {
  if (!auth.login || typeof auth.login !== 'string') return false;
  if (!auth.tranKey || typeof auth.tranKey !== 'string') return false;
  if (!auth.nonce || typeof auth.nonce !== 'string') return false;
  if (!auth.seed || typeof auth.seed !== 'string') return false;

  // Validate seed is a valid ISO 8601 date
  const seedDate = new Date(auth.seed);
  if (isNaN(seedDate.getTime())) return false;

  // Validate seed is not more than 5 minutes old (security requirement)
  const now = new Date();
  const diffMinutes = Math.abs(now.getTime() - seedDate.getTime()) / 60000;
  if (diffMinutes > 5) return false;

  return true;
}
