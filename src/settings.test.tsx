import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_TEXT, DEFAULT_URL, store } from './settings';

describe('link plugin settings', () => {
  afterEach(() => {
    store.set(undefined as any);
  });

  it('exposes sane defaults', () => {
    expect(DEFAULT_TEXT).toBe('GitHub');
    expect(DEFAULT_URL).toBe('https://github.com/kubernetes-sigs/headlamp');
  });

  it('has no config until the user sets one', () => {
    expect(store.get()).toBeFalsy();
  });

  it('persists menu text and link URL through the ConfigStore', () => {
    store.set({ text: 'My Wiki', url: 'https://example.com/wiki' });

    expect(store.get()).toEqual({ text: 'My Wiki', url: 'https://example.com/wiki' });
  });
});
