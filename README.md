# The Gathering Web Scraper

The Gathering Web Scraper is a Node.js application designed to help plan gatherings by scraping and analyzing data from specified websites. This tool helps find a suitable day, movie, and restaurant reservation for three friends—Peter, Paul, and Mary—by automatically gathering and processing information from multiple online sources.

## Features

- **Crawling and Scraping:** Automatically scrapes data from multiple websites based on a given start URL.
- **Availability Check:** Identifies which days all friends are available by analyzing their calendars.
- **Movie Showtimes:** Scrapes cinema websites to find available movies and their showtimes for the available days.
- **Restaurant Reservations:** Logs into a restaurant website to check available reservation times, ensuring at least a two-hour gap after the movie ends.
- **Suggestions:** Provides recommendations on the day, movie, and reservation time based on the scraped data.

## How It Works

1. **Start URL:** The application starts by scraping links from the provided start URL.
2. **Calendar Analysis:** Determines available days based on pre-defined criteria.
3. **Cinema Data:** Finds and filters movie showtimes for the available days.
4. **Restaurant Booking:** Logs into the restaurant website to check reservation availability.
5. **Recommendations:** Generates and displays suggestions for the best day, movie, and time to book a table.

## Installation
1. **Install Dependencies:**
```
npm install
```

2. **Run the web scraper**
```
npm start
```

### License
This project is licensed under the MIT License

### Contact
Vanja Maric
email: maricvanj@gmail.com