import { SitemapStream, streamToPromise } from 'sitemap'
import { markdowns } from '../src/locales/how-to-use/markdowns'
import { writeFile } from 'fs/promises'
import { execSync } from 'child_process'

const langs = Object.keys(markdowns) as (keyof typeof markdowns)[]
const commitTimestamp = execSync('git log -1 --format=%at').toString().trim()
const commitDate = new Date(parseInt(commitTimestamp) * 1000)
const lastmod = commitDate.toISOString()

const sitemapStream = new SitemapStream({
  hostname: 'https://how-to.lookscanned.io',
  lastmodDateOnly: false,
  xmlns: {
    // trim the xml namespace
    news: false, // flip to false to omit the xml namespace for news
    xhtml: true,
    image: false,
    video: false,
  },
})

sitemapStream.write({
  url: 'https://how-to.lookscanned.io',
  lastmod,
})

for (const lang of langs) {
  sitemapStream.write({
    url: `https://how-to.lookscanned.io/how-to-use/${lang}`,
    lastmod,
  })
  sitemapStream.write({
    url: `https://how-to.lookscanned.io/pdfs/how-to-use/${lang}.pdf`,
    lastmod,
  })
}

sitemapStream.end()

const buffer = await streamToPromise(sitemapStream)

// write to ./public/sitemap.xml
const sitemapPath = new URL('../public/sitemap.xml', import.meta.url).pathname
await writeFile(sitemapPath, buffer)
console.log(`✅ Sitemap written to ${sitemapPath}`)
