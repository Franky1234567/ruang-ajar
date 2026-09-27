<script setup lang="ts">
const settings = useSettings()
const { addPoints } = useRanks()
const toast = useToast()

const form = reactive({ student: '', klass: 'SMP kelas 8', question: '', key: '', answer: '' })
onMounted(() => { form.klass = settings.value.defaultClass || form.klass })
const loading = ref(false)
const result = ref<{ verdict: string, feedback: string, points: number } | null>(null)
const approved = ref(false)

async function check() {
  if (!form.student.trim() || !form.question.trim() || !form.answer.trim()) {
    toast.add({ title: 'Isi nama murid, soal, dan jawabannya dulu.', color: 'error' })
    return
  }
  loading.value = true
  approved.value = false
  try {
    result.value = await $fetch('/api/check', {
      method: 'POST',
      body: {
        question: form.question,
        key: form.key,
        answer: form.answer,
        focus: settings.value.focus || undefined,
        apiKey: settings.value.apiKey || undefined,
        model: settings.value.model || undefined
      }
    })
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ title: 'Gagal memeriksa', description: err.data?.statusMessage || err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

async function approve() {
  if (!result.value) return
  try {
    await addPoints(form.student, form.klass, result.value.points)
    approved.value = true
    toast.add({ title: 'Nilai disetujui, poin masuk papan peringkat.', color: 'success' })
  } catch {
    toast.add({ title: 'Gagal menyimpan poin.', color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="eyebrow">
      Latihan di depan kelas
    </div>
    <h1 class="heading">
      Cek jawaban
    </h1>
    <p class="subhead">
      Murid maju, ketik jawabannya, lalu kamu lihat masukan untuknya.
    </p>

    <div class="desktop-grid">
      <div class="card">
        <div class="row">
          <div class="field">
            <label class="form-label" for="student">Nama murid</label>
            <input id="student" v-model="form.student" class="input" placeholder="Mis. Naya">
          </div>
          <div class="field">
            <label class="form-label" for="checkClass">Kelas</label>
            <input id="checkClass" v-model="form.klass" class="input">
          </div>
        </div>
        <div class="field">
          <label class="form-label" for="questionText">Soal yang akan dijawab</label>
          <textarea id="questionText" v-model="form.question" class="textarea" rows="3" placeholder="What is Rina doing? Write the complete sentence." />
        </div>
        <div class="field">
          <label class="form-label" for="answerKey">Kunci / poin penting dari guru</label>
          <input id="answerKey" v-model="form.key" class="input" placeholder="Rina is reading a book now.">
        </div>
        <div class="field">
          <label class="form-label" for="studentAnswer">Jawaban murid</label>
          <textarea id="studentAnswer" v-model="form.answer" class="textarea" rows="4" placeholder="Murid mengetik jawabannya di sini..." />
          <p class="hint">
            Kunci disembunyikan dari tampilan murid saat mengetik.
          </p>
        </div>
        <button class="button dark full" :disabled="loading" @click="check">
          {{ loading ? 'Memeriksa…' : '✦ Cek dan beri masukan' }}
        </button>

        <div v-if="result" class="feedback" :class="{ 'needs-work': result.points < 8 }">
          <h3>{{ result.verdict }}</h3>
          <p>{{ result.feedback }}</p>
          <div class="score">
            {{ result.points }} / 10 poin
          </div>
          <small>AI memeriksa makna, tata bahasa, dan kesesuaian dengan kunci. Guru tetap memutuskan nilainya.</small>
        </div>

        <button v-if="result && !approved" class="button yellow full" style="margin-top:12px" @click="approve">
          Setujui nilai & tambahkan poin
        </button>
      </div>

      <div class="right-panel">
        <div class="prompt-box">
          <div class="label">
            Contoh masukan yang diharapkan
          </div>
          <p>“Bagus, kamu sudah memakai is. Setelah is, kata read perlu menjadi reading.”</p>
        </div>
        <div class="small-banner">
          <strong>Untuk guru:</strong> Poin baru masuk leaderboard setelah kamu menyetujui hasil. Nama & nilai tersimpan di browser ini.
        </div>
      </div>
    </div>
  </div>
</template>
