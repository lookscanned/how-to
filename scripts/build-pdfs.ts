import { exec } from "child_process";
import puppeteer, { type Browser } from "puppeteer";
import { dirname, join } from "path";
import { mkdir, rm, readdir } from "fs/promises";
import { promisify } from "util";
import { execSync } from "child_process";

const outputDir = new URL("../docs/public/pdfs", import.meta.url).pathname;
const distHowToUseDir = new URL("../dist/how-to-use", import.meta.url).pathname;

const execAsync = promisify(exec);

// remove the output dir
await rm(outputDir, { recursive: true, force: true });

// YYYY:MM:DD HH:MM:SS±HH:MM
async function getGitCommitUTC() {
  const { stdout } = await execAsync("git log -1 --format=%at");
  const commitTimestamp = parseInt(stdout.trim());
  const commitDate = new Date(commitTimestamp * 1000);
  return commitDate
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+Z$/, "+00:00");
}
const gitCommitUTC = await getGitCommitUTC();
console.log("🕒 Git commit time:", gitCommitUTC);

// Generate a PDF from a given URL
async function generatePDF(browser: Browser, url: string, savePath: string) {
  const page = await browser.newPage();
  try {
    console.log(`📄 Generating PDF for ${url}...`);

    console.log(`🔗 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    await mkdir(dirname(savePath), { recursive: true });
    await page.pdf({ path: savePath, format: "a4" });

    // modify the pdf file creation and modification time to the git commit time
    await execAsync(
      [
        "exiftool",
        "-overwrite_original",
        `-AllDates="${gitCommitUTC}"`,
        savePath,
      ].join(" "),
    );

    console.log("🧹 Cleaning PDF...");
    await execAsync(["mutool", "clean", "-gggg", savePath, savePath].join(" "));

    console.log(`✅ PDF saved to ${savePath}`);
  } finally {
    await page.close();
  }
}

// Get available languages from dist directory
async function getAvailableLangs(): Promise<string[]> {
  try {
    const files = await readdir(distHowToUseDir);
    const langs = files
      .filter((file) => file.endsWith(".html"))
      .map((file) => file.replace(/\.html$/, ""))
      .sort();
    console.log(`📋 Found ${langs.length} languages: ${langs.join(", ")}`);
    return langs;
  } catch (error) {
    console.error(
      `❌ Failed to read languages from ${distHowToUseDir}:`,
      error,
    );
    throw error;
  }
}

async function main() {
  let browser: Browser | null = null;
  let previewProcess: ReturnType<typeof exec> | null = null;

  try {
    // Step 1: Build the application
    console.log("🏗️ Building VitePress site...");
    execSync("pnpm run build-only", { stdio: "inherit" });
    console.log("✅ Build completed");

    // Step 2: Get available languages from dist directory
    const langs = await getAvailableLangs();
    if (langs.length === 0) {
      console.error("❌ No language files found in dist directory");
      process.exit(1);
    }

    // Step 3: Start preview server
    console.log("🌐 Starting preview server...");
    previewProcess = exec("pnpm run preview", { cwd: process.cwd() });

    // Wait for server to start (simple approach - wait a bit)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get server URL (VitePress preview typically runs on port 4173)
    const baseUrl = "http://localhost:4173";
    console.log(`🌐 Server running at ${baseUrl}`);

    // Step 4: Generate PDFs
    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const lang of langs) {
      const url = `${baseUrl}/how-to-use/${lang}`;
      const urlObj = new URL(url);
      // Remove leading slash and ensure proper path
      const path = urlObj.pathname.replace(/^\//, "");
      const savePath = join(outputDir, `${path}.pdf`);
      await generatePDF(browser, url, savePath);
    }

    console.log("✅ All PDFs generated successfully");
  } catch (error) {
    console.error("🚨 An error occurred:", error);
    process.exit(1);
  } finally {
    // Cleanup resources
    if (browser) {
      await browser.close();
    }
    if (previewProcess) {
      previewProcess.kill();
    }
  }
}

main();
