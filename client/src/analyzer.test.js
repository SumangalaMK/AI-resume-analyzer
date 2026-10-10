import { describe, it, expect } from 'vitest';
// Smoke test for the app's expected UI text. Full API integration tests require MongoDB.
describe('ResumeLens client', () => {
  it('has a configured API default', async () => {
    const { default: api } = await import('./api.js');
    expect(api.defaults.baseURL).toBeTruthy();
  });
});
