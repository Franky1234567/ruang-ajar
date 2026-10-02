<script setup lang="ts">
const toast = useToast()
const { data, refresh } = await useFetch('/api/school')
const isAdmin = computed(() => data.value?.school && data.value.role === 'admin')
const { data: recap, execute: loadRecap } = useFetch('/api/school/recap', { immediate: false })
watch(isAdmin, (v) => { if (v) loadRecap() }, { immediate: true })

const contactWa = useRuntimeConfig().public.contactWa
const planUntil = computed(() => {
  const d = data.value?.school?.planUntil
  return d && new Date(d) > new Date() ? new Date(d) : null
})
const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const waLink = computed(() => contactWa
  ? `https://wa.me/${contactWa}?text=${encodeURIComponent(`Assalamu'alaikum, saya mau tanya paket ruangajar untuk ${data.value?.school?.name ?? 'madrasah kami'}.`)}`
  : null)

const newName = ref('')
const joinCode = ref('')
const busy = ref(false)

async function run(fn: () => Promise<unknown>, ok: string) {
  busy.value = true
  try {
    await fn()
    await refresh()
    toast.add({ title: ok, color: 'success' })
  } catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ title: err.data?.statusMessage || 'Gagal. Coba lagi.', color: 'error' })
  } finally {
    busy.value = false
  }
}

const create = () => run(() => $fetch('/api/school', { method: 'POST', body: { name: newName.value } }), 'Madrasah dibuat. Bagikan kodenya ke guru lain.')
const join = () => run(() => $fetch('/api/school/join', { method: 'POST', body: { code: joinCode.value } }), 'Berhasil gabung.')
function leave() {
  if (!confirm('Keluar dari madrasah? Kelas yang kamu buat tetap tinggal di madrasah.')) return
  run(() => $fetch('/api/school/leave', { method: 'POST' }), 'Kamu sudah keluar dari madrasah.')
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(data.value?.school?.code || '')
    toast.add({ title: 'Kode disalin.', color: 'success' })
  } catch {
    toast.add({ title: 'Gagal menyalin, salin manual aja.', color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="eyebrow">
      Madrasah
    </div>
    <h1 class="heading">
      {{ data?.school?.name || 'Gabung madrasah' }}
    </h1>
    <p class="subhead">
      Guru satu madrasah pakai daftar kelas & siswa yang sama. Materi dan soal tetap milik masing-masing guru.
    </p>

    <div v-if="!data?.school" class="desktop-grid">
      <form class="card" @submit.prevent="join">
        <h2 class="steps-title">
          Gabung pakai kode
        </h2>
        <div class="field">
          <label class="form-label" for="joinCode">Kode madrasah</label>
          <input id="joinCode" v-model="joinCode" class="input" placeholder="mis. K7M2QX" autocomplete="off" style="text-transform:uppercase;letter-spacing:.1em">
          <p class="hint">
            Minta kodenya ke admin madrasah (biasanya operator atau guru yang pertama daftar).
          </p>
        </div>
        <button class="button dark full" :disabled="busy || !joinCode.trim()">
          Gabung
        </button>
      </form>

      <form class="card" @submit.prevent="create">
        <h2 class="steps-title">
          Belum ada? Daftarkan madrasahmu
        </h2>
        <div class="field">
          <label class="form-label" for="schoolName">Nama madrasah</label>
          <input id="schoolName" v-model="newName" class="input" placeholder="mis. MTs Nurul Huda Kangean">
          <p class="hint">
            Kamu jadi admin dan dapat kode buat dibagikan ke guru lain.
          </p>
        </div>
        <button class="button full" :disabled="busy || !newName.trim()">
          Buat madrasah
        </button>
      </form>
    </div>

    <div v-else class="desktop-grid">
      <div class="card">
        <template v-if="isAdmin">
          <div class="section-header" style="margin-top:0">
            <h2>Guru</h2><span>{{ recap?.length ?? 0 }} orang</span>
          </div>
          <div v-for="t in recap" :key="t.email" class="rank-row">
            <div class="rank-person">
              <strong>{{ t.name || t.email }}{{ t.role === 'admin' ? ' · admin' : '' }}</strong>
              <small>{{ t.email }}</small>
            </div>
            <div style="text-align:right;font-size:13px;color:var(--muted)">
              {{ t.materials }} materi<br>{{ t.aiThisMonth }}x AI bulan ini
            </div>
          </div>
        </template>
        <template v-else>
          <p style="margin:0 0 16px">
            Kamu tergabung sebagai guru. Daftar kelas & siswa madrasah ini bisa kamu pakai di Kuis dan Leaderboard.
          </p>
          <button class="button full" :disabled="busy" @click="leave">
            Keluar dari madrasah
          </button>
        </template>
      </div>

      <div class="right-panel">
        <div v-if="planUntil" class="banner-yellow">
          <strong>Paket aktif</strong>
          Sampai {{ fmtDate(planUntil) }}. Kuota AI semua guru di madrasah ini naik.
        </div>
        <div v-else class="small-banner">
          <strong>Paket gratis.</strong> Kuota AI tiap guru terbatas per bulan.
          <template v-if="isAdmin && waLink">
            <a :href="waLink" target="_blank" rel="noopener" style="color:var(--primary-hover);font-weight:700">Tanya paket madrasah →</a>
          </template>
        </div>
        <div v-if="data.school.code" class="card">
          <div class="paper-label">
            Kode gabung
          </div>
          <div style="font:800 32px var(--font);letter-spacing:.15em;margin:8px 0 12px;font-variant-numeric:tabular-nums">
            {{ data.school.code }}
          </div>
          <button class="button yellow full" @click="copyCode">
            Salin kode
          </button>
          <p class="hint">
            Kirim ke grup WA guru. Siapa pun yang punya kode ini bisa gabung.
          </p>
        </div>
        <NuxtLink to="/siswa" class="feature-tile">
          <span class="tile-icon"><svg class="icon" viewBox="0 0 24 24"><path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8" /></svg></span>
          <span><strong>Kelas & siswa</strong><small>Atur daftar siswa per kelas</small></span>
          <span class="arrow">↗</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
