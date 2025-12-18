<template>
  <nav>
    <a href="https://lookscanned.io" class="site-title-link">
      <h2 class="site-title">
        <div class="align-middle">
          <ScannerSvg class="icon" />
          <span>Look Scanned</span>
        </div>
      </h2>
    </a>
  </nav>
</template>

<script setup lang="ts">
import ScannerSvg from "./ScannerSvg.vue";
</script>

<style scoped>
.icon {
  width: 1.2em;
  height: 1.2em;
  margin-right: 0.5em;
}

.align-middle {
  display: flex;
  align-items: center;
}

.site-title {
  font-weight: 600;
  font-size: 1.5em;
}

.site-title-link {
  text-decoration: none;
  color: inherit;
}

.site-title-link:hover {
  text-decoration: underline;
}
</style>
