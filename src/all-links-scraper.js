/**
 * The link scraper module.
 *
 * @author Vanja Maric <vm222hx@student.lnu.se>
 * @version 1.0.0.
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

/**
 * Encapsulates a link scraper.
 */
export class LinkScraper {
  /**
   * Extracts the links on a web page.
   *
   * @param {string} url - The URL of the web page to scrape.
   * @returns {string[]} Links.
   */
  async extractLinks (url) {
    const text = await this.#getText(url)
    const dom = new JSDOM(text)
    const links = Array.from(dom.window.document.querySelectorAll('a'))
      .map(anchorElement => anchorElement.href).sort()
    return [...new Set(links)]
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
