import { describe, it, expect } from 'vitest';
import { truncateAssetName } from '../../src/shared/utils/truncateAssetName';

describe('truncateAssetName', () => {
  it('keeps short names unchanged', () => {
    const name = 'short-name.jpg';
    expect(truncateAssetName(name, 50)).toBe(name);
  });

  it('truncates long names without extension', () => {
    const long = 'a'.repeat(60);
    const truncated = truncateAssetName(long, 50);
    expect(truncated.length).toBe(50);
    expect(truncated).toBe(long.slice(0, 50));
  });

  it('truncates long names preserving extension', () => {
    const base = 'a'.repeat(60);
    const name = `${base}.jpg`;
    const res = truncateAssetName(name, 50);
    expect(res.length).toBeLessThanOrEqual(50);
    expect(res.endsWith('.jpg')).toBe(true);
    const expectedBase = base.slice(0, 50 - '.jpg'.length);
    expect(res).toBe(expectedBase + '.jpg');
  });

  it('handles exactly max length names', () => {
    const name = 'a'.repeat(50);
    expect(truncateAssetName(name, 50)).toBe(name);
  });

  it('handles empty string', () => {
    expect(truncateAssetName('', 50)).toBe('');
  });

  it('ensures final length never exceeds max even if extension is very long', () => {
    const name = `file.${'b'.repeat(100)}`; // very long extension
    const res = truncateAssetName(name, 50);
    expect(res.length).toBe(50);
    expect(res).toBe(name.slice(0, 50));
  });
});
