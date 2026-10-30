
const API_KEY = "03e69a0858e0b0c18f8f98ba012b7939";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchWeather();
});

async function searchWeather() {
  const city = cityInput.value.trim();
  const error = document.getElementById("error");

  if (!city) {
    error.textContent = "Please enter a city name.";
    return;
  }

  error.textContent = "Loading weather...";

  try {
    const currentURL =
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const forecastURL =
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const [currentResponse, forecastResponse] =
      await Promise.all([
        fetch(currentURL),
        fetch(forecastURL)
      ]);

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    if (!currentResponse.ok) {
      throw new Error(currentData.message || "City not found");
    }

    if (!forecastResponse.ok) {
      throw new Error(forecastData.message || "Forecast unavailable");
    }

    displayWeather(currentData);
    displayForecast(forecastData);

    error.textContent = "";

  } catch (err) {
    error.textContent = err.message;
  }
}

function displayWeather(data) {
  document.getElementById("city").textContent =
    `${data.name}, ${data.sys.country}`;

  document.getElementById("temp").textContent =
    `${Math.round(data.main.temp)}°C`;

  document.getElementById("description").textContent =
    data.weather[0].description;

  document.getElementById("humidity").textContent =
    data.main.humidity;

  document.getElementById("wind").textContent =
    (data.wind.speed * 3.6).toFixed(1);

  document.getElementById("feels").textContent =
    Math.round(data.main.feels_like);

  document.getElementById("icon").innerHTML =
    `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">`;
}

function displayForecast(data) {
  const forecastContainer =
    document.getElementById("forecast");

  forecastContainer.innerHTML = "";

  // Select one forecast near midday for each day
  const dailyForecast = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  ).slice(0, 5);

  dailyForecast.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en", {
      weekday: "short"
    });

    const icon = day.weather[0].icon;

    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <h3>${dayName}</h3>
      <img src="https://openweathermap.org/img/wn/${icon}.png"
           alt="Weather icon">
      <p>${Math.round(day.main.temp)}°C</p>
      <small>${day.weather[0].description}</small>
    `;

    forecastContainer.appendChild(card);
  });
}
