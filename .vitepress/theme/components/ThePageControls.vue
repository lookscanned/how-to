<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { page } = useData();

const pdfPath = computed(() => {
  const path = page.value.relativePath.replace(/\.md$/, "");
  return `/pdfs/${path}.pdf`;
});
</script>

<template>
  <div class="controls">
    <a class="button" href="/">Back</a>
    |
    <a class="button" href="javascript: window.print()">Print</a>
    |
    <a class="button" :href="pdfPath" download>PDF</a>
  </div>
</template>

<style scoped>
.controls {
  position: absolute;
  transform: translateY(calc(-1in - 2em)) translateX(calc(-1in));

  font-weight: 300;
  font-size: 0.8em;
}

@media print {
  .controls {
    display: none;
  }
}

.button {
  all: unset;
  cursor: pointer;
}

.button:hover {
  text-decoration: underline;
}
</style>
