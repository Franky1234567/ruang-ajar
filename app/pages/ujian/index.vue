<script setup lang="ts">
const { items: materials, load } = useMaterials()
const { items: patterns, load: loadPatterns } = usePatterns()
const settings = useSettings()
const toast = useToast()
const { data: classList } = useFetch<{ id: string, name: string }[]>('/api/classes', { default: () => [] })
const { data: savedExams } = useFetch<{ id: string, title: string, className: string | null, questionCount: number, scored: number }[]>('/api/exams', { default: () => [] })

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
        focus: settings.value.focus || undefined
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

const printHtml = computed(() =>
  examPrintHtml(`Ujian ${settings.value.focus}`.trim(), klass.value, questions.value, showKeys.value))
const print = () => window.print()

// Simpan → lanjut ke halaman nilai. Judul default dari mapel + materi pertama.
const saveTitle = ref('')
const saveClassId = ref('')
watch(questions, () => {
  if (!saveTitle.value) saveTitle.value = [settings.value.focus, chosenMaterials()[0]].filter(Boolean).join(' – ')
})
const saving = ref(false)
async function saveExam() {
  saving.value = true
  try {
    const { id } = await $fetch<{ id: string }>('/api/exams', {
      method: 'POST',
      body: { title: saveTitle.value, classId: saveClassId.value || null, questions: questions.value }
    })
    await navigateTo(`/ujian/${id}`)
  } catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ title: err.data?.statusMessage || 'Gagal menyimpan ujian.', color: 'error' })
  } finally {
    saving.value = false
  }
}
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
            {{ loading ? 'Membuat soal…' : 'Generate soal ujian' }}
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
              <button class="button" @click="print">
                Cetak/PDF
              </button>
            </div>

            <form v-if="questions.length" class="banner-yellow" style="margin:14px 0 0" @submit.prevent="saveExam">
              <strong>Simpan buat dinilai</strong>
              <div class="field" style="margin:8px 0">
                <label class="form-label" for="saveTitle">Judul</label>
                <input id="saveTitle" v-model="saveTitle" class="input" placeholder="mis. PTS Fikih Kelas 7">
              </div>
              <div class="field" style="margin:0 0 10px">
                <label class="form-label" for="saveClass">Kelas</label>
                <select id="saveClass" v-model="saveClassId" class="select">
                  <option value="">
                    Tanpa daftar siswa
                  </option>
                  <option v-for="c in classList" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>
              <button class="button dark full" :disabled="saving || !saveTitle.trim()">
                {{ saving ? 'Menyimpan…' : 'Simpan ujian' }}
              </button>
            </form>

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

          <div class="card">
            <div class="section-header" style="margin-top:0">
              <h2>Ujian tersimpan</h2><span>{{ savedExams.length }} ujian</span>
            </div>
            <div v-if="!savedExams.length" class="empty">
              Belum ada. Generate soal, lalu simpan buat mulai menilai.
            </div>
            <NuxtLink v-for="e in savedExams" :key="e.id" :to="`/ujian/${e.id}`" class="feature-tile" style="min-height:0;margin-bottom:8px">
              <span>
                <strong>{{ e.title }}</strong>
                <small>{{ e.className || 'Tanpa kelas' }} · {{ e.questionCount }} soal · {{ e.scored }} sudah dinilai</small>
              </span>
              <span class="arrow">↗</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="print-area" v-html="printHtml" />
  </div>
</template>
