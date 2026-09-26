<script setup lang="ts">
const { items: materials, load, add, update, remove, legacyCount, importLegacy } = useMaterials()
const settings = useSettings()
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
    legacy.value = 0
    toast.add({ title: 'Materi lama berhasil dipindah ke server.', color: 'success' })
  } catch {
    toast.add({ title: 'Gagal impor materi lama.', color: 'error' })
  } finally {
    importing.value = false
  }
}

const vAutogrow = {
  mounted(el: HTMLTextAreaElement) {
    const grow = () => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` }
    el.addEventListener('input', grow)
    nextTick(grow)
  },
  updated(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
}

const today = new Date().toISOString().slice(0, 10)
const form = reactive({ date: today, klass: 'SMP kelas 8', topic: '', goal: '', reference: '' })
onMounted(() => { form.klass = settings.value.defaultClass || form.klass })

const loading = ref(false)
const hasDraft = ref(false)
const editingId = ref<string | null>(null)
const draft = reactive({ title: '', explanation: '', pattern: '', examples: '', exercises: '', answerKey: '' })

const file = ref<File | null>(null)
function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

async function generate() {
  if (!form.topic.trim()) {
    toast.add({ title: 'Isi topiknya dulu.', color: 'error' })
    return
  }
  editingId.value = null
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('topic', form.topic)
    fd.append('klass', form.klass)
    fd.append('goal', form.goal)
    fd.append('reference', form.reference)
    if (settings.value.apiKey) fd.append('apiKey', settings.value.apiKey)
    if (settings.value.model) fd.append('model', settings.value.model)
    if (file.value) fd.append('file', file.value)

    const res = await $fetch<typeof draft>('/api/material', { method: 'POST', body: fd })
    Object.assign(draft, res)
    hasDraft.value = true
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ title: 'Gagal menyusun materi', description: err.data?.statusMessage || err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

async function save() {
  const data = {
    date: form.date,
    klass: form.klass,
    topic: form.topic,
    goal: form.goal || draft.explanation.slice(0, 80),
    title: draft.title,
    explanation: draft.explanation,
    pattern: draft.pattern,
    examples: draft.examples,
    exercises: draft.exercises,
    answerKey: draft.answerKey
  }
  loading.value = true
  try {
    if (editingId.value) {
      await update(editingId.value, data)
      toast.add({ title: 'Materi diperbarui.', color: 'success' })
    } else {
      await add(data)
      toast.add({ title: 'Materi tersimpan ke server.', color: 'success' })
    }
    hasDraft.value = false
    editingId.value = null
  } catch {
    toast.add({ title: 'Gagal menyimpan materi.', color: 'error' })
  } finally {
    loading.value = false
  }
}

function openMaterial(m: Material) {
  Object.assign(form, { date: m.date, klass: m.klass, topic: m.topic, goal: m.goal, reference: '' })
  Object.assign(draft, {
    title: m.title, explanation: m.explanation, pattern: m.pattern,
    examples: m.examples ?? '', exercises: m.exercises, answerKey: m.answerKey ?? ''
  })
  hasDraft.value = true
  editingId.value = m.id
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function removeMaterial(id: string) {
  try {
    await remove(id)
  } catch {
    toast.add({ title: 'Gagal menghapus.', color: 'error' })
  }
  if (editingId.value === id) { hasDraft.value = false; editingId.value = null }
}

// Dari halaman lihat materi: /materi?edit=<id> → langsung buka buat edit.
const route = useRoute()
onMounted(async () => {
  await load()
  const id = route.query.edit as string | undefined
  const m = id && materials.value.find(x => x.id === id)
  if (m) openMaterial(m)
})
</script>

<template>
  <div>
    <div class="eyebrow">
      Persiapan mengajar
    </div>
    <h1 class="heading">
      Susun materi
    </h1>
    <p class="subhead">
      Tulis topik dan tempel contoh. Drafnya bisa langsung kamu edit.
    </p>

    <div class="desktop-grid">
      <div class="card">
        <div class="row">
          <div class="field">
            <label class="form-label" for="date">Tanggal</label>
            <input id="date" v-model="form.date" class="input" type="date">
          </div>
          <div class="field">
            <label class="form-label" for="level">Kelas</label>
            <input id="level" v-model="form.klass" class="input">
          </div>
        </div>
        <div class="field">
          <label class="form-label" for="topic">Topik hari ini</label>
          <input id="topic" v-model="form.topic" class="input" placeholder="mis. Present Continuous Tense">
        </div>
        <div class="field">
          <label class="form-label" for="goal">Yang ingin murid kuasai</label>
          <textarea id="goal" v-model="form.goal" class="textarea" rows="3" placeholder="mis. Membuat kalimat kegiatan yang sedang berlangsung." />
        </div>

        <div class="reference-box">
          <h3>Tempel / upload referensimu ✳</h3>
          <p>Boleh teks, atau upload foto/PDF materi yang kamu temukan — AI baca isinya jadi acuan.</p>
          <textarea v-model="form.reference" class="textarea" rows="5" placeholder="Struktur: penjelasan → pola kalimat → 3 contoh → latihan.&#10;Contoh soal: She ___ a book now. (read)" />
          <label class="form-label" style="margin-top:10px">Upload foto / PDF materi · opsional</label>
          <input type="file" accept="image/*,application/pdf" class="input" @change="onFile">
          <p v-if="file" class="hint">
            📎 {{ file.name }} — bakal dibaca AI sebagai referensi.
          </p>
        </div>

        <button class="button dark full" :disabled="loading" @click="generate">
          {{ loading ? 'Menyusun…' : '✦ Susunkan materi' }}
        </button>
      </div>

      <div class="right-panel">
        <div v-if="hasDraft" class="preview-paper">
          <div class="paper-label">
            DRAF MATERI · KETUK UNTUK EDIT
          </div>
          <textarea v-model="draft.title" v-autogrow class="paper-edit paper-title" rows="1" />
          <span class="inline-chip">{{ form.klass || 'Umum' }}</span>
          <div class="paper-rule" />
          <div class="paper-section">
            <strong>01 / Tujuan belajar</strong>
            <textarea v-model="form.goal" v-autogrow class="paper-edit" rows="1" />
          </div>
          <div class="paper-section">
            <strong>02 / Penjelasan</strong>
            <textarea v-model="draft.explanation" v-autogrow class="paper-edit" rows="1" />
          </div>
          <div class="paper-section highlight">
            <strong>03 / Pola kalimat</strong>
            <textarea v-model="draft.pattern" v-autogrow class="paper-edit" rows="1" />
          </div>
          <div class="paper-section">
            <strong>04 / Contoh</strong>
            <textarea v-model="draft.examples" v-autogrow class="paper-edit" rows="1" />
          </div>
          <div class="paper-section">
            <strong>05 / Latihan</strong>
            <textarea v-model="draft.exercises" v-autogrow class="paper-edit" rows="1" />
          </div>
          <div class="paper-section highlight">
            <strong>06 / Kunci jawaban</strong>
            <textarea v-model="draft.answerKey" v-autogrow class="paper-edit" rows="1" />
          </div>
        </div>
        <div v-else class="empty">
          Draf materi muncul di sini setelah kamu klik “Susunkan materi”.
        </div>

        <button v-if="hasDraft" class="button yellow full" @click="save">
          {{ editingId ? 'Simpan perubahan →' : 'Simpan ke log mengajar →' }}
        </button>
      </div>
    </div>

    <div class="section-header">
      <h2>Materi tersimpan</h2><span>{{ materials.length }} materi</span>
    </div>
    <div v-if="legacy" class="banner-yellow" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <span>Ada <strong>{{ legacy }} materi lama</strong> di perangkat ini yang belum kepindah ke server.</span>
      <button class="button" :disabled="importing" style="flex:none" @click="doImport">
        {{ importing ? 'Memindah…' : 'Pindahkan ke server' }}
      </button>
    </div>
    <p v-if="!materials.length" class="empty">
      Belum ada materi tersimpan. Susun di atas lalu simpan.
    </p>
    <div class="stack">
      <div v-for="m in materials" :key="m.id" class="card" style="margin-bottom:0">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
          <div style="min-width:0">
            <strong style="font:700 16px Outfit,sans-serif;display:block">{{ m.title || m.topic }}</strong>
            <p style="font-size:11px;color:#81858a;margin:3px 0 0">{{ m.klass || 'Umum' }} · {{ m.date }}</p>
            <p v-if="m.goal" style="font-size:12px;color:#52555a;margin:7px 0 0">{{ m.goal }}</p>
          </div>
          <div style="display:flex;gap:6px;flex:none">
            <NuxtLink :to="`/materi/${m.id}`" class="button" style="min-height:38px;padding:7px 12px">
              Lihat
            </NuxtLink>
            <button class="button" style="min-height:38px;padding:7px 12px" @click="openMaterial(m)">
              Edit
            </button>
            <button class="button" style="min-height:38px;padding:7px 10px;color:#b44c56" @click="removeMaterial(m.id)">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
