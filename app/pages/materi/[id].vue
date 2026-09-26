<script setup lang="ts">
const route = useRoute()
const { items, load } = useMaterials()
onMounted(load)
const material = computed(() => items.value.find(m => m.id === route.params.id))

const SECTIONS = [
  { label: '01 / Tujuan belajar', key: 'goal', highlight: false },
  { label: '02 / Penjelasan', key: 'explanation', highlight: false },
  { label: '03 / Pola kalimat', key: 'pattern', highlight: true },
  { label: '04 / Contoh', key: 'examples', highlight: false },
  { label: '05 / Latihan', key: 'exercises', highlight: false },
  { label: '06 / Kunci jawaban', key: 'answerKey', highlight: true }
] as const
</script>

<template>
  <div class="material-read">
    <div class="back-row no-print">
      <button @click="() => navigateTo('/materi')">
        ← Materi
      </button>
      <template v-if="material">
        <button @click="() => navigateTo(`/materi?edit=${material!.id}`)">
          ✎ Edit
        </button>
        <button @click="() => window.print()">
          🖨 Cetak/PDF
        </button>
      </template>
    </div>

    <div v-if="!material" class="empty">
      Materi tidak ditemukan. Mungkin sudah dihapus.
    </div>

    <div v-else class="preview-paper" style="max-width:820px">
      <div class="paper-label">
        MATERI AJAR
      </div>
      <h2 class="paper-title">
        {{ material.title || material.topic }}
      </h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="inline-chip">{{ material.klass || 'Umum' }}</span>
        <span class="inline-chip">{{ material.date }}</span>
      </div>
      <div class="paper-rule" />
      <div
        v-for="s in SECTIONS"
        :key="s.key"
        class="paper-section"
        :class="{ highlight: s.highlight }"
      >
        <strong>{{ s.label }}</strong>
        <p style="white-space:pre-wrap">
          {{ material[s.key] || '—' }}
        </p>
      </div>
    </div>
  </div>
</template>
