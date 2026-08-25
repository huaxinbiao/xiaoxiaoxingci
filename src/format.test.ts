import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLocalDateTime } from './format.ts';

test('empty and invalid values stay blank', () => {
  assert.equal(formatLocalDateTime(''), '');
  assert.equal(formatLocalDateTime(null), '');
  assert.equal(formatLocalDateTime('not-a-date'), '');
});

test('UTC ISO is converted to local wall clock instead of sliced UTC', () => {
  const iso = '2026-08-25T07:20:19.123Z';
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const expected = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const naiveUtc = iso.slice(0, 19).replace('T', ' ');

  assert.equal(formatLocalDateTime(iso), expected);
  if (date.getTimezoneOffset() !== 0) {
    assert.notEqual(formatLocalDateTime(iso), naiveUtc);
  }
});
