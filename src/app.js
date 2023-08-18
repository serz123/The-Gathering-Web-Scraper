/**
 * The starting point of the application.
 *
 * @author Vanja Maric <vm222hx@student.lnu.se>
 * @version 1.0.0.
 */

import { GetOkDays } from './collect-days.js'
import { GetMovies } from './get-movies.js'
import { HoursScraper } from './bar-free-hours.js'
import { LinkScraper } from './all-links-scraper.js'

try {
  // Parse the command-line (skip the first two arguments).
  const [, , url] = process.argv
  // const url = 'https://courselab.lnu.se/scraper-site-2'

  // Get the links from start page
  const linkScraper = new LinkScraper()
  const scrapedLinksPromises = linkScraper.extractLinks(url)

  // Wait for the promises to resolve.
  const links = await Promise.all([scrapedLinksPromises])
  // Flatten the persistent links and scraped links arrays to create a new array and then create a Set to remove any duplicates.
  const linksSet = new Set([...links].flat())
  const linksFromStartPage = Array.from(linksSet)
  console.log('Scraping links...OK')

  const calendarPageUrl = linksFromStartPage[0] // ---------------------------Kan jag behålla dem?
  const cinemaPageUrl = linksFromStartPage[1]
  const barPageUrl = linksFromStartPage[2]

  // Get links from calender
  const scrapedLinksCalendarPromises = linkScraper.extractLinks(calendarPageUrl)
  // Wait for the promises to resolve.
  const calendarLinksResolveProm = await Promise.all([scrapedLinksCalendarPromises])
  // Flatten the persistent links and scraped links arrays to create a new array and then create a Set to remove any duplicates.
  const cl = new Set([...calendarLinksResolveProm].flat())
  const linksFromCalendar = Array.from(cl)

  /**
   * Makes absolute url from relative url foer every persons calendar.
   *
   * @param {string} relativeUrl Relative url that uses to make absoule url.
   * @param {string} baseUrl Current page url.
   */
  function getUrl (relativeUrl, baseUrl) {
    const absUrl = new URL(relativeUrl, baseUrl)
    absoluteLinksCalendar.push(absUrl.href)
  }

  const absoluteLinksCalendar = []
  linksFromCalendar.forEach(lnk => {
    getUrl(lnk, calendarPageUrl)
  })

  /**
   * Get calendars.
   *
   * @param {string} person Url to persons calendar.
   * @returns {string[]} Information if the person is free at Friday, Saturday and Sunday-
   */
  async function Gdays (person) {
    const person1Days = new GetOkDays()
    return person1Days.getDays(person)
  }

  // Array with arrays of free days for every friend [frnd1[fri, sat, sun] frnd2[fri, sat, sun]...]
  const calendarsFreeDays = await Promise.all(
    absoluteLinksCalendar.map(calender => Gdays(calender))
  )

  // Day/days that everybody are free.
  let daysAllFriendsFree = ['Friday', 'Saturday', 'Sunday']
  for (let i = 0; i < daysAllFriendsFree.length; i++) {
    for (let j = 0; j < calendarsFreeDays.length; j++) {
      if (calendarsFreeDays[j][i].toLowerCase() !== 'ok') {
        daysAllFriendsFree[i] = ''
        break
      }
    }
  }
  // Delete empty spaces where were days that friends are not free
  daysAllFriendsFree = daysAllFriendsFree.filter(element => element !== '')

  console.log('Scraping available days...OK')

  // Get all avaliable movies.
  /**
   * Gets avaliable movies.
   *
   * @param {string} url Url to get movies from.
   * @returns {string[]} Avaliable movies.
   */
  async function GMovies (url) {
    const movies = new GetMovies()
    return movies.getAvaliableMovies(url)
  }

  /**
   * Gets avaliable times at bar.
   *
   * @param {string} urlAction Url to Post login details.
   * @param {string} url Url to get times from.
   * @returns {string[]} Avaliable times.
   */
  async function GBarTimes (urlAction, url) {
    const times = new HoursScraper()
    return times.scrape(urlAction, url)
  }

  const [movies, time] = await Promise.all([GMovies(cinemaPageUrl), GBarTimes(`${barPageUrl}login`, barPageUrl)])

  console.log('Scraping showtimes...OK')
  console.log('Scraping possible reservations...OK')

  // Movies at the day/days that friends are free.
  const moviesAtdaysFriendsFree = daysAllFriendsFree.map(day =>
    movies.filter(obj => obj.day === day)
  ).flat()

  // Get possible bar times at the day the friends are free.
  const daysFriendsFreeShort = daysAllFriendsFree.map(obj => obj.substring(0, 3))
  const freeBarTimesFriendsFreeDays = daysFriendsFreeShort.map(freeday => {
    return time.filter(obj => obj.day.toLowerCase() === freeday.toLowerCase())
  }).flat()

  // Filter just free bar times that are at least 2 hours after movie start
  const moviesTime = moviesAtdaysFriendsFree.map(movie => movie.time)
  const bar = []
  for (let i = moviesTime.length - 1; i >= 0; i--) {
    let counter = 0

    // Important to have let j = freeBarTimesFriendsFreeDays.length - 1; j >= 0; j-- because of propery barTime in movies. Bartime should be the one that is earliest of all times that fits.
    for (let j = (freeBarTimesFriendsFreeDays.length - 1); j >= 0; j--) {
      if (parseInt(freeBarTimesFriendsFreeDays[j].free.slice(0, 2)) >= parseInt(moviesTime[i].slice(0, 2)) + 2) {
        bar.push(freeBarTimesFriendsFreeDays[j])
      } else {
        counter += 1
      }
    }

    // Remove movies that does not have free time in the bar two hours after the movie start.
    if (counter === freeBarTimesFriendsFreeDays.length) {
      const index = moviesAtdaysFriendsFree.indexOf(moviesAtdaysFriendsFree[i])
      if (index !== -1) {
        moviesAtdaysFriendsFree.splice(index, 1)
      }
    }
  }
  // Remove duplicates.
  const barHours2hAfterMovies = [...new Set(bar)]

  // Add bar time to movie object (The earliest one that fits).
  const bTime = barHours2hAfterMovies.map(time => time.free)
  for (let i = 0; i < bTime.length; i++) {
    moviesAtdaysFriendsFree.forEach(movie => {
      if (parseInt(movie.time.slice(0, 2)) + 2 <= parseInt(bTime[i].slice(0, 2))) {
        const parts = bTime[i].split('-')
        const modifiedParts = parts.map(part => part + ':00')
        const tm = modifiedParts.join('-')
        movie.barTime = tm
      }
    })
  }

  // Suggestions
  console.log('\n\nSuggestions\n===========')
  moviesAtdaysFriendsFree.forEach(mov => {
    console.log(`\n* On ${mov.day}, "${mov.movie}" begins at ${mov.time}, and there is a free table to book between ${mov.barTime}.`)
  })
} catch (error) {
  console.log(error)
}
