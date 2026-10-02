<script setup lang="ts">
interface SchoolRow { id: string, name: string, code: string, planUntil: string | null, teachers: number, adminEmail: string | null }

const toast = useToast()
const { data: schools, error, refresh } = await useFetch<SchoolRow[]>('/api/admin/schools', { default: () => [] })

const active = (s: SchoolRow) => !!s.planUntil && new Date(s.planUntil) > new Date()
const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

// +6 bulan (satu semester) dari tanggal akhir paket yang masih jalan, atau dari hari ini.
function plusSemester(s: SchoolRow) {
  const base = active(s) ? new Date(s.planUntil!) : new Date()
  base.setMonth(base.getMonth() + 6)
  return base.toISOString().slice(0, 10)
}

const dates = reactive<Record<string, string>>({})
async function setPlan(s: SchoolRow, until: string | null) {
  const label = until ? `aktif sampai ${until}` : 'dicabut'
  if (!confirm(`Paket ${s.name} ${label}?`)) return
  try {
    await $fetch(`/api/admin/schools/${s.id}/plan`, { method: 'POST', body: { until } })
    await refresh()
    toast.add({ title: `Paket ${s.name} ${label}.`, color: 'success' })
  } catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ title: err.data?.statusMessage || 'Gagal menyimpan.', color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="eyebrow">
      Pengelola ruangajar
    </div>
    <h1 class="heading">
      Paket madrasah
    </h1>
    <p class="subhead">
      Aktifkan paket setelah madrasah bayar (transfer / QRIS). Satu klik = +1 semester.
    </p>

    <div v-if="error" class="empty">
      Halaman ini khusus pengelola. Pastikan emailmu ada di SUPERADMIN_EMAILS.
    </div>
    <div v-else-if="!schools.length" class="empty">
      Belum ada madrasah yang daftar.
    </div>

    <div v-for="s in schools" :key="s.id" class="card">
      <div class="section-header" style="margin-top:0">
        <h2>{{ s.name }}</h2>
        <span class="inline-chip" :style="active(s) ? '' : 'background:var(--bg);color:var(--muted)'">
          {{ active(s) ? `Aktif s/d ${fmt(s.planUntil!)}` : 'Gratis' }}
        </span>
      </div>
      <p class="hint" style="margin:0 0 14px">
        Kode {{ s.code }} · {{ s.teachers }} guru · admin {{ s.adminEmail || '—' }}
      </p>
      <div class="wide-actions" style="margin-top:0">
        <button class="button dark" @click="setPlan(s, plusSemester(s))">
          +1 semester
        </button>
        <input v-model="dates[s.id]" class="input" type="date" :aria-label="`Tanggal akhir paket ${s.name}`" style="flex:1 1 160px">
        <button class="button" :disabled="!dates[s.id]" @click="setPlan(s, dates[s.id]!)">
          Set tanggal
        </button>
        <button v-if="active(s)" class="button" style="color:var(--danger)" @click="setPlan(s, null)">
          Cabut
        </button>
      </div>
    </div>
  </div>
</template>
