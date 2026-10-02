<script setup lang="ts">
const settings = useSettings()
const { data: usage } = await useFetch('/api/usage')

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
      Biar AI nyesuain sama mapel dan kelasmu.
      <span style="color:var(--primary-hover);font-weight:700">Tersimpan otomatis di browser ini</span>
      <span v-if="justSaved" style="color:var(--primary-hover);font-weight:800">· ✓ baru disimpan</span>
    </p>

    <div class="desktop-grid">
      <div class="card">
        <div class="field">
          <label class="form-label" for="focus">Mata pelajaran / fokus ngajar</label>
          <input id="focus" v-model="settings.focus" class="input" list="subject-list" placeholder="Pilih atau ketik, mis. Fikih">
          <datalist id="subject-list">
            <option v-for="s in [...MADRASAH_SUBJECTS, ...GENERAL_SUBJECTS]" :key="s" :value="s" />
          </datalist>
          <p class="hint">
            Biar AI fokus ke mapel ini, nggak nebak dari topik. Kosongin = umum.
          </p>
        </div>
        <div v-if="isMadrasahSubject(settings.focus)" class="banner-yellow">
          <strong>Mode madrasah aktif</strong>
          AI nulis ayat, hadis, dan doa pakai huruf Arab berharakat + terjemahan, lengkap dengan surah:ayat dan perawi.
          Tetap cek ulang dalilnya sebelum dibagikan ke murid.
        </div>
        <div class="field">
          <label class="form-label" for="defaultClass">Kelas / level default</label>
          <input id="defaultClass" v-model="settings.defaultClass" class="input" placeholder="mis. SMP kelas 8">
          <p class="hint">
            Dipakai otomatis di form Materi, Kuis, Ujian — biar nggak ketik ulang.
          </p>
        </div>
      </div>

      <div class="right-panel">
        <div v-if="usage" class="small-banner">
          <strong>Kuota AI bulan ini:</strong> {{ usage.used }} / {{ usage.limit }} terpakai.
          Sisa {{ Math.max(usage.limit - usage.used, 0) }}x. Reset tiap awal bulan.
        </div>
        <NuxtLink to="/madrasah" class="feature-tile">
          <span class="tile-icon cyan"><svg class="icon" viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5M12 5V2" /></svg></span>
          <span><strong>Madrasah</strong><small>Gabung atau daftarkan madrasahmu</small></span>
          <span class="arrow">↗</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
