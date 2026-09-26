import { describe, it, expect } from 'vitest';

/**
 * Unit tests for frontend utility/formatting logic.
 * Tests the same compact USD formatter used in AnalyticsCharts.
 */

const formatCompactUsd = (num: number): string => {
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)} Billion`;
  if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)} Million`;
  return `$${num.toLocaleString()}`;
};

describe('formatCompactUsd', () => {
  it('formats billions correctly', () => {
    expect(formatCompactUsd(1_079_183_566)).toBe('$1.08 Billion');
  });

  it('formats millions correctly', () => {
    expect(formatCompactUsd(114_637_967)).toBe('$114.64 Million');
  });

  it('formats values under 1 million as regular locale string', () => {
    const result = formatCompactUsd(107_918);
    expect(result).toContain('$');
    expect(result).toContain('107');
  });

  it('handles zero', () => {
    expect(formatCompactUsd(0)).toContain('$');
  });
});
