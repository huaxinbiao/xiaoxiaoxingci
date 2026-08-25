const APP_ID = 'nb.tbaba.com';

export function hasAdminSession() {
  return Boolean(localStorage.getItem('adminToken'));
}

export function clearAdminSession() {
  localStorage.removeItem('adminToken');
}

function adminHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken') || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function login(username: string, password: string) {
  const data = await read<{ token: string; username: string }>(
    await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  );
  localStorage.setItem('adminToken', data.token);
  return data;
}

async function read<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok || payload.code !== 200) {
    throw new Error(payload.msg || '请求失败');
  }
  return payload.data as T;
}

export async function fetchStats() {
  return read(await fetch(`/api/admin/stats?appId=${APP_ID}`, { headers: adminHeaders() }));
}

export async function fetchApp() {
  return read(await fetch(`/api/admin/app?appId=${APP_ID}`, { headers: adminHeaders() }));
}

export async function saveApp(body: Record<string, unknown>) {
  return read(
    await fetch('/api/admin/app', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ appId: APP_ID, ...body }),
    }),
  );
}

export async function fetchInstalls(query = '') {
  const q = query ? `&q=${encodeURIComponent(query)}` : '';
  return read(await fetch(`/api/admin/installs?appId=${APP_ID}${q}`, { headers: adminHeaders() }));
}

export async function setBlocked(installId: string, blocked: boolean, note = '') {
  return read(
    await fetch('/api/admin/installs', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        appId: APP_ID,
        installId,
        action: blocked ? 'block' : 'unblock',
        note,
      }),
    }),
  );
}
