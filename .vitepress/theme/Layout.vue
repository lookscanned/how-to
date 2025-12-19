<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useData, Content } from "vitepress";
import SiteTitle from "./components/SiteTitle.vue";
import ThePageControls from "./components/ThePageControls.vue";
import TheFooter from "./components/TheFooter.vue";

const { frontmatter } = useData();

const rtlLangs = ["ar", "he"];
</script>

<template>
  <main class="container">
    <ThePageControls v-if="!frontmatter.home" />
    <SiteTitle />
    <article
      class="article"
      :lang="frontmatter.lang"
      :dir="rtlLangs.includes(frontmatter.lang) ? 'rtl' : 'ltr'"
    >
      <Content />
    </article>
    <TheFooter />
  </main>
</template>

<style scoped>
.container {
  font-size: 1.3rem;
  /* A4 size */
  width: 210mm;
  /* align center */
  margin: 0 auto;
  padding: 1in;
}

@media print {
  .container {
    /* margin: 0; */
    padding: 0;
  }
}

@media screen {
  .container {
    /* add shadow */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    margin-top: 1in;
    margin-bottom: 1in;
  }

  @media (prefers-color-scheme: dark) {
    .container {
      background-color: #2e2e2e;
    }
  }
}

.article {
  font-size: 1.5rem;
}

.article :deep(a) {
  color: inherit;
  text-decoration: none;
}

.article :deep(a):hover {
  text-decoration: underline;
}

.article :deep(h2) {
  font-size: 1.17em;
}

.article :deep(p) {
  text-align: justify;
}

.article :deep(h1) {
  font-size: 1.5em;
}
</style>

<style>
@page {
  size: A4;
  margin: 1in; /* Default print margin */
}
</style>
