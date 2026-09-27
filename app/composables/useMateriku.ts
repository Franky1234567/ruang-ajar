export interface Material {
  id: string
  date: string
  klass: string
  topic: string
  goal: string
  title: string
  explanation: string
  pattern: string
  examples: string
  exercises: string
  answerKey: string
}

export interface Pattern {
  id: string
  type: string
  topic: string
  text: string
}

export interface Rank {
  id?: string
  name: string
  className: string
  points: number
  activities: number
}

export interface Vocab {
  id: string
  word: string
  meaning: string
  example: string
  type: string
  theme: string
  klass: string
  learned: boolean
}

export interface Settings {
  apiKey: string
  model: string
  defaultClass: string
  focus: string
}

function usePersistentState<T>(key: string, initial: () => T) {
  const state = useState<T>(key, initial)
  const loaded = useState<boolean>(`${key}__loaded`, () => false)

  onMounted(() => {
    if (loaded.value) return
    loaded.value = true
    try {
      const raw = localStorage.getItem(`materiku:${key}`)
      if (raw) state.value = JSON.parse(raw)
    } catch {
      // localStorage tak tersedia / rusak → pakai default
    }
    watch(state, (v) => {
      try {
        localStorage.setItem(`materiku:${key}`, JSON.stringify(v))
      } catch {
        // penyimpanan penuh / diblokir → abaikan
      }
    }, { deep: true })
  })

  return state
}

type MaterialInput = Omit<Material, 'id'>

// Materi sekarang di server (per-guru). localStorage cuma buat impor data lama.
export function useMaterials() {
  const items = useState<Material[]>('materials', () => [])
  const loaded = useState<boolean>('materials_loaded', () => false)

  async function load(force = false) {
    if (loaded.value && !force) return
    try {
      items.value = await $fetch<Material[]>('/api/materials')
      loaded.value = true
    } catch {
      // belum login / offline → biarin kosong
    }
  }

  async function add(data: MaterialInput) {
    const row = await $fetch<Material>('/api/materials', { method: 'POST', body: data })
    items.value.unshift(row)
    return row
  }

  async function update(id: string, data: MaterialInput) {
    const row = await $fetch<Material>(`/api/materials/${id}`, { method: 'PUT', body: data })
    const i = items.value.findIndex(m => m.id === id)
    if (i >= 0) items.value[i] = row
  }

  async function remove(id: string) {
    await $fetch(`/api/materials/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(m => m.id !== id)
  }

  // Materi lama di localStorage yang belum kepindah.
  function legacyCount() {
    if (!import.meta.client) return 0
    try {
      const raw = localStorage.getItem('materiku:materials')
      return raw ? (JSON.parse(raw) as unknown[]).length : 0
    } catch {
      return 0
    }
  }

  async function importLegacy() {
    if (!import.meta.client) return
    let old: Material[] = []
    try {
      old = JSON.parse(localStorage.getItem('materiku:materials') || '[]')
    } catch {
      old = []
    }
    for (const m of old.reverse()) {
      await add({
        date: m.date, klass: m.klass, topic: m.topic, goal: m.goal, title: m.title,
        explanation: m.explanation, pattern: m.pattern, examples: m.examples ?? '',
        exercises: m.exercises, answerKey: m.answerKey ?? ''
      })
    }
    localStorage.removeItem('materiku:materials')
  }

  return { items, loaded, load, add, update, remove, legacyCount, importLegacy }
}

type PatternInput = { type: string, topic: string, text: string }

export function usePatterns() {
  const items = useState<Pattern[]>('patterns', () => [])
  const loaded = useState<boolean>('patterns_loaded', () => false)

  async function load(force = false) {
    if (loaded.value && !force) return
    try {
      items.value = await $fetch<Pattern[]>('/api/patterns')
      loaded.value = true
    } catch {
      // belum login → biarin kosong
    }
  }

  async function addMany(inputs: PatternInput[]) {
    const rows = await $fetch<Pattern[]>('/api/patterns', { method: 'POST', body: inputs })
    items.value.unshift(...rows)
    return rows
  }

  async function update(id: string, data: PatternInput) {
    const row = await $fetch<Pattern>(`/api/patterns/${id}`, { method: 'PUT', body: data })
    const i = items.value.findIndex(p => p.id === id)
    if (i >= 0) items.value[i] = row
  }

  async function remove(id: string) {
    await $fetch(`/api/patterns/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(p => p.id !== id)
  }

  function legacyCount() {
    if (!import.meta.client) return 0
    try {
      const raw = localStorage.getItem('materiku:patterns')
      return raw ? (JSON.parse(raw) as unknown[]).length : 0
    } catch {
      return 0
    }
  }

  async function importLegacy() {
    if (!import.meta.client) return
    let old: Pattern[] = []
    try {
      old = JSON.parse(localStorage.getItem('materiku:patterns') || '[]')
    } catch {
      old = []
    }
    const inputs = old.reverse().map(p => ({ type: p.type, topic: p.topic, text: p.text }))
    if (inputs.length) await addMany(inputs)
    localStorage.removeItem('materiku:patterns')
  }

  return { items, loaded, load, addMany, update, remove, legacyCount, importLegacy }
}
type VocabInput = { word: string, meaning: string, example: string, type: string, theme: string, klass: string }

export function useVocab() {
  const items = useState<Vocab[]>('vocab', () => [])
  const loaded = useState<boolean>('vocab_loaded', () => false)

  async function load(force = false) {
    if (loaded.value && !force) return
    try {
      items.value = await $fetch<Vocab[]>('/api/vocab')
      loaded.value = true
    } catch {
      // belum login → kosong
    }
  }

  async function addMany(inputs: VocabInput[]) {
    const rows = await $fetch<Vocab[]>('/api/vocab', { method: 'POST', body: inputs })
    items.value.unshift(...rows)
    return rows
  }

  async function toggleLearned(v: Vocab) {
    const row = await $fetch<Vocab>(`/api/vocab/${v.id}`, { method: 'PATCH', body: { learned: !v.learned } })
    const i = items.value.findIndex(x => x.id === v.id)
    if (i >= 0) items.value[i] = row
  }

  async function remove(id: string) {
    await $fetch(`/api/vocab/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(v => v.id !== id)
  }

  return { items, loaded, load, addMany, toggleLearned, remove }
}

export const useSettings = () =>
  usePersistentState<Settings>('settings', () => ({ apiKey: '', model: 'gemini-flash-lite-latest', defaultClass: 'SMP kelas 8', focus: '' }))

// Kelas default global — dipakai buat prefill form; editable per-form.
export function useDefaultClass() {
  const settings = useSettings()
  const klass = ref(settings.value.defaultClass || 'SMP kelas 8')
  onMounted(() => { klass.value = settings.value.defaultClass || 'SMP kelas 8' })
  return klass
}

export function useRanks() {
  const ranks = useState<Rank[]>('ranks', () => [])
  const loaded = useState<boolean>('ranks_loaded', () => false)

  async function load(force = false) {
    if (loaded.value && !force) return
    try {
      ranks.value = await $fetch<Rank[]>('/api/ranks')
      loaded.value = true
    } catch {
      // belum login → biarin kosong
    }
  }

  async function addPoints(name: string, className: string, points: number) {
    if (!name.trim()) return
    await $fetch('/api/ranks/add', { method: 'POST', body: { name, className, points } })
    loaded.value = false // paksa reload pas papan peringkat dibuka
  }

  async function reset() {
    await $fetch('/api/ranks', { method: 'DELETE' })
    ranks.value = []
  }

  function legacyCount() {
    if (!import.meta.client) return 0
    try {
      const raw = localStorage.getItem('materiku:ranks')
      return raw ? (JSON.parse(raw) as unknown[]).length : 0
    } catch {
      return 0
    }
  }

  async function importLegacy() {
    if (!import.meta.client) return
    let old: Rank[] = []
    try {
      old = JSON.parse(localStorage.getItem('materiku:ranks') || '[]')
    } catch {
      old = []
    }
    if (old.length) await $fetch('/api/ranks/import', { method: 'POST', body: old })
    localStorage.removeItem('materiku:ranks')
    loaded.value = false
  }

  return { ranks, loaded, load, addPoints, reset, legacyCount, importLegacy }
}
