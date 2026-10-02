<script setup lang="ts">
import { avatarFor } from '~/constants/avatars'

const { ranks, load, reset, legacyCount, importLegacy } = useRanks()
const toast = useToast()

// Poin disimpan per nama+kelas (teks bebas), jadi L/P dicocokkan ke daftar siswa lewat nama+kelas yang sama.
const { data: students } = useFetch<{ name: string, gender: string | null, className: string }[]>('/api/students', { default: () => [] })
const genderOf = computed(() => new Map(students.value.map(s => [`${s.name}|${s.className}`.toLowerCase(), s.gender])))
const avatar = (r: { name: string, className: string }) => avatarFor(r.name, genderOf.value.get(`${r.name}|${r.className}`.toLowerCase()))

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
                <img :src="avatar(r)" :alt="r.name" loading="lazy">
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
                <img class="rank-avatar" :src="avatar(r)" :alt="r.name" loading="lazy">
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
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></svg>
          </div>
          <h3>Belum ada juara</h3>
          <p>Mulai dari kuis pertama.</p>
        </div>
      </div>

      <div class="right-panel">
        <div class="card">
          <h2 style="font:700 18px var(--font);margin:0 0 6px">
            Poin yang adil.
          </h2>
          <p style="font-size:14px;color:var(--muted);margin:0">
            Guru meninjau hasil sebelum poin jawaban bebas diberikan. Papan ini buat memotivasi, bukan menghukum murid yang salah.
          </p>
        </div>
        <button class="button full" @click="clearAll">
          Hapus semua poin
        </button>
      </div>
    </div>
  </div>
</template>
