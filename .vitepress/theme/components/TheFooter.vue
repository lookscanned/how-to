<script setup lang="ts">
// @ts-expect-error - VitePress define
const version: string = __PACKAGE_VERSION__;
// @ts-expect-error - VitePress define
const gitCommit: string = __GIT_COMMIT__;
// @ts-expect-error - VitePress define
const gitCommitTime: number = __GIT_COMMIT_TIME__;

const gitShortCommit = gitCommit.slice(0, 8);
const githubURL = `https://github.com/lookscanned/how-to/commit/${gitCommit}`;
const releaseURL = `https://github.com/lookscanned/how-to/releases/tag/v${version}`;
</script>

<template>
  <footer class="footer">
    Version:
    <a :href="releaseURL" class="github-link">{{ version }}</a
    >&nbsp;<a :href="githubURL" class="github-link">({{ gitShortCommit }})</a>
    at
    {{ new Date(gitCommitTime).toLocaleString() }}
  </footer>
</template>

<style scoped>
.footer {
  position: absolute;
  transform: translateY(calc(1in + 0.7em)) translateX(calc(-1in + 0.7em));
  opacity: 0.7;
  font-size: 0.7em;
}

.github-link {
  text-decoration: none;
  color: inherit;
}

.github-link:hover {
  text-decoration: underline;
}

@media print {
  .footer {
    display: none;
  }
}
</style>
