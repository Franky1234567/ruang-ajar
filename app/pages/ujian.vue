<script setup lang="ts">
const { items: materials, load } = useMaterials()
const { items: patterns, load: loadPatterns } = usePatterns()
const settings = useSettings()
const toast = useToast()

const TYPE_OPTS = ['Pilihan Ganda', 'Isian', 'Rewrite/Ubah kalimat', 'Essay']

const selMats = ref<string[]>([])
const selTypes = ref<string[]>(['Pilihan Ganda', 'Isian'])
const count = ref(8)
const klass = ref('SMP kelas 8')

const loading = ref(false)
const busyIndex = ref<number | null>(null)
const questions = ref<{ type: string, text: string, answer: string }[]>([])
const showKeys = ref(false)

onMounted(async () => {
  await Promise.all([load(), loadPatterns()])
  if (materials.value[0]) selMats.value = [materials.value[0].id]
  klass.value = settings.value.defaultClass || klass.value
})

function chosenMaterials() {
  return materials.value.filter(m => selMats.value.includes(m.id)).map(m => m.title || m.topic)
}

function examplesForTypes() {
  const byType = patterns.value.filter(p => selTypes.value.includes(p.type))
  return (byType.length ? byType : patterns.value).map(p => p.text)
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c] as string))
}

async function generate(replaceIndex: number | null = null) {
  if (!selMats.value.length) {
    toast.add({ title: 'Pilih minimal satu materi.', color: 'error' })
    return
  }
  if (!selTypes.value.length) {
    toast.add({ title: 'Pilih minimal satu tipe soal.', color: 'error' })
    return
  }
  if (replaceIndex === null) loading.value = true
  else busyIndex.value = replaceIndex
  try {
    const res = await $fetch<typeof questions.value>('/api/exam', {
      method: 'POST',
      body: {
        materials: chosenMaterials(),
        types: selTypes.value,
        count: replaceIndex === null ? count.value : 1,
        klass: klass.value,
        examples: examplesForTypes(),
        focus: settings.value.focus || undefined,
        apiKey: settings.value.apiKey || undefined,
        model: settings.value.model || undefined
      }
    })
    if (replaceIndex === null) questions.value = res
    else if (res[0]) questions.value[replaceIndex] = res[0]
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ title: 'Gagal generate ujian', description: err.data?.statusMessage || err.message, color: 'error' })
  } finally {
    loading.value = false
    busyIndex.value = null
  }
}

async function copy() {
  const text = questions.value
    .map((q, i) => `${i + 1}. ${q.text}${showKeys.value ? `\nJawaban: ${q.answer}` : ''}`)
    .join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: 'Soal disalin.', color: 'success' })
  } catch {
    toast.add({ title: 'Clipboard perlu HTTPS atau localhost.', color: 'error' })
  }
}

const printHtml = computed(() => {
  if (!questions.value.length) return ''
  const head = `<h1>Ujian Bahasa Inggris</h1><p>Nama: ________________   Kelas: ${escapeHtml(klass.value)}</p>`
  const body = questions.value.map((q, i) => `<article><b>${i + 1}.</b> ${escapeHtml(q.text).replace(/\n/g, '<br>')}</article>`).join('')
  const keys = showKeys.value
    ? `<div class="answer-print"><h2>Kunci Jawaban</h2>${questions.value.map((q, i) => `<p>${i + 1}. ${escapeHtml(q.answer)}</p>`).join('')}</div>`
    : ''
  return head + body + keys
})
</script>

<template>
  <div>
    <div class="no-print">
      <div class="eyebrow">
        Persiapan ujian
      </div>
      <h1 class="heading">
        Buat ujian
      </h1>
      <p class="subhead">
        Pilih materi dari log, tentukan tipe, lalu tinjau tiap soal sebelum dicetak.
      </p>

      <div class="desktop-grid">
        <div class="card">
          <h2 class="steps-title">
            01 / Materi yang diuji
          </h2>
          <p v-if="!materials.length" class="empty">
            Belum ada materi. Buat dulu di <NuxtLink to="/materi" style="text-decoration:underline">Susun Materi</NuxtLink>.
          </p>
          <label v-for="m in materials" :key="m.id" class="toggle-row">
            <span>
              <strong>{{ m.title || m.topic }}</strong><br>
              <small>{{ m.klass || 'Tanpa kelas' }} · {{ m.date }}</small>
            </span>
            <input v-model="selMats" type="checkbox" :value="m.id">
          </label>

          <div class="row" style="margin-top:16px">
            <div class="field">
              <label class="form-label" for="examCount">Jumlah soal</label>
              <input id="examCount" v-model.number="count" class="input" type="number" min="1" max="30">
            </div>
            <div class="field">
              <label class="form-label" for="examLevel">Kelas</label>
              <input id="examLevel" v-model="klass" class="input">
            </div>
          </div>

          <h2 class="steps-title">
            02 / Bentuk soal
          </h2>
          <div class="row">
            <label v-for="t in TYPE_OPTS" :key="t" class="toggle-row">
              <span>{{ t }}</span>
              <input v-model="selTypes" type="checkbox" :value="t">
            </label>
          </div>

          <div class="small-banner">
            <strong>{{ patterns.length }} contoh tersimpan.</strong> AI pakai contoh bertipe sama sebagai acuan gaya, walau topiknya beda.
          </div>
          <button class="button dark full" :disabled="loading" @click="generate()">
            {{ loading ? 'Membuat soal…' : '✦ Generate soal ujian' }}
          </button>
        </div>

        <div class="right-panel">
          <div class="card">
            <div class="section-header" style="margin-top:0">
              <h2>Hasil ujian</h2><span>{{ questions.length ? `${questions.length} soal` : 'Belum dibuat' }}</span>
            </div>
            <div class="wide-actions">
              <button class="button" @click="showKeys = !showKeys">
                {{ showKeys ? 'Sembunyikan kunci' : 'Tampilkan kunci' }}
              </button>
              <button class="button" @click="copy">
                Salin
              </button>
              <button class="button" @click="() => window.print()">
                Cetak/PDF
              </button>
            </div>

            <div v-if="!questions.length" class="empty" style="margin-top:15px">
              Pilih materi, lalu generate untuk lihat soal di sini.
            </div>
            <article v-for="(q, i) in questions" :key="i" class="exam-question">
              <header>
                <span>SOAL {{ String(i + 1).padStart(2, '0') }} · {{ q.type }}</span>
                <button :disabled="busyIndex === i" @click="generate(i)">
                  {{ busyIndex === i ? '…' : '↻ Ganti' }}
                </button>
              </header>
              <textarea v-model="q.text" rows="4" />
              <div v-if="showKeys" class="key">
                <b>Kunci:</b> {{ q.answer }}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <div class="print-area" v-html="printHtml" />
  </div>
</template>
