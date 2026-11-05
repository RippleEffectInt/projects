import { app } from '@azure/functions';
import { unconfiguredResponse } from '../boundary.js';
// SWA/Entra and record authorization must be implemented before replacing this stub.
// Anonymous here exposes only an unconditional 503; it never reads or writes data.
app.http('projects', {
  route: 'projects/{*path}',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  authLevel: 'anonymous',
  handler: async () => unconfiguredResponse(),
});
