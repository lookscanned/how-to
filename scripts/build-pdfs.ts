import { exec } from 'child_process'
import puppeteer, { type Browser } from 'puppeteer'
import { dirname, join } from 'path'
import { mkdir, rm } from 'fs/promises'
import { promisify } from 'util'
import { preview, build } from 'vite'
import { markdowns } from '../src/locales/how-to-use/markdowns'

const viteConfigPath = new URL('../vite.config.ts', import.meta.url).pathname
const outputDir = new URL('../public/pdfs', import.meta.url).pathname
const langs = Object.keys(markdowns)

const execAsync = promisify(exec)

// remove the output dir
await rm(outputDir, { recursive: true, force: true })

// YYYY:MM:DD HH:MM:SS±HH:MM
async function getGitCommitUTC() {
  const { stdout } = await execAsync('git log -1 --format=%at')
  const commitTimestamp = parseInt(stdout.trim())
  const commitDate = new Date(commitTimestamp * 1000)
  return commitDate
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d+Z$/, '+00:00')
}
const gitCommitUTC = await getGitCommitUTC()
console.log('🕒 Git commit time:', gitCommitUTC)

// Generate a PDF from a given URL
async function generatePDF(browser: Browser, url: string, savePath: string) {
  const page = await browser.newPage()
  try {
    console.log(`📄 Generating PDF for ${url}...`)

    console.log(`🔗 Navigating to ${url}...`)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

    await mkdir(dirname(savePath), { recursive: true })
    await page.pdf({ path: savePath, format: 'a4' })

    // modify the pdf file creation and modification time to the git commit time
    await execAsync(
      ['exiftool', '-overwrite_original', `-AllDates="${gitCommitUTC}"`, savePath].join(' '),
    )

    console.log('🧹 Cleaning PDF...')
    await execAsync(['mutool', 'clean', '-gggg', savePath, savePath].join(' '))

    console.log(`✅ PDF saved to ${savePath}`)
  } finally {
    await page.close()
  }
}

async function main() {
  let browser: Browser | null = null
  let server: Awaited<ReturnType<typeof preview>> | null = null

  try {
    // Step 1: Build the application
    console.log('🏗️ Building web application...')
    await build({ configFile: viteConfigPath })
    console.log('✅ Build completed')

    // Step 2: Start preview server
    console.log('🌐 Starting preview server...')
    server = await preview({ configFile: viteConfigPath })

    // Wait for server to be ready
    await new Promise<void>((resolve) => {
      if (server?.httpServer.listening) {
        resolve()
      } else {
        server?.httpServer.once('listening', () => resolve())
      }
    })

    const listenInfo = server.httpServer.address()
    if (!listenInfo || typeof listenInfo === 'string') {
      throw new Error('Failed to get the listening information')
    }
    const baseUrl = `http://${listenInfo.family === 'IPv4' ? listenInfo.address : `[${listenInfo.address}]`}:${listenInfo.port}`
    console.log(`🌐 Server running at ${baseUrl}`)

    // Step 3: Generate PDFs
    console.log('🚀 Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    for (const lang of langs) {
      const url = `${baseUrl}/how-to-use/${lang}`
      const urlObj = new URL(url)
      // Remove leading slash and ensure proper path
      const path = urlObj.pathname.replace(/^\//, '')
      const savePath = join(outputDir, `${path}.pdf`)
      await generatePDF(browser, url, savePath)
    }

    console.log('✅ All PDFs generated successfully')
  } catch (error) {
    console.error('🚨 An error occurred:', error)
    process.exit(1)
  } finally {
    // Cleanup resources
    if (browser) {
      await browser.close()
    }
    if (server) {
      await server.close()
    }
  }
}

main()
