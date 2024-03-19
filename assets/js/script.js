//VARIABLE DECLARATIONS to reference the DOM
const searchButton = document.getElementById("search-button");
const cityName = $('input[name="city"]');
const stateCode = document.getElementById("combobox");
const citySearch = document.getElementById("cityNameInput");
let nextCity = JSON.parse(localStorage.getItem(""));
const cityStateButton = document.getElementById("cs-button");
const forecastArea = document.getElementById("forecast");
const currentWeather = document.getElementById("current-weather");
const currentIconBox = document.getElementById("current-icon");

//Listening for a click on the search button to run the function to get location data
searchButton.addEventListener("click", getLocationData);

//Event listener to load local storage to preserve the search history and render it to the page
window.addEventListener("DOMContentLoaded", function () {
  const cityList = document.getElementById("city-list");
  cityList.value = "";
  let userData = JSON.parse(localStorage.getItem("userData"));
  if (userData) {
    userData.forEach((userData) => {
      const cityID = userData.City;
      const stateID = userData.State;
      const csButton = document.createElement("button");
      csButton.classList.add("city-state-button");
      csButton.setAttribute("type", "button");
      csButton.setAttribute("id", "cs-button");
      csButton.textContent = `${cityID}, ${stateID}`;
      cityList.appendChild(csButton);
    });
  }
});

//Variable declarations to set a date string for today's date to display on the webpage
let today = new Date();
let dd = String(today.getDate()).padStart(2, "0");
let mm = String(today.getMonth() + 1).padStart(2, "0");
let yyyy = today.getFullYear();
today = mm + "/" + dd + "/" + yyyy;

//Function to get information from user input and pushes to local storage
function collectInput() {
  const cityList = document.getElementById("city-list");
  const cityID = cityName.val();
  const stateID = combobox.value;
  let existingData = localStorage.getItem("userData");
  let userDataArray = existingData ? JSON.parse(existingData) : [];
  let newUserData = {
    City: cityID,
    State: stateID,
  };
  userDataArray.push(newUserData);
  let updatedData = JSON.stringify(userDataArray);
  localStorage.setItem("userData", updatedData);
  const csButton = document.createElement("button");
  csButton.classList.add("city-state-button");
  csButton.setAttribute("type", "button");
  csButton.setAttribute("id", "cs-button");
  csButton.textContent = `${cityID}, ${stateID}`;
  cityList.appendChild(csButton);
  combobox.selectedIndex = 0;
  citySearch.value = "";

  //Pull weather data from API using city and state chosen by the user for today's date
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityID}%2C%20${stateID}/today?unitGroup=us&include=current&key=694QZXFHP5BSEXVD52Y94CZ5W&contentType=json`
  )
    .then((response) => response.json())
    .then((data) => {
      currentIconBox.innerHTML = "";
      const currentTemp = document.getElementById("current-temp");
      const currentWind = document.getElementById("current-wind");
      const currentHumidity = document.getElementById("current-humidity");
      const currentCity = document.getElementById("name-and-date");
      const currentDate = data.days[0].datetime;
      const parsedCurrentDate = new Date(currentDate);
      const currentMonth = parsedCurrentDate.getMonth() + 1;
      const currentDay = parsedCurrentDate.getDate() + 1;
      const currentYear = parsedCurrentDate.getFullYear();
      const formattedCurrentDate = `${currentMonth}/${currentDay}/${currentYear}`;
      const currentIcon = document.createElement("img");
      currentTemp.textContent = `Temp: ${data.days[0].temp} °F`;
      currentWind.textContent = `Wind: ${data.days[0].windspeed} m/s`;
      currentHumidity.textContent = `Humidity ${data.days[0].humidity}%`;
      currentCity.textContent = `${cityID}, ${stateID} - ${formattedCurrentDate}`;
      currentIcon.setAttribute(
        "src",
        "./assets/images/weather-icons/" + data.days[0].icon + ".png"
      );
      currentIcon.classList.add("current-icon");
      currentIconBox.appendChild(currentIcon);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  //Pull weather data from API for next five days and displays it on the webpage
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityID}%2C%20${stateID}/next7days?unitGroup=us&include=days&key=694QZXFHP5BSEXVD52Y94CZ5W&contentType=json`
  )
    .then((response) => response.json())
    .then((data) => {
      forecastArea.innerHTML = "";
      for (let i = 1; i <= 5; i++) {
        const inputDate1 = data.days[i].datetime;
        const parsedDate1 = new Date(inputDate1);
        const month1 = parsedDate1.getMonth() + 1;
        const day1 = parsedDate1.getDate() + 1;
        const year1 = parsedDate1.getFullYear();
        const formattedDate1 = `${month1}/${day1}/${year1}`;
        const day1Date = document.createElement("h4");
        const day1Icon = document.createElement("img");
        const day1Temp = document.createElement("h5");
        const day1Wind = document.createElement("h5");
        const day1Humidity = document.createElement("h5");
        day1Date.textContent = formattedDate1;
        day1Icon.setAttribute(
          "src",
          "./assets/images/weather-icons/" + data.days[i].icon + ".png"
        );
        day1Icon.classList.add("icons");
        day1Temp.textContent = `Temp: ${data.days[i].temp}°F`;
        day1Wind.textContent = `Wind: ${data.days[i].windspeed}m/s`;
        day1Humidity.textContent = `Humidity: ${data.days[i].humidity}%`;
        const day1Card = document.createElement("div");
        day1Card.classList.add("day-card");
        day1Card.appendChild(day1Date);
        day1Card.appendChild(day1Icon);
        day1Card.appendChild(day1Temp);
        day1Card.appendChild(day1Wind);
        day1Card.appendChild(day1Humidity);
        forecastArea.appendChild(day1Card);
      }
    });
}

//Function attached to Search button's event listener that will run the collectInput function
function getLocationData(event) {
  event.preventDefault();
  collectInput();
}

//Event listener that will repopulate the webpage body with weather data for a previous city search when the city is clicked on
document.addEventListener("click", function (e) {
  const target = e.target.closest("#cs-button");
  if (target) {
    let cs = target.textContent;
    let csNoSpaces = cs.replace(/ /g, "");
    let csFormatted = csNoSpaces.replace(/,/g, "%2C%20");
    fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${csFormatted}/today?unitGroup=us&include=current&key=694QZXFHP5BSEXVD52Y94CZ5W&contentType=json`
    )
      .then((response) => response.json())
      .then((data) => {
        currentIconBox.innerHTML = "";
        const currentTemp = document.getElementById("current-temp");
        const currentWind = document.getElementById("current-wind");
        const currentHumidity = document.getElementById("current-humidity");
        const currentCity = document.getElementById("name-and-date");
        const currentDate = data.days[0].datetime;
        const parsedCurrentDate = new Date(currentDate);
        const currentMonth = parsedCurrentDate.getMonth() + 1;
        const currentDay = parsedCurrentDate.getDate() + 1;
        const currentYear = parsedCurrentDate.getFullYear();
        const formattedCurrentDate = `${currentMonth}/${currentDay}/${currentYear}`;
        const currentIcon = document.createElement("img");
        currentTemp.textContent = `Temp: ${data.days[0].temp} °F`;
        currentWind.textContent = `Wind: ${data.days[0].windspeed} m/s`;
        currentHumidity.textContent = `Humidity ${data.days[0].humidity}%`;
        currentCity.textContent = `${cs} - ${formattedCurrentDate}`;
        currentIcon.setAttribute(
          "src",
          "./assets/images/weather-icons/" + data.days[0].icon + ".png"
        );
        currentIcon.classList.add("current-icon");
        currentIconBox.appendChild(currentIcon);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  let locationString = target.textContent;
  const [city, state] = locationString.split(", ");
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}%2C%20${state}/next7days?unitGroup=us&include=days&key=694QZXFHP5BSEXVD52Y94CZ5W&contentType=json`
  )
    .then((response) => response.json())
    .then((data) => {
      forecastArea.innerHTML = "";
      for (let i = 1; i <= 5; i++) {
        const inputDate1 = data.days[i].datetime;
        const parsedDate1 = new Date(inputDate1);
        const month1 = parsedDate1.getMonth() + 1;
        const day1 = parsedDate1.getDate() + 1;
        const year1 = parsedDate1.getFullYear();
        const formattedDate1 = `${month1}/${day1}/${year1}`;
        const day1Date = document.createElement("h4");
        const day1Icon = document.createElement("img");
        const day1Temp = document.createElement("h5");
        const day1Wind = document.createElement("h5");
        const day1Humidity = document.createElement("h5");
        day1Date.textContent = formattedDate1;
        day1Icon.setAttribute(
          "src",
          "./assets/images/weather-icons/" + data.days[i].icon + ".png"
        );
        day1Icon.classList.add("icons");
        day1Temp.textContent = `Temp: ${data.days[i].temp}°F`;
        day1Wind.textContent = `Wind: ${data.days[i].windspeed}m/s`;
        day1Humidity.textContent = `Humidity: ${data.days[i].humidity}%`;
        const day1Card = document.createElement("div");
        day1Card.classList.add("day-card");
        day1Card.appendChild(day1Date);
        day1Card.appendChild(day1Icon);
        day1Card.appendChild(day1Temp);
        day1Card.appendChild(day1Wind);
        day1Card.appendChild(day1Humidity);
        forecastArea.appendChild(day1Card);
      }
    });
});
//Pseudocoding:

//when "search" button is pressed, the city name input and state input.value are collected

//the city name and state are saved as an array object in local storage

//the city name and state appear below the search bars (in the .city-list ul) as hyperlinks

//keep any searched city/state pairs as links in the sidebar under the search boxes - have the links run through the "get weather data" function again, in case the user clicks on the cities again another day - it should always pull the most recent data from the API

//   //use the city name and state code with the weather api to get back weather data

//   //change the .current-weather h3 to a string concatenation (or template literal) to include the city name and date

//   //pull from the weather api data to get current temp, wind, and humidity for the current city, and set the "current-temp", "current-wind", and "current-humidity" spans to those values.

//   //pull from the weather api data to get five days of temp, wind, and humidity

//   //iterate through the t/w/h data to create five cards below the "current-weather" section (in the "forecast" section)
