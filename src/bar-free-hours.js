/**
 * The bar free hours module.
 *
 * @author Vanja Maric <vm222hx@student.lnu.se>
 * @version 1.0.0.
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

/**
 * Encapsulates a hours scraper.
 */
export class HoursScraper {
  /**
   * Gets the free spots in bar on a web page.
   *
   * @param {string} url - The URL of the web page to scrape.
   * @returns {string[]} - Free times in bar.
   */

  /**
   * Gets the free spots in bar on a web page.
   *
   * @param {string} urlAction Url to Post login details.
   * @param {string} url Url of bar page.
   */
  async scrape (urlAction, url) {
    const usern = 'zeke'
    const passw = 'coys'

    try {
      const params = new URLSearchParams()
      params.append('username', usern)
      params.append('password', passw)
      params.append('submit', 'login')
      // Send a POST request to the login page
      const response = await fetch(urlAction, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'manual'
      })

      if (response.status === 301 || response.status === 302) {
        // The response is a redirect. Get the redirect URL from the Location header
        const redirectUrl = response.headers.get('Location')
        const cookieHeader = response.headers.get('Set-Cookie')

        // Perform additional checks or processing, if needed

        // Make a new request to the redirect URL
        const resp = await fetch(`${url}${redirectUrl}`, {
          method: 'GET',
          headers: {
            Cookie: cookieHeader
          }
        })
        if (!resp.ok) { // Check the status of the response
          throw new Error(`HTTP error! Status: ${resp.status}`)
        }
        const responseText = await resp.text()
        const dom = new JSDOM(responseText)
        const inputElement = Array.from(dom.window.document.querySelectorAll('input[name=group1]'))
        const days = inputElement.map(element => element.value.substring(0, 3))
        const spanElements = inputElement.map(element => Array.from(element.parentElement.querySelectorAll('span')
        ))
        const freetimes = spanElements.flat().map(spanElement => spanElement.textContent.trim().substring(0, 5))
        const barFreeAllDays = []
        for (let i = 0; i < freetimes.length; i++) {
          barFreeAllDays.push({ day: days[i], free: freetimes[i] })
        }
        return barFreeAllDays
      } else {
        // The response is not a redirect. Return it as-is
        return response
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  /**
   * Gets the plain text from an URL.
   *
   * @param {string} url - URL to get text content from.
   * @returns {string} The content as plain text.
   */
  async #getText (url) {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.text()
  }
}
