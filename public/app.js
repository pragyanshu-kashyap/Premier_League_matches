document.addEventListener("DOMContentLoaded", () => {
  // Initialize the application
  initializeApp();
});

function initializeApp() {
  // Add error event listener
  window.addEventListener("error", handleGlobalError);
  window.addEventListener("unhandledrejection", handlePromiseError);

  // Start fetching matches
  fetchMatches();
}

function handleGlobalError(event) {
  console.error("Global error:", event.error);
  showError("An unexpected error occurred. Please try again.");
}

function handlePromiseError(event) {
  console.error("Unhandled promise rejection:", event.reason);
  showError("A network error occurred. Please try again.");
}

function showError(message) {
  const container = document.getElementById("matches-container");
  container.innerHTML = `
    <div class="error">
      <p>${message}</p>
      <button onclick="retryFetch()" class="retry-button">Retry</button>
    </div>
  `;
}

function retryFetch() {
  fetchMatches();
}

async function fetchMatches(retryCount = 0) {
  const container = document.getElementById("matches-container");
  const maxRetries = 3;

  try {
    container.innerHTML = '<div class="loading">Loading matches...</div>';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log("Fetching matches from API...");
    const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const response = await fetch("http://localhost:5000/api/matches", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(
        errorData.details || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("API Response:", data);
    console.log("Matches array:", data.matches);
    console.log("Number of matches:", data.matches ? data.matches.length : 0);

    if (!data.matches || data.matches.length === 0) {
      console.log("No matches found in the response");
      container.innerHTML =
        '<p class="no-matches">No upcoming matches found in the next 10 days.</p>';
      return;
    }

    displayMatches(data.matches);
  } catch (error) {
    console.error("Error fetching matches:", error);

    if (error.name === "AbortError") {
      showError("Request timed out. Please try again.");
      return;
    }

    if (retryCount < maxRetries) {
      console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
      setTimeout(() => fetchMatches(retryCount + 1), 1000 * (retryCount + 1));
      return;
    }

    showError("Failed to load matches. Please try again later.");
  }
}

function displayMatches(matches) {
  const container = document.getElementById("matches-container");
  container.innerHTML = "";

  matches.forEach((match) => {
    const matchDate = new Date(match.utcDate);
    const formattedDate = matchDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = matchDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const matchCard = document.createElement("div");
    matchCard.className = "match-card";
    matchCard.innerHTML = `
            <div class="match-date">${formattedDate}</div>
            <div class="teams">
                <div class="team">${match.homeTeam.name}</div>
                <div class="vs">VS</div>
                <div class="team">${match.awayTeam.name}</div>
            </div>
            <div class="match-time">${formattedTime}</div>
        `;

    container.appendChild(matchCard);
  });
}
