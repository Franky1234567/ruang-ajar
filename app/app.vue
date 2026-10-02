<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512.png' },
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'apple-touch-icon', href: '/favicon-512.png' }
  ]
})

const title = 'ruangajar'
useSeoMeta({
  title,
  titleTemplate: t => (t && t !== title ? `${t} · ${title}` : 'ruangajar — ruang kelas'),
  description: 'Satu tempat buat nyiapin pelajaran dan menemani murid latihan.'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
