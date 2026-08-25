const params = new URLSearchParams(location.search);
const lang = ['zh_CN', 'zh_TW', 'en_US'].includes(params.get('lang'))
  ? params.get('lang')
  : 'zh_CN';
const doc = document.documentElement.dataset.doc || 'privacy';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderBody(text) {
  const lines = text.replaceAll('\r\n', '\n').split('\n');
  const title = lines.shift() || '';
  const meta = [];
  while (lines[0] !== undefined && (lines[0].startsWith('更新日期') || lines[0].startsWith('生效日期') || lines[0].startsWith('Updated') || lines[0].startsWith('Effective') || lines[0].startsWith('Last updated') || lines[0].startsWith('Effective date'))) {
    meta.push(lines.shift());
  }
  while (lines[0] === '') lines.shift();

  const parts = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[一二三四五六七八九十百]+、/.test(trimmed) || /^第[一二三四五六七八九十百0-9]+条/.test(trimmed) || /^[0-9]+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 80) {
      parts.push(`<h2>${escapeHtml(trimmed)}</h2>`);
      continue;
    }
    if (/^\d+\.\s/.test(trimmed) && trimmed.length < 40) {
      parts.push(`<h3>${escapeHtml(trimmed)}</h3>`);
      continue;
    }
    parts.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  document.title = title;
  document.querySelector('[data-title]').textContent = title;
  document.querySelector('[data-meta]').textContent = meta.join(' · ');
  document.querySelector('[data-body]').innerHTML = parts.join('');
}

fetch(`./${doc}.json`)
  .then((response) => response.json())
  .then((data) => renderBody(data[lang] || data.zh_CN || ''))
  .catch(() => {
    document.querySelector('[data-body]').innerHTML = '<p>文档暂时无法加载。</p>';
  });
