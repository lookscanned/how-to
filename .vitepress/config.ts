import { defineConfig } from "vitepress";
import { execSync } from "node:child_process";
import { version } from "../package.json";
import speculationRules from "./speculation-rules.json";

const gitCommit = execSync("git rev-parse HEAD").toString().trim();
const gitCommitTime: number =
  parseInt(
    execSync(`git show -s --format=%ct ${gitCommit}`).toString().trim(),
  ) * 1000;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  outDir: "dist",
  mpa: true,

  title: "Look Scanned How To",
  titleTemplate: false,
  description: "How to use Look Scanned",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
    ["link", { rel: "icon", href: "/favicon.ico", sizes: "48x48" }],
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    ["script", { type: "speculationrules" }, JSON.stringify(speculationRules)],
  ],

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
  },
});
