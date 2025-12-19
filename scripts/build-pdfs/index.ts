import puppeteer, { type Browser } from "puppeteer";
import { dirname, join } from "path";
import { mkdir, rm, readdir, writeFile, utimes } from "fs/promises";
import { build, serve } from "vitepress";
import { getGitCommitDateUTC, toPdfDateStringUTC } from "./git-commit-date.js";
import { compressPdf } from "./pdf-compress.js";
import { renderPdfFromUrl } from "./pdf-generate.js";

const outputDir = new URL("../../docs/public/pdfs", import.meta.url).pathname;
const distHowToUseDir = new URL("../../dist/how-to-use", import.meta.url)
  .pathname;

const gitCommitDateUTC = await getGitCommitDateUTC();
console.log("🕒 Git commit time (UTC):", gitCommitDateUTC.toISOString());
const gitCommitPdfDate = toPdfDateStringUTC(gitCommitDateUTC);

/**
 * Get available languages from dist directory
 */
async function getAvailableLangs(): Promise<string[]> {
  const files = await readdir(distHowToUseDir);
  const langs = files
    .filter((file) => file.endsWith(".html"))
    .map((file) => file.replace(/\.html$/, ""))
    .sort();
  console.log(`📋 Found ${langs.length} languages: ${langs.join(", ")}`);
  return langs;
}

/**
 * Generate a single PDF for a language
 */
async function generatePdfForLang(
  browser: Browser,
  baseUrl: string,
  lang: string,
): Promise<void> {
  const url = `${baseUrl}/how-to-use/${lang}`;
  const savePath = join(outputDir, `how-to-use/${lang}.pdf`);

  // Render PDF from URL
  const pdfBuffer = await renderPdfFromUrl(browser, url);

  // Compress and stamp PDF
  console.log("🗜️  Compressing with MuPDF.js...");
  const compressed = compressPdf(
    pdfBuffer.buffer as ArrayBuffer,
    gitCommitPdfDate,
  );

  // Write to file
  await mkdir(dirname(savePath), { recursive: true });
  await writeFile(savePath, compressed);

  // Align filesystem timestamps (mtime/atime) to the git commit time
  await utimes(savePath, gitCommitDateUTC, gitCommitDateUTC);

  console.log(`✅ PDF saved to ${savePath}`);
}

async function main() {
  let browser: Browser | null = null;
  let polka: Awaited<ReturnType<typeof serve>> | null = null;

  try {
    // Remove the output dir
    await rm(outputDir, { recursive: true, force: true });

    console.log("🏗️ Building VitePress site...");
    await build();
    console.log("✅ Build completed");

    const langs = await getAvailableLangs();
    if (langs.length === 0) {
      throw new Error("No language files found in dist directory");
    }

    console.log("🌐 Starting preview server...");
    polka = await serve();
    const address = polka.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to get port from preview server");
    }

    const baseUrl = `http://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`;
    console.log(`🌐 Server running at ${baseUrl}`);

    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const lang of langs) {
      await generatePdfForLang(browser, baseUrl, lang);
    }

    console.log("✅ All PDFs generated successfully");
  } catch (error) {
    console.error("🚨 An error occurred:", error);
    process.exitCode = 1;
  } finally {
    polka?.server.close();
    if (browser) await browser.close();
  }
}

main();
