/**
 * Evertec Configuration
 * Centralizes all environment variables and configuration for PlacetoPay integration
 */

import { EvertecConfig } from '../types/evertec';

/**
 * Retrieves Evertec configuration from environment variables
 * Throws error if required variables are missing
 */
export function getEvertecConfig(): EvertecConfig {
  const baseUrl = process.env.EVERTEC_BASE_URL;
  const login = process.env.EVERTEC_LOGIN;
  const secretKey = process.env.EVERTEC_SECRET_KEY;
  const returnUrl = process.env.EVERTEC_RETURN_URL;
  const notificationUrl = process.env.EVERTEC_NOTIFICATION_URL;

  if (!baseUrl) {
    throw new Error('EVERTEC_BASE_URL is not defined in environment variables');
  }

  if (!login) {
    throw new Error('EVERTEC_LOGIN is not defined in environment variables');
  }

  if (!secretKey) {
    throw new Error('EVERTEC_SECRET_KEY is not defined in environment variables');
  }

  if (!returnUrl) {
    throw new Error('EVERTEC_RETURN_URL is not defined in environment variables');
  }

  return {
    // Normalize base URL by removing trailing slash
    baseUrl: baseUrl.replace(/\/$/, ''),
    login,
    secretKey,
    returnUrl,
    notificationUrl,
  };
}

/**
 * API endpoints for PlacetoPay
 */
export const EVERTEC_ENDPOINTS = {
  CREATE_SESSION: '/api/session',
  GET_SESSION: '/api/session',
} as const;

/**
 * Default values for session creation
 */
export const DEFAULT_SESSION_CONFIG = {
  locale: 'es_CO',
  expiration: 60 * 60 * 1000, // 1 hour in milliseconds
  captureAddress: false,
  skipResult: false,
} as const;
