require('dotenv').config()
const moment = require('moment')
const puppeteer = require('puppeteer')
const path = require('path')
const waitForAndClick = require('./puppeteerHelpers').waitForAndClick
const waitForAndEnterValue = require('./puppeteerHelpers').waitForAndEnterValue
const findLabelAndEnterValue = require('./puppeteerHelpers').findLabelAndEnterValue
const getSermons = require('./sermonsSql').getSermons

const launchOptions = { headless: false }

async function enterMediaItemDetails(page, sermon) {
  await page.waitFor(1000)
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Basic Info")'
  )
  await findLabelAndEnterValue(page, 'Title', sermon.title)
  await findLabelAndEnterValue(page, 'Subtitle', sermon.subtitle)
  await findLabelAndEnterValue(page, 'Speaker', sermon.speaker)
  await findLabelAndEnterValue(page, 'Date', moment(sermon.date).format('MM/DD/YYYY'))
  debugger
  await page.evaluate(() => {
    return $('.sui-media-uploader__action-text--link:contains("Upload audio")').click()
  })
  await page.waitFor(1000)
  const input = await page.evaluate(() => {
    return $('input[type="file"]')[1]
  })
  await input.uploadFile(path.join('F:/BCLR ftp backup/public_html/wp-content/uploads/sermons/images', sermon.fileName))
  await page.waitFor(3000)
}

async function createMediaItem(page) {
  await page.goto('https://dashboard.thechurchapp.org/4648/#/library/media', { waitUntil: 'networkidle2' })

  await waitForAndClick(page, '[data-ga-event-action="create media item"]')
  await page.click('[data-ga-event-action="create"]')
  await page.waitFor(2000)
}

async function login(page) {
  await page.waitFor(1000)
  await waitForAndEnterValue(page, 'input#Email', process.env.SUBSPLASH_USERNAME)
  await waitForAndEnterValue(page, 'input#Password', process.env.SUBSPLASH_PASSWORD)
  await page.click('input[type="submit"]')
  await page.waitFor(5000)
}

(async () => {
  const browser = await puppeteer.launch(launchOptions)
  const page = await browser.newPage()
  await page.goto('https://dashboard.thechurchapp.org/', { waitUntil: 'networkidle2' })

  await login(page)
  const sermons = await getSermons()
  console.log(sermons)
  await createMediaItem(page)
  await enterMediaItemDetails(page, sermon[0])

  await page.waitFor(10000)

  await browser.close()
})()


