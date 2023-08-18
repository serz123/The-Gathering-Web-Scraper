/**
 * The collect movies module.
 *
 * @author Vanja Maric <vm222hx@student.lnu.se>
 * @version 1.0.0.
 */
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

/**
 * Encapsulates a collector of movies.
 */
export class GetMovies {
  /**
   * Gets avaliable movies.
   *
   * @param {string} url Url of the cinema schedule.
   * @returns {string[]} List of avaliable movies.
   */
  async getAvaliableMovies (url) {
    const urls = this.getUrls(url)
    const movies = await this.getAvaliableM(url, urls)
    // Get the current page
    const text = await this.#getText(url)
    const dom = new JSDOM(text)
    const day = dom.window.document.querySelector('#day')
    const optiondayElements = Array.from(day.querySelectorAll('option'))
    const dayValues = optiondayElements.map(oElement => oElement.value)
    const dayNames = optiondayElements.map(oElement => oElement.textContent)
    const mov = dom.window.document.querySelector('#movie')
    const optionmovieElements = Array.from(mov.querySelectorAll('option'))
    const moviesValues = optionmovieElements.map(oElement => oElement.value)
    const moviesNames = optionmovieElements.map(oElement => oElement.textContent)
    return movies.map(obj => {
      for (let i = 1; i <= 3; i++) {
        if (obj.day === dayValues[i]) {
          obj.day = dayNames[i]
        }
        if (obj.movie === moviesValues[i]) {
          obj.movie = moviesNames[i]
        }
      }
      return obj
    })
  }

  /**
   * Gets avaliable movies with numbers.
   *
   * @param {string} url Current page url.
   * @param {string[]} arrMovies Array of all movies times.
   * @returns {string[]} Array of avaliable movies without movies names.
   */
  async getAvaliableM (url, arrMovies) {
    // Get JSON files
    const arrJSon = await Promise.all(arrMovies.map(async url => {
      const text = await this.#getText(url)
      return text
    }))
    // Get array of objects
    const arrData = (arrJSon.map(json => JSON.parse(json))).flat()
    // Get just days that are avaliable
    return arrData.filter(obj => obj.status === 1)
  }

  /**
   * Makes url for every day and movie.
   *
   * @param {string} url Current page url.
   * @returns {string[]} Url for every day and movie
   */
  getUrls (url) {
    const arrUrls = []
    for (let i = 5; i <= 7; i++) {
      let newUrl = ''
      newUrl = `${url}/check?day=0${i}`
      for (let j = 1; j <= 3; j++) {
        let newUrl2 = ''
        newUrl2 = `${newUrl}&movie=0${j}`
        arrUrls.push(newUrl2)
      }
    }
    return arrUrls
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
