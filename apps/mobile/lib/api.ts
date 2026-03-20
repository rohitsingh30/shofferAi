import * as SecureStore from 'expo-secure-store';
import EventSource from 'react-native-sse';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://shofferai-27188185100.asia-south1.run.app';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// --- Token management ---

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// --- Auth ---

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Invalid credentials');
  }

  const { token, user } = await res.json();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

export async function loginWithGoogle(
  accessToken: string
): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/google-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Google login failed');
  }

  const { token, user } = await res.json();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export async function logout() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

// --- Agent ---

export interface SSEEvent {
  type:
    | 'message'
    | 'step_update'
    | 'input_required'
    | 'payment_required'
    | 'cart_update'
    | 'complete'
    | 'error';
  payload: Record<string, unknown>;
}

export async function executeAgent(
  message: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
) {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new Promise<void>((resolve, reject) => {
    const es = new EventSource(`${API_BASE}/api/agent/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
      pollingInterval: 0, // disable auto-reconnect
    });

    let settled = false;
    const cleanup = () => {
      if (!settled) {
        settled = true;
        es.removeAllEventListeners();
        es.close();
      }
    };

    if (signal) {
      signal.addEventListener('abort', () => {
        cleanup();
        const err = new Error('The operation was aborted.');
        err.name = 'AbortError';
        reject(err);
      });
    }

    es.addEventListener('message', (e) => {
      if (!e.data) return;
      try {
        const event: SSEEvent = JSON.parse(e.data);
        onEvent(event);
        if (event.type === 'complete' || event.type === 'error') {
          cleanup();
          resolve();
        }
      } catch {
        // skip malformed
      }
    });

    es.addEventListener('error', (e) => {
      cleanup();
      if ('xhrStatus' in e && e.xhrStatus === 401) {
        reject(new Error('Session expired. Please login again.'));
      } else {
        reject(new Error('message' in e ? e.message : 'Connection failed'));
      }
    });

    es.addEventListener('close', () => {
      cleanup();
      resolve();
    });
  });
}

export async function sendInput(taskId: string, stepId: string, value: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/agent/input`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ taskId, stepId, value }),
  });
  if (!res.ok) throw new Error('Failed to send input');
  return res.json();
}

// --- Tasks ---

export async function getTasks() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/tasks`, { headers });
  if (!res.ok) return [];
  return res.json();
}

// --- Profile ---

export async function getProfile() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/profile`, { headers });
  if (!res.ok) return null;
  return res.json();
}

// --- Payments ---

export async function createPaymentOrder(
  taskId: string,
  amountCents: number,
  serviceFeeCents: number,
  bookingSummary: string
) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ taskId, amountCents, serviceFeeCents, bookingSummary }),
  });
  if (!res.ok) throw new Error('Failed to create payment order');
  return res.json();
}

export async function verifyPayment(
  taskId: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/api/payments/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ taskId, razorpay_order_id, razorpay_payment_id, razorpay_signature }),
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return res.json();
}
