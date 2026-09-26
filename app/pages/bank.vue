<script setup lang="ts">
import { QUESTION_TYPES } from '~/constants/questions'

const { items: patterns, load, addMany, update, remove, legacyCount, importLegacy } = usePatterns()
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
    toast.add({ title: 'Contoh lama dipindah ke server.', color: 'success' })
  } catch {
    toast.add({ title: 'Gagal impor.', color: 'error' })
  } finally {
    importing.value = false
  }
}

const paste = ref('')
const type = ref<string>(QUESTION_TYPES[0])
const topic = ref('')
const pending = ref<string[]>([])

function split() {
  pending.value = parsePatterns(paste.value)
  if (!pending.value.length) toast.add({ title: 'Tempel soal dulu, lalu coba pisahkan.', color: 'error' })
}

async function save() {
  if (!pending.value.length) return
  try {
    await addMany(pending.value.map(text => ({ text, type: type.value, topic: topic.value.trim() })))
    pending.value = []
    paste.value = ''
    topic.value = ''
    toast.add({ title: 'Contoh soal tersimpan.', color: 'success' })
  } catch {
    toast.add({ title: 'Gagal menyimpan.', color: 'error' })
  }
}

async function saveEdit(p: Pattern) {
  try {
    await update(p.id, { type: p.type, topic: p.topic, text: p.text })
  } catch {
    toast.add({ title: 'Gagal menyimpan perubahan.', color: 'error' })
  }
}

async function removeItem(id: string) {
  try {
    await remove(id)
  } catch {
    toast.add({ title: 'Gagal menghapus.', color: 'error' })
  }
}
</script>

<template>
  <div>
    <div class="eyebrow">
      Referensi mengajar
    </div>
    <h1 class="heading">
      Bank contoh
    </h1>
    <p class="subhead">
      Kumpulkan pola soal dari WhatsApp/buku. Tempel banyak sekaligus, lalu rapikan tiap item.
    </p>

    <div class="desktop-grid">
      <div class="card">
        <div class="banner-yellow">
          <strong>Tempel → pisahkan → simpan</strong>
          Soal bernomor atau dipisah baris kosong akan jadi item sendiri.
        </div>
        <div class="row">
          <div class="field">
            <label class="form-label" for="bankType">Tipe soal</label>
            <select id="bankType" v-model="type" class="select">
              <option v-for="t in QUESTION_TYPES" :key="t">
                {{ t }}
              </option>
            </select>
          </div>
          <div class="field">
            <label class="form-label" for="bankTopic">Topik · opsional</label>
            <input id="bankTopic" v-model="topic" class="input" placeholder="Mis. Simple Past">
          </div>
        </div>
        <div class="field">
          <label class="form-label" for="bankPaste">Contoh soal</label>
          <textarea id="bankPaste" v-model="paste" class="textarea" rows="10" placeholder="1. She ___ to school every day.&#10;A. go B. goes C. going D. gone&#10;&#10;2. They ___ football on Sundays." />
        </div>
        <button class="button dark full" @click="split">
          Pisahkan & lihat hasil
        </button>
        <div v-if="pending.length" class="bank-preview">
          <b>{{ pending.length }} soal terbaca:</b><br>
          <template v-for="(x, i) in pending" :key="i">
            {{ i + 1 }}. {{ x.slice(0, 115) }}<br>
          </template>
        </div>
        <button v-if="pending.length" class="button yellow full" style="margin-top:10px" @click="save">
          Simpan contoh soal
        </button>
      </div>

      <div class="right-panel">
        <div v-if="legacy" class="banner-yellow" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <span><strong>{{ legacy }} contoh lama</strong> di perangkat ini.</span>
          <button class="button" :disabled="importing" style="flex:none" @click="doImport">
            {{ importing ? 'Memindah…' : 'Pindahkan' }}
          </button>
        </div>
        <div class="card">
          <div class="section-header" style="margin-top:0">
            <h2>Contoh tersimpan</h2><span>{{ patterns.length }} soal</span>
          </div>
          <div v-if="!patterns.length" class="empty">
            Belum ada contoh. Tempel beberapa soal di sebelah.
          </div>
          <article v-for="(p, i) in patterns" :key="p.id" class="bank-item">
            <small>{{ p.type }}{{ p.topic ? ` · ${p.topic}` : '' }}</small>
            <textarea v-model="p.text" rows="3" @change="saveEdit(p)" />
            <footer>
              <span style="font-size:10px;color:#999">Contoh #{{ i + 1 }}</span>
              <button @click="removeItem(p.id)">Hapus</button>
            </footer>
          </article>
        </div>
        <div class="small-banner">
          Topik contoh boleh beda dari materi. Saat bikin ujian, AI meniru gaya & formatnya, lalu menguji materi yang kamu pilih.
        </div>
      </div>
    </div>
  </div>
</template>
