import { describe, expect, it } from 'vitest'
import { buildVocabPrompt } from './prompt'

describe('buildVocabPrompt', () => {
  it('defaults to kata', () => {
    const p = buildVocabPrompt({ theme: 'Buah', count: 5 })
    expect(p).toContain('kosakata')
    expect(p).toContain('Buah')
    expect(p).toContain('5')
  })

  it('idiom mode asks for kiasan meaning', () => {
    const p = buildVocabPrompt({ theme: 'Kerja', count: 3, type: 'idiom' })
    expect(p).toContain('idiom')
    expect(p).toContain('kiasan')
  })

  it('slang mode avoids vulgar', () => {
    const p = buildVocabPrompt({ theme: 'Gaul', count: 3, type: 'slang' })
    expect(p).toContain('slang')
    expect(p.toLowerCase()).toContain('vulgar')
  })
})
