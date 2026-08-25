const APP_ID = 'nb.tbaba.com';

function adminHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken') || '';
  return token ? { 'Content-Type': 'application/json', 'X-Admin-Token': token } : { 'Content-Type': 'application/json' };
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
