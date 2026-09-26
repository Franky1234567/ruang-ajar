<script setup lang="ts">
definePageMeta({ layout: false })

const { loggedIn } = useUserSession()
watchEffect(() => {
  if (loggedIn.value) navigateTo('/')
})
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;background:var(--bg);padding:24px">
    <div class="card" style="max-width:380px;text-align:center;box-shadow:4px 4px 0 #1b1b1b">
      <div class="brand" style="color:#171717;font-size:30px;margin-bottom:6px">
        ruang<i style="color:#d6a800">ajar.</i>
      </div>
      <p class="subhead" style="margin-bottom:22px">
        Masuk buat mulai nyiapin materi & nemenin murid latihan.
      </p>
      <a href="/auth/google" class="button dark full" style="text-decoration:none;gap:9px">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px" aria-hidden="true">
          <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.23 1.5-1.6 4.4-5.35 4.4a5.4 5.4 0 0 1 0-10.8c1.55 0 2.6.66 3.2 1.23l2.18-2.1A8.3 8.3 0 0 0 12 4a8.3 8.3 0 1 0 0 16.6c4.8 0 8-3.37 8-8.12 0-.55-.06-.96-.15-1.38z" />
        </svg>
        Masuk dengan Google
      </a>
      <p class="hint" style="margin-top:16px">
        Nggak perlu password. Datamu kesimpen aman & sinkron antar perangkat.
      </p>
    </div>
  </div>
</template>
