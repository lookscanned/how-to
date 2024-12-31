import { exec } from 'child_process'
import puppeteer, { type Browser } from 'puppeteer'
import { dirname, resolve, join } from 'path'
import { mkdir, rm } from 'fs/promises'
import { promisify } from 'util'
import express from 'express'
import { markdowns } from '../src/locales/how-to-use/markdowns'

const execAsync = promisify(exec)
const outputDir = resolve('./public/pdfs')
const langs = Object.keys(markdowns)

// remove the output dir
await rm(outputDir, { recursive: true, force: true })

// Build the web application
async function buildWeb() {
  console.log('🏗️ Building web...')
  try {
    const { stdout, stderr } = await execAsync('pnpm run build')
    console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error) {
    console.error('🚨 Build failed:', error)
    throw error
  }
}

// Serve the built `dist` directory using Express
async function serveDist() {
  console.log('🏗️ Starting Express server for SPA...')
  const port = 4173 // Adjust if necessary
  const app = express()

  // Serve static files from the 'dist' directory
  app.use(express.static('dist'))

  // Enable SPA mode by redirecting all requests to the index.html
  app.get('*', (req, res) => {
    res.sendFile(resolve('dist/index.html'))
  })

  // Start the server
  const server = app.listen(port, () => {
    console.log(`🌐 Server is running at http://localhost:${port}`)
  })

  // Return the server instance for later use
  return { port, server }
}

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

// Generate a PDF from a given path
async function generatePDF(browser: Browser, port: number, path: string) {
  console.log(`📄 Generating PDF for ${path}...`)
  const page = await browser.newPage()
  const url = `http://localhost:${port}${path}`

  console.log(`🔗 Navigating to ${url}...`)
  await page.goto(url, { waitUntil: 'networkidle0' })

  const pdfPath = join(outputDir, `${path}.pdf`)
  await mkdir(dirname(pdfPath), { recursive: true })
  await page.pdf({ path: pdfPath, format: 'a4' })

  // modify the pdf file creation and modification time to the git commit time
  await execAsync(
    ['exiftool', '-overwrite_original', `-AllDates="${gitCommitUTC}"`, pdfPath].join(' '),
  )

  const cleanedPdfPath = pdfPath
  console.log('🧹 Cleaning PDF...')
  await execAsync(['mutool', 'clean', '-gggg', pdfPath, cleanedPdfPath].join(' '))

  await page.close()
  console.log(`✅ PDF saved to ${pdfPath}`)
}

async function main() {
  try {
    // Step 1: Build the application
    await buildWeb()

    // Step 2: Serve the built application
    const { port, server } = await serveDist()

    // Step 3: Generate PDFs
    const paths = langs.map((lang) => `/how-to-use/${lang}`)
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    for (const path of paths) {
      await generatePDF(browser, port, path)
    }

    await browser.close()

    server.close()
  } catch (error) {
    console.error('🚨 An error occurred:', error)
  }
}

main()
