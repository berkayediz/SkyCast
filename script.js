document.addEventListener("DOMContentLoaded", function() {
  var cityInput = document.getElementById("cityInput");
  var getWeatherButton = document.getElementById("getWeatherButton");
  var weatherData = document.getElementById("weatherData");
  var errorDiv = document.getElementById("error");

  getWeatherButton.addEventListener("click", function() {
    var city = cityInput.value;
    if (city === "") {
      showError("Please enter a city name!");
      return;
    }

    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=YOUR_API_KEY&units=metric";

    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error("Weather data could not be fetched.");
        }
        return response.json();
      })
      .then(function(data) {
        var location = data.name + ", " + data.sys.country;
        var temperature = Math.round(data.main.temp);
        var iconCode = data.weather[0].icon;

        var currentWeatherHTML = "<div id='location'>" + location + "</div>";
        currentWeatherHTML += "<div id='currentWeather'>";
        currentWeatherHTML += "<i class='wi wi-owm-" + iconCode + "'></i>";
        currentWeatherHTML += "<span>" + temperature + "°C</span>";
        currentWeatherHTML += "</div>";

        var forecastHTML = "";

        getForecastData(data.coord.lat, data.coord.lon)
          .then(function(forecast) {
            forecast.forEach(function(forecastItem) {
              var forecastDate = formatDate(forecastItem.dt);
              var forecastTemperature = Math.round(forecastItem.temp.day);
              var forecastIconCode = forecastItem.weather[0].icon;

              forecastHTML += "<div class='forecast-item'>";
              forecastHTML += "<div>" + forecastDate + "</div>";
              forecastHTML += "<div class='icon'><i class='wi wi-owm-" + forecastIconCode + "'></i></div>";
              forecastHTML += "<div>" + forecastTemperature + "°C</div>";
              forecastHTML += "</div>";
            });

            weatherData.innerHTML = currentWeatherHTML + "<div id='forecast'>" + forecastHTML + "</div>";
            clearError();
          })
          .catch(function(error) {
            console.log(error);
            showError("Forecast data could not be fetched.");
          });
      })
      .catch(function(error) {
        console.log(error);
        showError("Weather data could not be fetched.");
      });
  });

  function getForecastData(latitude, longitude) {
    var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=current,minutely,hourly&appid=YOUR_API_KEY&units=metric";

    return fetch(forecastUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error("Forecast data could not be fetched.");
        }
        return response.json();
      })
      .then(function(data) {
        return data.daily.slice(1, 4); // Get 3-day forecast (excluding the current day)
      });
  }

  function formatDate(timestamp) {
    var date = new Date(timestamp * 1000);
    var day = date.toLocaleDateString("en-US", { weekday: "long" });
    var month = date.toLocaleDateString("en-US", { month: "long" });
    var dayNumber = date.toLocaleDateString("en-US", { day: "numeric" });
    return day + ", " + month + " " + dayNumber;
  }

  function showError(errorMessage) {
    errorDiv.textContent = errorMessage;
    errorDiv.style.display = "block";
  }

  function clearError() {
    errorDiv.textContent = "";
    errorDiv.style.display = "none";
  }
});