require('dotenv').config()
const moment = require('moment')
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')
const waitForAndClick = require('./puppeteerHelpers').waitForAndClick
const waitForAndEnterValue = require('./puppeteerHelpers').waitForAndEnterValue
const findLabelAndEnterValue = require('./puppeteerHelpers').findLabelAndEnterValue
const findLabelAndSetValue = require('./puppeteerHelpers').findLabelAndSetValue
const getSermons = require('./sermonsSql').getSermons

const launchOptions = { headless: false }

async function enterMediaItemDetails(page, sermon) {
  let additionLabel = sermon.verseStart
  if (sermon.verseEnd)
    additionLabel = `${additionLabel} - ${sermon.verseEnd}`

  await page.waitFor(1000)
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Basic Info")'
  )
  const fileInputs = await page.$$('input[type="file"]')
  await fileInputs[1].uploadFile(path.join('F:/BCLR ftp backup/public_html/wp-content/uploads/sermons', sermon.fileName))
  await page.waitFor(2000)
  await findLabelAndEnterValue(page, 'Title', sermon.title)
  await findLabelAndEnterValue(page, 'Subtitle', sermon.subtitle)
  await findLabelAndEnterValue(page, 'Speaker', sermon.speaker)
  await findLabelAndSetValue(page, 'Date', moment(sermon.date).format('MM/DD/YYYY'))
  if (additionLabel)
    await findLabelAndEnterValue(page, 'Additional Label', additionLabel)
  await page.focus('body')
  await page.waitFor(1000)
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("for processing.")'
  )
  await page.waitFor(3000)
  await page.evaluate(() => {
    return $('button:contains("Save draft")')[0].click()
  })
  await page.waitFor(10000)
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
  var sermons = await getSermons()
  sermons = sermons.slice(0, 10)

  for (var i = 0; i < sermons.length; i++) {
    const sermon = sermons[i]
    console.log(sermon)
    let completedSermonIds = JSON.parse(fs.readFileSync('./completed.json'))
    if (!completedSermonIds.includes(sermon.id)) {
      await createMediaItem(page)
      await enterMediaItemDetails(page, sermon)
      completedSermonIds.push(sermon.id)
      fs.writeFileSync('./completed.json', JSON.stringify(completedSermonIds))
    }
  }
  //await page.waitFor(10000)
  await browser.close()
})()


