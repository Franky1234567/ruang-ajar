<script setup lang="ts">
import { NAV } from '~/constants/nav'

import type { NavItem } from '~/constants/nav'

const route = useRoute()
const isActive = (item: NavItem) => {
  if (item.match) return item.match.some(p => route.path.startsWith(p))
  return item.to === '/' ? route.path === '/' : route.path.startsWith(item.to)
}

const { loggedIn, user, clear } = useUserSession()
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/login')
}
</script>

<template>
  <div class="app">
    <header class="topbar">
      <NuxtLink to="/" class="brand">
        ruang<i>ajar.</i>
      </NuxtLink>

      <nav class="desktop-nav">
        <NuxtLink v-for="item in NAV" :key="item.to" :to="item.to" :class="{ active: isActive(item) }">
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div style="display:flex;align-items:center;gap:8px">
        <NuxtLink to="/pengaturan" class="top-action">
          <span />Pengaturan
        </NuxtLink>
        <template v-if="loggedIn">
          <img v-if="user?.picture" :src="user.picture" :alt="user?.name || ''" referrerpolicy="no-referrer" style="width:30px;height:30px;border-radius:50%;border:1px solid #5a5a5a">
          <button class="top-action" style="cursor:pointer" @click="logout">
            Keluar
          </button>
        </template>
        <NuxtLink v-else to="/login" class="top-action">
          Masuk
        </NuxtLink>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <nav class="bottom-nav">
      <NuxtLink v-for="item in NAV" :key="item.to" :to="item.to" :class="{ active: isActive(item) }">
        <svg class="icon" viewBox="0 0 24 24" v-html="item.icon" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
