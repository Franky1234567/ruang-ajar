<script setup lang="ts">
import { avatarFor } from '~/constants/avatars'

const { ranks, load, reset, legacyCount, importLegacy } = useRanks()
const toast = useToast()

const legacy = ref(0)
onMounted(async () => {
  await load()
  legacy.value = legacyCount()
})

const importing = ref(false)
async function doImport() {
  importing.value = true
  try {
    await importLegacy()
    await load(true)
    legacy.value = 0
    toast.add({ title: 'Poin lama dipindah ke server.', color: 'success' })
  } catch {
    toast.add({ title: 'Gagal impor.', color: 'error' })
  } finally {
    importing.value = false
  }
}

const ALL = 'Semua kelas'
const selected = ref(ALL)
const classes = computed(() => [ALL, ...new Set(ranks.value.map(r => r.className))])

const sorted = computed(() =>
  ranks.value
    .filter(r => selected.value === ALL || r.className === selected.value)
    .sort((a, b) => b.points - a.points)
)
const top3 = computed(() => sorted.value.slice(0, 3))
const rest = computed(() => sorted.value.slice(3))

const PLACE = ['first', 'second', 'third']

async function clearAll() {
  if (!import.meta.client) return
  if (confirm('Hapus semua poin?')) {
    await reset()
    toast.add({ title: 'Poin dihapus.', color: 'success' })
  }
}
</script>

<template>
  <div>
    <div class="eyebrow">
      Hasil latihan
    </div>
    <h1 class="heading">
      Papan peringkat
    </h1>
    <p class="subhead">
      Poin dari jawaban yang disetujui guru dan kuis yang selesai.
    </p>

    <div v-if="legacy" class="banner-yellow" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <span><strong>{{ legacy }} data poin lama</strong> di perangkat ini.</span>
      <button class="button" :disabled="importing" style="flex:none" @click="doImport">
        {{ importing ? 'Memindah…' : 'Pindahkan ke server' }}
      </button>
    </div>

    <div class="desktop-grid">
      <div>
        <div class="field">
          <label class="form-label" for="leaderClass">Pilih kelas</label>
          <select id="leaderClass" v-model="selected" class="select class-selector">
            <option v-for="c in classes" :key="c">
              {{ c }}
            </option>
          </select>
        </div>

        <template v-if="top3.length">
          <div class="podium">
            <article v-for="(r, i) in top3" :key="r.name + r.className" class="podium-card" :class="PLACE[i]">
              <span class="podium-rank">#{{ i + 1 }}</span>
              <div class="podium-avatar">
                <img :src="avatarFor(r.name)" :alt="r.name" loading="lazy">
              </div>
              <div class="podium-info">
                <strong>{{ r.name }}</strong>
                <small>{{ r.activities }} aktivitas</small>
                <b>{{ r.points }} pt</b>
              </div>
            </article>
          </div>

          <template v-if="rest.length">
            <div class="rank-caption">
              Peringkat lainnya
            </div>
            <div class="card">
              <div v-for="(r, i) in rest" :key="r.name + r.className" class="rank-row">
                <span class="rank-num">{{ String(i + 4).padStart(2, '0') }}</span>
                <img class="rank-avatar" :src="avatarFor(r.name)" :alt="r.name" loading="lazy">
                <span class="rank-person">
                  <strong>{{ r.name }}</strong>
                  <small>{{ r.activities }} aktivitas · {{ r.className }}</small>
                </span>
                <span class="rank-points">{{ r.points }} pt</span>
              </div>
            </div>
          </template>
        </template>

        <div v-else class="leader-hero">
          <div class="leader-medal">
            ✦
          </div>
          <h3>Belum ada juara</h3>
          <p>Mulai dari cek jawaban atau kuis pertama.</p>
        </div>
      </div>

      <div class="right-panel">
        <div class="card" style="background:var(--lilac);border-color:#222">
          <h2 style="font:700 21px Outfit,sans-serif;margin:0 0 7px">
            Poin yang adil.
          </h2>
          <p style="font-size:12px;margin:0">
            Guru meninjau hasil sebelum poin jawaban bebas diberikan. Papan ini buat memotivasi, bukan menghukum murid yang salah.
          </p>
        </div>
        <div class="small-banner">
          Data cuma di browser ini. Kalau kelas pakai perangkat beda, leaderboard belum sinkron otomatis.
        </div>
        <button class="button full" @click="clearAll">
          Hapus semua poin
        </button>
      </div>
    </div>
  </div>
</template>
