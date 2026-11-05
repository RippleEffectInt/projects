import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unconfiguredResponse } from './boundary.js';
test('the server boundary always fails closed and exposes no project data', () => {
  const response = unconfiguredResponse();
  assert.equal(response.status, 503);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(response.jsonBody.error.code, 'INTEGRATION_NOT_CONFIGURED');
  assert.deepEqual(Object.keys(response.jsonBody), ['error']);
});
