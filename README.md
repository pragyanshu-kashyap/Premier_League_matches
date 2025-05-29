# Soccer Matches Viewer

A web application that displays upcoming Premier League soccer matches using the football-data.org API. which is free with some constraints.

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add your football-data.org API key:

```
FOOTBALL_DATA_API_KEY=your_api_key_here
```

To get an API key:

1. Go to [football-data.org](https://www.football-data.org/)
2. Click on "Get an API Key"
3. Fill out the registration form
4. You'll receive your API key immediately via email
5. The free tier includes:

   - 10 calls per minute
   - Access to all competitions
   - No credit card required

6. Start the server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Features

- Displays upcoming Premier League matches
- Shows match date, time, and teams
- Responsive design
- Real-time data from football-data.org

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- API: football-data.org
