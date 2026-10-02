<script setup lang="ts">
definePageMeta({ name: 'kelas' })
</script>

<template>
  <div>
    <div class="eyebrow">
      Aktivitas bersama murid
    </div>
    <h1 class="heading">
      Di kelas
    </h1>
    <p class="subhead">
      Pilih kegiatan yang sedang dipakai saat mengajar.
    </p>

    <div class="stack" style="max-width:720px">
      <NuxtLink to="/kuis" class="feature-tile">
        <span class="tile-icon yellow"><svg class="icon" viewBox="0 0 24 24"><path d="M12 18h.01M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 2.2" /></svg></span>
        <span><strong>Kuis cepat</strong><small>Latihan soal satu per satu di HP</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
      <NuxtLink to="/peringkat" class="feature-tile">
        <span class="tile-icon mint"><svg class="icon" viewBox="0 0 24 24"><path d="M4 20h16M6 20v-6h4v6M10 20V8h4v12M14 20v-9h4v9" /></svg></span>
        <span><strong>Peringkat</strong><small>Poin kelas dari kuis</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
      <NuxtLink to="/siswa" class="feature-tile">
        <span class="tile-icon"><svg class="icon" viewBox="0 0 24 24"><path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8" /></svg></span>
        <span><strong>Kelas & siswa</strong><small>Daftar siswa per kelas, tempel dari Excel</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
      <NuxtLink to="/madrasah" class="feature-tile">
        <span class="tile-icon cyan"><svg class="icon" viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5M12 5V2" /></svg></span>
        <span><strong>Madrasah</strong><small>Gabung madrasah, bagikan kode ke guru lain</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
    </div>
  </div>
</template>
