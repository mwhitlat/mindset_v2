import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeHttpUrl } from '../../src/shared/security.js';

test('isSafeHttpUrl allows only http/https', () => {
  assert.equal(isSafeHttpUrl('https://example.com'), true);
  assert.equal(isSafeHttpUrl('http://example.com/path'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html;base64,AAAA'), false);
  assert.equal(isSafeHttpUrl('/relative/path'), false);
});
