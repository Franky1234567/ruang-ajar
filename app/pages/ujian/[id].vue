<script setup lang="ts">
import type { ExamQuestion, GradeItem } from '~~/shared/utils/exam'

interface Row { id: string, name: string, nis: string, score: number | null, note: string | null }
interface Detail { id: string, title: string, questions: ExamQuestion[], className: string | null, students: Row[] }
interface Grade { items: GradeItem[], note: string, score: number }

const route = useRoute()
const toast = useToast()
const settings = useSettings()
const { data: exam, error } = await useFetch<Detail>(`/api/exams/${route.params.id}`)

const scored = computed(() => exam.value?.students.filter(s => s.score !== null) ?? [])
const average = computed(() => scored.value.length
  ? Math.round(scored.value.reduce((a, s) => a + s.score!, 0) / scored.value.length)
  : null)

function fail(e: unknown, fallback: string) {
  const err = e as { data?: { statusMessage?: string } }
  toast.add({ title: err.data?.statusMessage || fallback, color: 'error' })
}

async function saveScore(s: Row, score: number | null, note = s.note ?? '') {
  try {
    const res = await $fetch<{ score: number | null, note?: string }>(`/api/exams/${route.params.id}/scores`, {
      method: 'PUT', body: { studentId: s.id, score, note }
    })
    s.score = res.score
    s.note = res.note ?? ''
  } catch (e) {
    fail(e, `Gagal menyimpan nilai ${s.name}.`)
  }
}

function onScoreInput(s: Row, ev: Event) {
  const v = (ev.target as HTMLInputElement).value
  saveScore(s, v === '' ? null : Number(v))
}

// Koreksi foto: hasil AI cuma usulan per siswa, disimpan setelah guru klik "Pakai nilai ini".
const grading = ref<string | null>(null)
const proposals = reactive(new Map<string, Grade>())
async function gradePhoto(s: Row, ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  grading.value = s.id
  try {
    const fd = new FormData()
    fd.append('file', file)
    if (settings.value.focus) fd.append('focus', settings.value.focus)
    proposals.set(s.id, await $fetch<Grade>(`/api/exams/${route.params.id}/grade`, { method: 'POST', body: fd }))
  } catch (e) {
    fail(e, 'Gagal membaca lembar jawaban.')
  } finally {
    grading.value = null
  }
}

async function accept(s: Row) {
  const g = proposals.get(s.id)
  if (!g) return
  await saveScore(s, g.score, g.note)
  proposals.delete(s.id)
}

const withKeys = ref(false)
const printHtml = computed(() => exam.value
  ? examPrintHtml(exam.value.title, exam.value.className ?? '', exam.value.questions, withKeys.value)
  : '')
async function print(keys: boolean) {
  withKeys.value = keys
  await nextTick()
  window.print()
}

async function removeExam() {
  if (!confirm('Hapus ujian ini beserta semua nilainya?')) return
  try {
    await $fetch(`/api/exams/${route.params.id}`, { method: 'DELETE' })
    await navigateTo('/ujian')
  } catch (e) {
    fail(e, 'Gagal menghapus ujian.')
  }
}

const mark = (credit: number) => credit >= 1 ? 'Benar' : credit > 0 ? 'Sebagian' : 'Salah'

// Ekspor buat RDM: urutan harus sama dengan template RDM yang diunduh guru (nama atau NIS).
const sortBy = ref<'name' | 'nis'>('name')
const exportRows = computed(() => [...(exam.value?.students ?? [])].sort((a, b) => sortBy.value === 'nis'
  ? a.nis.localeCompare(b.nis, 'id', { numeric: true })
  : a.name.localeCompare(b.name, 'id')))

function downloadCsv() {
  if (!exam.value) return
  // BOM biar Excel baca UTF-8 (nama berhuruf Arab/aksen nggak rusak)
  const blob = new Blob(['﻿' + scoresCsv(exportRows.value)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `Nilai ${exam.value.title} ${exam.value.className ?? ''}.csv`.replace(/[\\/:*?"<>|]/g, '-')
  a.click()
  URL.revokeObjectURL(a.href)
}

async function copyScores() {
  try {
    await navigator.clipboard.writeText(exportRows.value.map(s => s.score ?? '').join('\n'))
    toast.add({ title: `${exportRows.value.length} nilai disalin. Tempel di kolom nilai template RDM.`, color: 'success' })
  } catch {
    toast.add({ title: 'Gagal menyalin.', color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="no-print">
      <div class="back-row">
        <button @click="() => navigateTo('/ujian')">
          ← Ujian
        </button>
        <template v-if="exam">
          <button @click="print(false)">
            Cetak soal
          </button>
          <button @click="print(true)">
            Cetak + kunci
          </button>
          <button style="color:var(--danger)" @click="removeExam">
            Hapus
          </button>
        </template>
      </div>

      <div v-if="error || !exam" class="empty">
        Ujian tidak ditemukan.
      </div>

      <template v-else>
        <div class="eyebrow">
          Penilaian
        </div>
        <h1 class="heading">
          {{ exam.title }}
        </h1>
        <p class="subhead">
          {{ exam.className || 'Tanpa kelas' }} · {{ exam.questions.length }} soal
          <template v-if="average !== null">
            · {{ scored.length }}/{{ exam.students.length }} dinilai · rata-rata <b>{{ average }}</b>
          </template>
        </p>

        <div class="desktop-grid">
          <div class="card">
            <div class="section-header" style="margin-top:0">
              <h2>Nilai siswa</h2><span>0–100</span>
            </div>
            <div v-if="!exam.className" class="empty">
              Ujian ini nggak terhubung ke daftar siswa. Simpan ulang dari halaman Ujian dengan memilih kelas.
            </div>
            <div v-else-if="!exam.students.length" class="empty">
              Kelas {{ exam.className }} belum punya siswa. Isi dulu di
              <NuxtLink to="/siswa" style="text-decoration:underline">Kelas & siswa</NuxtLink>.
            </div>

            <template v-for="s in exam.students" :key="s.id">
              <div class="rank-row">
                <div class="rank-person">
                  <strong>{{ s.name }}</strong>
                  <small>{{ s.note || (s.nis ? `NIS ${s.nis}` : '') }}</small>
                </div>
                <label class="button" style="min-height:40px;padding:6px 10px;flex:none" :aria-busy="grading === s.id">
                  {{ grading === s.id ? 'Membaca…' : 'Foto' }}
                  <input type="file" accept="image/*" capture="environment" hidden :disabled="grading !== null" @change="gradePhoto(s, $event)">
                </label>
                <input
                  class="input score-input"
                  type="number"
                  min="0"
                  max="100"
                  inputmode="numeric"
                  :value="s.score ?? ''"
                  :aria-label="`Nilai ${s.name}`"
                  @change="onScoreInput(s, $event)"
                >
              </div>

              <div v-if="proposals.has(s.id)" class="feedback" :class="{ 'needs-work': proposals.get(s.id)!.score < 70 }">
                <h3>Usulan AI: {{ proposals.get(s.id)!.score }}</h3>
                <p>{{ proposals.get(s.id)!.note }}</p>
                <ol style="margin:0 0 12px;padding-left:20px;font-size:14px">
                  <li v-for="it in proposals.get(s.id)!.items" :key="it.no" style="margin-bottom:4px">
                    <b>{{ mark(it.credit) }}</b> · {{ it.studentAnswer || '—' }}
                    <span v-if="it.comment" style="color:var(--muted)"> · {{ it.comment }}</span>
                  </li>
                </ol>
                <div class="wide-actions" style="margin-top:0">
                  <button class="button dark" @click="accept(s)">
                    Pakai nilai ini
                  </button>
                  <button class="button" @click="proposals.delete(s.id)">
                    Buang
                  </button>
                </div>
                <small>Cek dulu jawaban yang "tidak terbaca". Nilai bisa diubah manual setelah disimpan.</small>
              </div>
            </template>
          </div>

          <div class="right-panel">
            <div v-if="exam.students.length" class="card">
              <div class="section-header" style="margin-top:0">
                <h2>Ekspor nilai</h2><span>{{ scored.length }}/{{ exam.students.length }} terisi</span>
              </div>
              <div class="field">
                <label class="form-label" for="sortBy">Urutkan sesuai template RDM</label>
                <select id="sortBy" v-model="sortBy" class="select">
                  <option value="name">
                    Nama (A–Z)
                  </option>
                  <option value="nis">
                    NIS
                  </option>
                </select>
              </div>
              <div class="wide-actions" style="margin-top:0">
                <button class="button dark" @click="copyScores">
                  Salin kolom nilai
                </button>
                <button class="button" @click="downloadCsv">
                  Unduh Excel
                </button>
              </div>
              <p class="hint">
                Di RDM: unduh template nilai kelas ini, klik sel nilai siswa pertama, tempel. Cek dulu urutan siswanya sama.
              </p>
            </div>
            <div class="small-banner">
              <strong>Cara cepat:</strong> cetak soal, siswa kerjakan di kertas. Tulis nilai langsung, atau ketuk <b>Foto</b>
              buat motret lembar jawaban dan biar AI bantu koreksi. Tiap foto memakai 1 kuota AI.
            </div>
            <div class="card">
              <div class="section-header" style="margin-top:0">
                <h2>Soal & kunci</h2><span>{{ exam.questions.length }} soal</span>
              </div>
              <article v-for="(q, i) in exam.questions" :key="i" class="exam-question">
                <header><span>SOAL {{ String(i + 1).padStart(2, '0') }} · {{ q.type }}</span></header>
                <p style="white-space:pre-line;margin:8px 0" v-text="q.text" />
                <div class="key">
                  <b>Kunci:</b> {{ q.answer }}
                </div>
              </article>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="print-area" v-html="printHtml" />
  </div>
</template>
