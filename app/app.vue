<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap' }
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
