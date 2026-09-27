<script setup lang="ts">
import { GEMINI_MODELS } from '~/constants/questions'

const settings = useSettings()

// Auto-save jalan lewat usePersistentState; ini cuma feedback visual "baru disimpan".
const justSaved = ref(false)
let armed = false
let timer: ReturnType<typeof setTimeout>
onMounted(() => nextTick(() => { armed = true }))
watch(settings, () => {
  if (!armed) return
  justSaved.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { justSaved.value = false }, 1500)
}, { deep: true })
</script>

<template>
  <div>
    <div class="eyebrow">
      Konfigurasi
    </div>
    <h1 class="heading">
      Pengaturan
    </h1>
    <p class="subhead">
      Kunci AI buat susun materi, cek jawaban, dan kuis.
      <span style="color:#3a7a3a;font-weight:700">Tersimpan otomatis di browser ini</span>
      <span v-if="justSaved" style="color:#3a7a3a;font-weight:800">· ✓ baru disimpan</span>
    </p>

    <div class="desktop-grid">
      <div class="card">
        <div class="field">
          <label class="form-label" for="focus">Mata pelajaran / fokus ngajar</label>
          <input id="focus" v-model="settings.focus" class="input" placeholder="mis. Bahasa Inggris MI kelas 3">
          <p class="hint">
            Biar AI fokus ke mapel ini, nggak nebak dari topik. Kosongin = umum.
          </p>
        </div>
        <div class="field">
          <label class="form-label" for="defaultClass">Kelas / level default</label>
          <input id="defaultClass" v-model="settings.defaultClass" class="input" placeholder="mis. SMP kelas 8">
          <p class="hint">
            Dipakai otomatis di form Materi, Cek, Kuis, Ujian — biar nggak ketik ulang.
          </p>
        </div>
        <div class="field">
          <label class="form-label" for="apiKey">Gemini API Key</label>
          <input id="apiKey" v-model="settings.apiKey" class="input" type="password" placeholder="AQ.…">
          <p class="hint">
            Kosongkan kalau server sudah punya key (env GEMINI_API_KEY).
          </p>
        </div>
        <div class="field">
          <label class="form-label" for="model">Model</label>
          <select id="model" v-model="settings.model" class="select">
            <option v-for="m in GEMINI_MODELS" :key="m">
              {{ m }}
            </option>
          </select>
        </div>
      </div>

      <div class="right-panel">
        <div class="small-banner">
          <strong>Cara dapat key:</strong> gratis di Google AI Studio (aistudio.google.com) → Get API key. Key cuma dipakai dari sisi server saat generate.
        </div>
      </div>
    </div>
  </div>
</template>
