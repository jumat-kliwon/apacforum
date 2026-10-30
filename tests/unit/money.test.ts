import { describe, expect, it } from 'vitest'
import { convertToIdr, formatMoney, formatRate, isValidRate, toMajor, toMinor } from '../../shared/utils/money'

describe('toMinor', () => {
  it('reads cents without float errors', () => {
    expect(toMinor('149.50', 'USD')).toBe(14950)
    expect(toMinor(149.5, 'USD')).toBe(14950)
    expect(toMinor(0.29, 'USD')).toBe(29)
    expect(toMinor(1.005, 'USD')).toBeNull()
    expect(toMinor('200', 'SGD')).toBe(20000)
    expect(toMinor('149.500', 'USD')).toBe(14950)
  })

  it('keeps rupiah whole', () => {
    expect(toMinor(2_500_000, 'IDR')).toBe(2_500_000)
    expect(toMinor('2500000.00', 'IDR')).toBe(2_500_000)
    expect(toMinor('2500000.5', 'IDR')).toBeNull()
  })

  it('rejects what is not a plain non-negative decimal', () => {
    for (const v of ['', 'abc', '-1', '1e3', '1,000', ' . ']) expect(toMinor(v, 'USD')).toBeNull()
    expect(toMinor(-1, 'USD')).toBeNull()
    expect(toMinor(Number.NaN, 'USD')).toBeNull()
    expect(toMinor(1e21, 'IDR')).toBeNull()
  })

  it('round-trips with toMajor', () => {
    expect(toMajor(14950, 'USD')).toBe(149.5)
    expect(toMajor(2_500_000, 'IDR')).toBe(2_500_000)
  })
})

describe('convertToIdr', () => {
  it('converts at the rate and rounds up to the next rupiah', () => {
    expect(convertToIdr(14950, 'USD', '16250')).toBe(2_429_375)
    expect(convertToIdr(14950, 'USD', '16250.0000')).toBe(2_429_375)
    expect(convertToIdr(1, 'USD', '16250.5')).toBe(163) // 162.505 → 163
    expect(convertToIdr(20000, 'SGD', 12345.6789)).toBe(2_469_136) // 2,469,135.78 → 2,469,136
  })

  it('leaves exact amounts and free tickets alone', () => {
    expect(convertToIdr(10000, 'USD', '16000')).toBe(1_600_000)
    expect(convertToIdr(0, 'USD', '16250')).toBe(0)
  })

  it('passes rupiah through without a rate', () => {
    expect(convertToIdr(2_500_000, 'IDR', '')).toBe(2_500_000)
  })

  it('handles large amounts exactly', () => {
    expect(convertToIdr(99_999_999_99, 'USD', '99999.9999')).toBe(9_999_999_989_001) // 9,999,999,989,000.000001 → next rupiah
  })

  it('refuses an invalid rate', () => {
    for (const r of ['0', '-1', 'abc', '1.00001', '']) expect(() => convertToIdr(100, 'USD', r)).toThrow()
  })
})

describe('isValidRate', () => {
  it('accepts positive decimals with up to 4 places', () => {
    expect(isValidRate('16250')).toBe(true)
    expect(isValidRate('11950.1234')).toBe(true)
    expect(isValidRate('0')).toBe(false)
    expect(isValidRate('1.12345')).toBe(false)
  })
})

describe('formatMoney', () => {
  it('formats by currency', () => {
    expect(formatMoney(2_500_000, 'IDR')).toBe('Rp 2,500,000')
    expect(formatMoney(14950, 'USD')).toBe('US$ 149.50')
    expect(formatMoney(20000, 'SGD')).toBe('S$ 200.00')
  })

  it('formats a rate', () => {
    expect(formatRate('USD', '16250.0000')).toBe('1 USD = Rp 16,250')
    expect(formatRate('SGD', '12345.6789')).toBe('1 SGD = Rp 12,345.6789')
  })
})
