import { defineConfig } from "vitepress";
import { execSync } from "node:child_process";
import { version } from "../package.json";

const gitCommit = execSync("git rev-parse HEAD").toString().trim();
const gitCommitTime: number =
  parseInt(
    execSync(`git show -s --format=%ct ${gitCommit}`).toString().trim(),
  ) * 1000;

const langs = [
  "en",
  "zh",
  "zh-CN",
  "zh-TW",
  "zh-HK",
  "ja",
  "es",
  "fr",
  "de",
  "it",
  "ko",
  "ru",
  "pt",
  "ar",
  "hi",
  "tr",
  "nl",
  "sv",
  "pl",
  "vi",
  "th",
  "id",
  "he",
  "ms",
  "no",
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  title: "Look Scanned How To",
  description: "How to use Look Scanned",
  cleanUrls: true,
  lastUpdated: true,

  vite: {
    define: {
      __GIT_COMMIT__: JSON.stringify(gitCommit),
      __GIT_COMMIT_TIME__: gitCommitTime,
      __PACKAGE_VERSION__: JSON.stringify(version),
    },
  },

  sitemap: {
    hostname: "https://how-to.lookscanned.io",
    lastmodDateOnly: false,
    transformItems: (items) => {
      // Add PDF links to sitemap
      for (const lang of langs) {
        items.push({
          url: `/pdfs/how-to-use/${lang}.pdf`,
          changefreq: "monthly",
          priority: 0.5,
        });
      }
      return items;
    },
  },
});
