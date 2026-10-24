import { describe, expect, it } from 'vitest'
import { fitWithin } from '../../app/utils/compressImage'

describe('fitWithin', () => {
  it('scales the longest side down to the limit', () => {
    expect(fitWithin(4000, 3000, 1920)).toEqual({ width: 1920, height: 1440 })
    expect(fitWithin(1000, 3000, 800)).toEqual({ width: 267, height: 800 })
  })

  it('never scales up', () => {
    expect(fitWithin(640, 480, 1920)).toEqual({ width: 640, height: 480 })
  })
})
