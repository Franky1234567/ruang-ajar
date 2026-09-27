<script setup lang="ts">
const { items, load, addMany, toggleLearned, remove } = useVocab()
const settings = useSettings()
const toast = useToast()

const theme = ref('')
const count = ref(15)
const klass = ref('SMP kelas 8')
const loading = ref(false)
const preview = ref<{ word: string, meaning: string, example: string }[]>([])
const saving = ref(false)

onMounted(async () => {
  await load()
  klass.value = settings.value.defaultClass || klass.value
})

async function generate() {
  if (!theme.value.trim()) {
    toast.add({ title: 'Isi temanya dulu.', color: 'error' })
    return
  }
  loading.value = true
  preview.value = []
  try {
    preview.value = await $fetch('/api/vocab/generate', {
      method: 'POST',
      body: {
        theme: theme.value,
        count: count.value,
        klass: klass.value,
        focus: settings.value.focus || undefined,
        apiKey: settings.value.apiKey || undefined,
        model: settings.value.model || undefined
      }
    })
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    toast.add({ title: 'Gagal generate vocab', description: err.data?.statusMessage || err.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

async function saveAll() {
  if (!preview.value.length) return
  saving.value = true
  try {
    await addMany(preview.value.map(v => ({ ...v, theme: theme.value.trim(), klass: klass.value })))
    toast.add({ title: `${preview.value.length} vocab tersimpan.`, color: 'success' })
    preview.value = []
    theme.value = ''
  } catch {
    toast.add({ title: 'Gagal menyimpan.', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function doToggle(v: Vocab) {
  try {
    await toggleLearned(v)
  } catch {
    toast.add({ title: 'Gagal update.', color: 'error' })
  }
}

async function removeItem(id: string) {
  try {
    await remove(id)
  } catch {
    toast.add({ title: 'Gagal menghapus.', color: 'error' })
  }
}

const filter = ref<'all' | 'no' | 'yes'>('all')
const shown = computed(() =>
  items.value.filter(v => filter.value === 'all' || (filter.value === 'yes') === v.learned)
)
const learnedCount = computed(() => items.value.filter(v => v.learned).length)
</script>

<template>
  <div>
    <div class="eyebrow">
      Kosakata
    </div>
    <h1 class="heading">
      Bank Vocab
    </h1>
    <p class="subhead">
      Generate kosakata per tema, lalu tandai kata yang sudah dihafal murid.
    </p>

    <div class="desktop-grid">
      <div class="card">
        <div class="banner-yellow" style="display:block">
          <strong>Generate kosakata by tema</strong>
          Isi tema (mis. Anggota Badan, Buah, Kata Kerja), pilih jumlahnya, AI keluarin kata + arti + contoh.
        </div>
        <div class="row">
          <div class="field">
            <label class="form-label" for="theme">Tema</label>
            <input id="theme" v-model="theme" class="input" placeholder="mis. Anggota Badan">
          </div>
          <div class="field">
            <label class="form-label" for="vcount">Jumlah</label>
            <input id="vcount" v-model.number="count" class="input" type="number" min="1" max="40">
          </div>
        </div>
        <div class="field">
          <label class="form-label" for="vclass">Kelas / level</label>
          <input id="vclass" v-model="klass" class="input" placeholder="mis. MI kelas 3">
        </div>
        <button class="button dark full" :disabled="loading" @click="generate">
          {{ loading ? 'Membuat…' : '✦ Generate vocab' }}
        </button>

        <template v-if="preview.length">
          <div class="label" style="margin-top:16px">
            Hasil ({{ preview.length }})
          </div>
          <div class="ex" style="max-height:280px;overflow:auto">
            <div v-for="(v, i) in preview" :key="i" class="exrow">
              <span class="en">{{ v.word }}</span> <span class="arti">— {{ v.meaning }}</span>
            </div>
          </div>
          <button class="button yellow full" style="margin-top:10px" :disabled="saving" @click="saveAll">
            {{ saving ? 'Menyimpan…' : `Simpan ${preview.length} vocab` }}
          </button>
        </template>
      </div>

      <div class="right-panel">
        <div class="section-header" style="margin-top:0">
          <h2>Tersimpan</h2>
          <span>{{ learnedCount }} / {{ items.length }} hafal</span>
        </div>
        <div v-if="items.length" style="display:flex;gap:7px;margin-bottom:12px">
          <button class="button" :class="{ yellow: filter === 'all' }" style="min-height:34px;padding:5px 12px" @click="filter = 'all'">
            Semua
          </button>
          <button class="button" :class="{ yellow: filter === 'no' }" style="min-height:34px;padding:5px 12px" @click="filter = 'no'">
            Belum
          </button>
          <button class="button" :class="{ yellow: filter === 'yes' }" style="min-height:34px;padding:5px 12px" @click="filter = 'yes'">
            Hafal
          </button>
        </div>

        <p v-if="!items.length" class="empty">
          Belum ada vocab. Generate di sebelah.
        </p>
        <div class="stack">
          <div v-for="v in shown" :key="v.id" class="card" style="margin-bottom:0;padding:13px 15px">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:start">
              <div style="min-width:0">
                <strong style="font:700 15px Outfit,sans-serif">{{ v.word }}</strong>
                <span style="color:var(--muted);font-size:13px"> — {{ v.meaning }}</span>
                <p v-if="v.example" style="font-size:12px;color:#77857f;margin:4px 0 0">
                  {{ v.example }}
                </p>
                <span v-if="v.theme" style="font-size:10px;color:#999">#{{ v.theme }}</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:5px;flex:none;align-items:end">
                <button
                  class="button"
                  :class="{ yellow: v.learned }"
                  style="min-height:32px;padding:5px 11px;white-space:nowrap"
                  @click="doToggle(v)"
                >
                  {{ v.learned ? '✓ Hafal' : 'Tandai hafal' }}
                </button>
                <button style="border:0;background:transparent;color:#b44c56;font-size:11px;font-weight:800;cursor:pointer" @click="removeItem(v.id)">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
