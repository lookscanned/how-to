<template>
  <div>
    <SiteTitle />
    <div class="home-body">
      <h2>How to use Look Scanned</h2>
      <ul>
        <li v-for="lang in langs" :key="lang">
          <router-link :to="`/how-to-use/${lang}`" :lang="lang">
            <span lang="en" class="lang-code">{{ lang }} / </span>
            {{ languages[lang] }}
          </router-link>
        </li>
      </ul>
      <h2>License</h2>
      <p>MIT</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import SiteTitle from '@/components/SiteTitle.vue'
import { markdowns } from '@/locales/how-to-use/markdowns'
import { languages } from '@/locales/display'
import { RouterLink } from 'vue-router'

const langs = Object.keys(markdowns).sort() as (keyof typeof markdowns)[]
</script>

<style scoped>
.home-body {
  font-size: 1.5rem;
}

.home-body a {
  color: inherit;
  text-decoration: none;
}

.home-body a:hover {
  text-decoration: underline;
}

.home-body h2 {
  font-size: 1.17em;
}

.lang-code {
  font-family: monospace;
}
</style>
