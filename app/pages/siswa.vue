<script setup lang="ts">
interface ClassRow { id: string, name: string, ownerId: string, studentCount: number }
interface Student { id: string, nis: string, name: string, gender: string | null }

const toast = useToast()
const { data: classes, refresh: refreshClasses } = await useFetch<ClassRow[]>('/api/classes', { default: () => [] })

const selectedId = ref<string | null>(null)
watchEffect(() => {
  if (!selectedId.value && classes.value.length) selectedId.value = classes.value[0]!.id
})
const selected = computed(() => classes.value.find(c => c.id === selectedId.value))

const students = ref<Student[]>([])
watch(selectedId, async (id) => {
  students.value = id ? await $fetch<Student[]>(`/api/classes/${id}/students`).catch(() => []) : []
}, { immediate: true })

function fail(e: unknown, fallback: string) {
  const err = e as { data?: { statusMessage?: string } }
  toast.add({ title: err.data?.statusMessage || fallback, color: 'error' })
}

const newClass = ref('')
async function addClass() {
  try {
    const row = await $fetch<ClassRow>('/api/classes', { method: 'POST', body: { name: newClass.value } })
    newClass.value = ''
    await refreshClasses()
    selectedId.value = row.id
  } catch (e) {
    fail(e, 'Gagal membuat kelas.')
  }
}

async function removeClass() {
  if (!selected.value || !confirm(`Hapus kelas ${selected.value.name} beserta semua siswanya?`)) return
  try {
    await $fetch(`/api/classes/${selected.value.id}`, { method: 'DELETE' })
    selectedId.value = null
    await refreshClasses()
  } catch (e) {
    fail(e, 'Gagal menghapus kelas.')
  }
}

const paste = ref('')
const pending = computed(() => parseRoster(paste.value))
async function saveStudents() {
  if (!selected.value || !pending.value.length) return
  try {
    const rows = await $fetch<Student[]>(`/api/classes/${selected.value.id}/students`, { method: 'POST', body: pending.value })
    students.value = [...students.value, ...rows].sort((a, b) => a.name.localeCompare(b.name))
    paste.value = ''
    await refreshClasses()
    toast.add({ title: `${rows.length} siswa ditambahkan.`, color: 'success' })
  } catch (e) {
    fail(e, 'Gagal menyimpan siswa.')
  }
}

async function removeStudent(s: Student) {
  try {
    await $fetch(`/api/students/${s.id}`, { method: 'DELETE' })
    students.value = students.value.filter(x => x.id !== s.id)
    await refreshClasses()
  } catch (e) {
    fail(e, 'Gagal menghapus siswa.')
  }
}
</script>

<template>
  <div>
    <div class="eyebrow">
      Kelas
    </div>
    <h1 class="heading">
      Kelas & siswa
    </h1>
    <p class="subhead">
      Isi sekali, dipakai di Kuis dan Leaderboard. Kalau kamu tergabung di madrasah, daftar ini dipakai bareng guru lain.
    </p>

    <div class="desktop-grid">
      <div class="card">
        <form class="field" style="display:flex;gap:8px" @submit.prevent="addClass">
          <input v-model="newClass" class="input" placeholder="Nama kelas baru, mis. 7A" aria-label="Nama kelas baru">
          <button class="button dark" style="flex:none" :disabled="!newClass.trim()">
            Tambah
          </button>
        </form>

        <div v-if="!classes.length" class="empty">
          Belum ada kelas. Tambah satu dulu, mis. "7A".
        </div>
        <div v-else class="stack" style="gap:8px">
          <button
            v-for="c in classes"
            :key="c.id"
            class="toggle-row"
            :style="c.id === selectedId ? 'border-color:var(--primary-line);background:var(--primary-soft)' : ''"
            :aria-pressed="c.id === selectedId"
            @click="selectedId = c.id"
          >
            <span>{{ c.name }}</span>
            <span style="font-weight:500;color:var(--subtle)">{{ c.studentCount }} siswa</span>
          </button>
        </div>
      </div>

      <div v-if="selected" class="right-panel">
        <div class="card">
          <div class="section-header" style="margin-top:0">
            <h2>{{ selected.name }}</h2>
            <button class="button" style="min-height:36px;color:var(--danger)" @click="removeClass">
              Hapus kelas
            </button>
          </div>

          <div class="field">
            <label class="form-label" for="rosterPaste">Tambah siswa</label>
            <textarea id="rosterPaste" v-model="paste" class="textarea" rows="5" placeholder="Tempel dari Excel (NIS, Nama, L/P), satu siswa per baris&#10;12345&#9;Ahmad Fauzi&#9;L&#10;12346&#9;Siti Aminah&#9;P" />
            <p class="hint">
              Boleh langsung blok kolom di Excel lalu tempel. Kolom NIS dan L/P opsional.
            </p>
          </div>
          <button v-if="pending.length" class="button dark full" @click="saveStudents">
            Simpan {{ pending.length }} siswa
          </button>

          <div class="section-header">
            <h2>Siswa</h2><span>{{ students.length }} orang</span>
          </div>
          <div v-if="!students.length" class="empty">
            Belum ada siswa di kelas ini.
          </div>
          <div v-for="s in students" :key="s.id" class="rank-row">
            <div class="avatar" :class="s.gender === 'P' ? 'a3' : s.gender === 'L' ? '' : 'a4'">
              {{ s.gender || '?' }}
            </div>
            <div class="rank-person">
              <strong>{{ s.name }}</strong>
              <small>{{ s.nis ? `NIS ${s.nis}` : 'Tanpa NIS' }}</small>
            </div>
            <button class="button" style="min-height:36px;padding:6px 10px;color:var(--danger)" :aria-label="`Hapus ${s.name}`" @click="removeStudent(s)">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
