/** Intentionally no connection, authentication shortcut or configuration toggle. */
export function unconfiguredResponse() {
  return {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
    jsonBody: {
      error: {
        code: 'INTEGRATION_NOT_CONFIGURED',
        message:
          'Live projects and approvals are unavailable. This iteration supports browser-only demo previews.',
      },
    },
  };
}
