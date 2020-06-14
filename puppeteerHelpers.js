module.exports.waitForAndEnterValue = async function (page, selector, value) {
  await page.waitForSelector(selector)
  await page.evaluate((data) => {
    return document.querySelector(data.selector).value = data.value
  }, {selector, value})
}

module.exports.waitForAndClick = async function (page, selector) {
  await page.waitForSelector(selector)
  await page.click(selector)
}

module.exports.findLabelAndEnterValue = async function (page, label, value) {
  const selector = `label:contains("${label}")`
  await page.evaluate((data) => {
    return $(data.selector).find('input')[0].value = data.value
  }, {selector, value})
}
