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
      <NuxtLink to="/cek" class="feature-tile">
        <span class="tile-icon cyan"><svg class="icon" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" /></svg></span>
        <span><strong>Cek jawaban</strong><small>AI memberi masukan pada jawaban yang diketik murid</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
      <NuxtLink to="/kuis" class="feature-tile">
        <span class="tile-icon yellow"><svg class="icon" viewBox="0 0 24 24"><path d="M12 18h.01M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 2.2" /></svg></span>
        <span><strong>Kuis cepat</strong><small>Latihan soal satu per satu di HP</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
      <NuxtLink to="/peringkat" class="feature-tile">
        <span class="tile-icon mint"><svg class="icon" viewBox="0 0 24 24"><path d="M4 20h16M6 20v-6h4v6M10 20V8h4v12M14 20v-9h4v9" /></svg></span>
        <span><strong>Peringkat</strong><small>Poin kelas dari kuis & cek jawaban</small></span>
        <span class="arrow">↗</span>
      </NuxtLink>
    </div>
  </div>
</template>
