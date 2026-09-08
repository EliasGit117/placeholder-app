import { serverEnvConfig } from '@/lib/config/server-env-config.ts';

// Independent of NODE_ENV — staging is a production build but still uses sandbox creds.
const MAIB_BASE_URL = serverEnvConfig.maibUseSandbox
  ? 'https://sandbox.maibmerchants.md'
  : 'https://api.maibmerchants.md';

interface IMaibEnvelope<T> {
  result: T;
  ok: boolean;
  errors: { errorCode: string; errorMessage: string }[] | null;
}

interface IMaibTokenResult {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

interface IMaibOrderItem {
  externalId?: string;
  title?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
}

interface IMaibOrderInfo {
  id?: string;
  description?: string;
  orderAmount?: number;
  orderCurrency?: string;
  items?: IMaibOrderItem[];
}

interface IMaibPayerInfo {
  name?: string;
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
}

export interface IMaibCreateCheckoutInput {
  amount: number;
  currency: string;
  orderInfo?: IMaibOrderInfo;
  payerInfo?: IMaibPayerInfo;
  language?: 'ro' | 'ru' | 'en';
  callbackUrl?: string;
  successUrl?: string;
  failUrl?: string;
}

export interface IMaibCreateCheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
}

export type TMaibCheckoutStatus =
  | 'WaitingForInit'
  | 'Initialized'
  | 'PaymentMethodSelected'
  | 'Completed'
  | 'Expired'
  | 'Abandoned'
  | 'Cancelled'
  | 'Failed';

export interface IMaibCheckoutDetails {
  id: string;
  status: TMaibCheckoutStatus;
  amount: number;
  currency: string;
  expiresAt: string;
  payment: {
    paymentId: string;
    status: string;
    referenceNumber: string;
    paymentMethod: string | null;
    executedAt: string;
  } | null;
}

// Access token is short-lived (expiresIn: 300s per maib docs) and shared across all
// requests from this process, so it's cached in module scope rather than re-fetched
// per call. Refreshed a bit early to avoid racing the expiry.
let cachedToken: { accessToken: string; tokenType: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<{ accessToken: string; tokenType: string }> {
  if (cachedToken && cachedToken.expiresAt > Date.now())
    return cachedToken;

  const response = await fetch(`${MAIB_BASE_URL}/v2/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: serverEnvConfig.maibClientId,
      clientSecret: serverEnvConfig.maibClientSecret,
    }),
  });

  const body = await response.json() as IMaibEnvelope<IMaibTokenResult>;
  if (!response.ok || !body.ok)
    throw new Error(`maib auth failed: ${body.errors?.map((e) => e.errorMessage).join(', ') ?? response.statusText}`);

  cachedToken = {
    accessToken: body.result.accessToken,
    tokenType: body.result.tokenType,
    expiresAt: Date.now() + (body.result.expiresIn - 30) * 1000,
  };
  return cachedToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { accessToken, tokenType } = await getAccessToken();

  const response = await fetch(`${MAIB_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
      ...init?.headers,
    },
  });

  const body = await response.json() as IMaibEnvelope<T>;
  if (!response.ok || !body.ok)
    throw new Error(`maib request to ${path} failed: ${body.errors?.map((e) => e.errorMessage).join(', ') ?? response.statusText}`);

  return body.result;
}

// Callback authenticity: X-Signature is "sha256=" + base64(HMAC-SHA256(`${rawBody}.${timestamp}`, signatureKey)),
// timestamp from X-Signature-Timestamp (unix ms). Must be verified against the raw
// request body, before JSON.parse, since re-serializing could change byte-for-byte content.
export async function verifyMaibCallbackSignature(rawBody: string, timestampHeader: string, signatureHeader: string): Promise<boolean> {
  const expectedPrefix = 'sha256=';
  if (!signatureHeader.startsWith(expectedPrefix))
    return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(serverEnvConfig.maibSignatureKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${rawBody}.${timestampHeader}`));
  const computed = btoa(String.fromCharCode(...new Uint8Array(mac)));
  const received = signatureHeader.slice(expectedPrefix.length);

  if (computed.length !== received.length)
    return false;

  let diff = 0;
  for (let i = 0; i < computed.length; i++)
    diff |= computed.charCodeAt(i) ^ received.charCodeAt(i);
  return diff === 0;
}

export const MaibClient = {
  createCheckout(input: IMaibCreateCheckoutInput): Promise<IMaibCreateCheckoutResult> {
    return request('/v2/checkouts', { method: 'POST', body: JSON.stringify(input) });
  },

  getCheckoutDetails(checkoutId: string): Promise<IMaibCheckoutDetails> {
    return request(`/v2/checkouts/${checkoutId}`, { method: 'GET' });
  },

  cancelCheckout(checkoutId: string): Promise<{ checkoutId: string; status: string }> {
    return request(`/v2/checkouts/${checkoutId}/cancel`, { method: 'POST' });
  },
};
