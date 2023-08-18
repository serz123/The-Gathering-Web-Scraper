/**
 * The collect days module.
 *
 * @author Vanja Maric <vm222hx@student.lnu.se>
 * @version 1.0.0.
 */

import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

/**
 * Encapsulates a collector of days.
 */
export class GetOkDays {
  /**
   * Gets information about being busy at Fryday, Saturday and Sunday.
   *
   * @param {string} url Url of one persons calendar.
   * @returns {string[]} Information about being busy at Fryday, Saturday and Sunday.
   */
  async getDays (url) {
    const text = await this.#getText(url)

    const dom = new JSDOM(text)
    const days = Array.from(dom.window.document.querySelectorAll('td')).map(tdElement => tdElement.innerHTML)
    return days
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
