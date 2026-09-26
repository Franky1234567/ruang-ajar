# Ruang Ajar

Asisten mengajar untuk guru: susun materi, bikin ujian, cek jawaban murid, kuis, dan papan peringkat — semua dibantu AI. Multi-guru (login Google), data tersimpan per-guru dan sinkron antar perangkat.

Bukan cuma Bahasa Inggris — AI menyesuaikan mata pelajaran dari topik (Matematika, Bahasa Arab, IPA, dll).

## Fitur

- **Susun Materi** — dari satu topik, AI menyusun draf lengkap (tujuan, penjelasan, pola, contoh, latihan, kunci). Bisa **upload foto/PDF** materi sebagai acuan (Gemini vision).
- **Generate massal** — upload 1 PDF berisi banyak topik → AI pecah tiap topik jadi materi terpisah otomatis.
- **Bank Contoh** — tempel banyak contoh soal sekaligus, auto dipisah jadi item.
- **Buat Ujian** — pilih materi + tipe soal → AI generate soal ujian yang meniru gaya contoh di Bank, bisa diedit & disalin.
- **Cek Jawaban** — murid menjawab, AI memberi masukan + skor, guru menyetujui sebelum poin masuk.
- **Kuis** — AI membuat soal pilihan ganda dari sebuah topik, dimainkan satu per satu.
- **Papan Peringkat** — poin dari kuis & cek jawaban, dengan podium berkarakter.

## Stack

- [Nuxt 4](https://nuxt.com) · [Nuxt UI](https://ui.nuxt.com) · TypeScript · Tailwind CSS
- [Neon](https://neon.tech) Postgres + [Drizzle ORM](https://orm.drizzle.team)
- [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) — Google OAuth (SSO)
- Google **Gemini** untuk AI (fallback ke **Groq** saat limit)
- Deploy di [Vercel](https://vercel.com)

## Setup

```bash
pnpm install
cp .env.example .env      # isi kredensial (lihat di bawah)
pnpm db:push              # buat tabel di database
pnpm dev                  # http://localhost:3000
```

### Environment

```
GEMINI_API_KEY=                 # wajib — Google AI Studio
GROQ_API_KEY=                   # opsional — fallback saat Gemini limit
DATABASE_URL=                   # Neon connection string (pooled)
NUXT_OAUTH_GOOGLE_CLIENT_ID=    # Google Cloud → OAuth client (Web)
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=
NUXT_SESSION_PASSWORD=          # teks acak min. 32 karakter
```

Authorized redirect URI di Google OAuth: `http://localhost:3000/auth/google` (dev) dan `https://<domain>/auth/google` (produksi).

## Deploy (Vercel)

1. Import repo — Nuxt terdeteksi otomatis.
2. Set semua environment variable di atas.
3. Tambahkan redirect URI produksi di Google OAuth.

```bash
pnpm build      # build produksi
pnpm preview    # preview lokal
```
