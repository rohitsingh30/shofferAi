import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/shared/vitest.config.ts',
  'packages/agent-core/vitest.config.ts',
  'apps/web/vitest.config.ts',
]);
