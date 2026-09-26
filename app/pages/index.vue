<script setup lang="ts">
const { items: materials, load } = useMaterials()
onMounted(load)
const last = computed(() => materials.value[0])
</script>

<template>
  <div>
    <div class="eyebrow">
      Ruang kelas
    </div>
    <h1 class="heading">
      Halo, Bu/Pak Guru 👋
    </h1>
    <p class="subhead">
      Satu tempat buat nyiapin pelajaran dan menemani murid latihan.
    </p>

    <div class="dashboard-grid">
      <div>
        <div class="card tinted">
          <div style="font-size:11px;font-weight:800;margin-bottom:15px">
            HARI INI
          </div>
          <h2>Mau mengajar apa<br>hari ini?</h2>
          <p>Mulai dari satu topik. Tempel contoh/referensimu, lalu rapikan hasilnya.</p>
          <NuxtLink to="/materi" class="button dark">
            Susun materi <span>↗</span>
          </NuxtLink>
        </div>

        <div class="section-header">
          <h2>Langsung ke</h2><span>Pilih aktivitas</span>
        </div>
        <div class="stack">
          <NuxtLink to="/cek" class="feature-tile">
            <span class="tile-icon cyan"><svg class="icon" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" /></svg></span>
            <span><strong>Cek jawaban</strong><small>Murid maju dan ketik jawabannya</small></span>
            <span class="arrow">↗</span>
          </NuxtLink>
          <NuxtLink to="/kuis" class="feature-tile">
            <span class="tile-icon yellow"><svg class="icon" viewBox="0 0 24 24"><path d="M12 18h.01M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 2.2" /></svg></span>
            <span><strong>Mulai kuis</strong><small>Latihan singkat untuk satu kelas</small></span>
            <span class="arrow">↗</span>
          </NuxtLink>
          <NuxtLink to="/peringkat" class="feature-tile">
            <span class="tile-icon mint"><svg class="icon" viewBox="0 0 24 24"><path d="M4 20h16M6 20v-6h4v6M10 20V8h4v12M14 20v-9h4v9" /></svg></span>
            <span><strong>Papan peringkat</strong><small>Lihat poin yang sudah disetujui guru</small></span>
            <span class="arrow">↗</span>
          </NuxtLink>
        </div>
      </div>

      <aside class="desktop-side">
        <div class="intro-illustration">
          Aa.
        </div>
        <div class="section-header">
          <h2>Materi terakhir</h2>
        </div>
        <div v-if="last" class="lesson-card">
          <small>{{ last.klass || 'Umum' }} · Bahasa Inggris</small>
          <h3>{{ last.title || last.topic }}</h3>
          <p>{{ last.goal }}</p>
          <span class="inline-chip">Siap dipakai</span>
        </div>
        <div v-else class="empty">
          Belum ada materi. Mulai dari “Susun materi”.
        </div>
      </aside>
    </div>

    <div class="section-header" style="margin-top:24px">
      <h2>Materi terakhir</h2><span>{{ materials.length }} materi</span>
    </div>
    <div v-if="last" class="lesson-card mobile-lesson">
      <small>{{ last.klass || 'Umum' }} · Bahasa Inggris</small>
      <h3>{{ last.title || last.topic }}</h3>
      <p>{{ last.goal }}</p>
      <span class="inline-chip">Siap dipakai</span>
    </div>
    <div v-else class="empty mobile-lesson">
      Belum ada materi. Mulai dari “Susun materi”.
    </div>
  </div>
</template>
