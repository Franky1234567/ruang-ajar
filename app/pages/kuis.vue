<script setup lang="ts">
interface QuizQ { q: string, options: string[], answer: number, why: string }

const settings = useSettings()
const { addPoints } = useRanks()
const toast = useToast()

const form = reactive({ student: '', klass: 'SMP kelas 8', topic: '', count: 3 })
onMounted(() => { form.klass = settings.value.defaultClass || form.klass })
const loading = ref(false)
const quiz = ref<QuizQ[]>([])

const index = ref(0)
const selected = ref<number | null>(null)
const checked = ref(false)
const score = ref(0)
const playing = computed(() => quiz.value.length > 0)
const current = computed(() => quiz.value[index.value])
const lastQ = computed(() => index.value === quiz.value.length - 1)

async function start() {
  if (!form.topic.trim()) {
    toast.add({ title: 'Isi topik kuisnya dulu.', color: 'error' })
    return
  }
  loading.value = true
  try {
    quiz.value = await $fetch('/api/quiz', {
      method: 'POST',
      body: {
        topic: form.topic,
        count: form.count,
        apiKey: settings.value.apiKey || undefined,
        model: settings.value.model || undefined
      }
    })
    index.value = 0
    score.value = 0
    reset()
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ title: 'Gagal membuat kuis', description: err.data?.statusMessage || err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

function reset() {
  selected.value = null
  checked.value = false
}

function pick(i: number) {
  if (checked.value) return
  selected.value = i
}

function next() {
  if (selected.value === null) return
  if (!checked.value) {
    checked.value = true
    if (selected.value === current.value.answer) score.value += 10
    return
  }
  if (!lastQ.value) {
    index.value++
    reset()
  } else {
    finish()
  }
}

async function finish() {
  if (!form.student.trim()) {
    toast.add({ title: 'Isi nama murid agar poin tercatat.', color: 'error' })
    return
  }
  try {
    await addPoints(form.student, form.klass, score.value)
    toast.add({ title: `${form.student} dapat ${score.value} poin!`, color: 'success' })
    quiz.value = []
    navigateTo('/peringkat')
  } catch {
    toast.add({ title: 'Gagal menyimpan poin.', color: 'error' })
  }
}

</script>

<template>
  <div>
    <div class="eyebrow">
      Aktivitas kelas
    </div>
    <h1 class="heading">
      Kuis cepat
    </h1>
    <p class="subhead">
      Satu soal per layar. Murid bisa bergantian menjawab lewat HP ini.
    </p>

    <div class="desktop-grid">
      <div class="card">
        <template v-if="!playing">
          <div class="row">
            <div class="field">
              <label class="form-label" for="quizStudent">Nama murid</label>
              <input id="quizStudent" v-model="form.student" class="input" placeholder="Mis. Naya">
            </div>
            <div class="field">
              <label class="form-label" for="quizClass">Kelas</label>
              <input id="quizClass" v-model="form.klass" class="input">
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label class="form-label" for="quizTopic">Topik kuis</label>
              <input id="quizTopic" v-model="form.topic" class="input" placeholder="mis. Present Continuous">
            </div>
            <div class="field">
              <label class="form-label" for="quizCount">Jumlah soal</label>
              <input id="quizCount" v-model.number="form.count" class="input" type="number" min="1" max="10">
            </div>
          </div>
          <button class="button dark full" :disabled="loading" @click="start">
            {{ loading ? 'Menyiapkan…' : '✦ Mulai kuis' }}
          </button>
        </template>

        <template v-else>
          <div class="quiz-progress">
            <span v-for="(_, i) in quiz" :key="i" :class="{ done: i <= index }" />
          </div>
          <div class="prompt-box">
            <div class="label">
              SOAL {{ index + 1 }} DARI {{ quiz.length }} · {{ form.topic }}
            </div>
            <p>{{ current.q }}</p>
          </div>
          <button
            v-for="(o, i) in current.options"
            :key="i"
            class="quiz-choice"
            :class="{ selected: selected === i }"
            :disabled="checked"
            @click="pick(i)"
          >
            {{ String.fromCharCode(65 + i) }}. {{ o }}
          </button>
          <button class="button dark full" :disabled="selected === null" @click="next">
            {{ !checked ? 'Periksa jawaban' : lastQ ? 'Selesaikan kuis' : 'Soal berikutnya' }}
          </button>
          <div v-if="checked" class="feedback" :class="{ 'needs-work': selected !== current.answer }">
            <h3>{{ selected === current.answer ? 'Benar, lanjut!' : 'Belum tepat, yuk pahami' }}</h3>
            <p>{{ current.why }}</p>
          </div>
        </template>
      </div>

      <div class="right-panel">
        <div class="leader-hero">
          <div class="leader-medal">
            ✦
          </div>
          <h3>Main, belajar, ulangi.</h3>
          <p>Jawaban boleh salah. Beri penjelasan singkat sebelum lanjut.</p>
        </div>
        <div class="small-banner">
          Soal dibuat AI dari topik yang kamu isi. Poin masuk papan peringkat setelah kuis selesai.
        </div>
      </div>
    </div>
  </div>
</template>
