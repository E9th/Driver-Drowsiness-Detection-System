// Basic auth utilities for frontend
// NOTE: For production prefer HttpOnly secure cookies. Using localStorage here for simplicity.

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  device_id?: string;
  user_type?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

const API_BASE = import.meta?.env?.VITE_API_BASE || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://driver-drowsiness-api.onrender.com/api');
const TOKEN_KEY = "auth_token";
const LAST_DEVICE_KEY = "last_device_id";

function normalizeDeviceId(deviceId?: string): string {
  return (deviceId || "").trim().toLowerCase();
}

export function getLastKnownDeviceId(): string {
  return normalizeDeviceId(localStorage.getItem(LAST_DEVICE_KEY) || "");
}

function setLastKnownDeviceId(deviceId?: string) {
  const normalized = normalizeDeviceId(deviceId);
  if (!normalized) return;
  localStorage.setItem(LAST_DEVICE_KEY, normalized);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const data = await request<AuthResult>("/auth/login", {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  data.user.device_id = normalizeDeviceId(data.user.device_id);
  setToken(data.token);
  setLastKnownDeviceId(data.user.device_id);
  return data;
}

export async function register(email: string, password: string, name?: string, device_id?: string, phone?: string, user_type?: string): Promise<AuthResult> {
  const data = await request<AuthResult>("/auth/register", {
    method: 'POST',
    body: JSON.stringify({ email, password, name, device_id, phone, user_type })
  });
  data.user.device_id = normalizeDeviceId(data.user.device_id);
  setToken(data.token);
  setLastKnownDeviceId(data.user.device_id);
  return data;
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const data = await request<AuthUser>("/auth/me");
    data.device_id = normalizeDeviceId(data.device_id) || getLastKnownDeviceId();
    setLastKnownDeviceId(data.device_id);
    return data;
  } catch {
    return null;
  }
}

export async function logout() {
  clearToken();
  localStorage.removeItem(LAST_DEVICE_KEY);
}
