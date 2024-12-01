// API
const apiKey = '5ab89a8caedd40754b213c50c7d2509d';
let city;
let latitude;
let longitude;
const userIpLocUrl = `http://ip-api.com/json/`;
const hourlyAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`

// Elements
const display = document.getElementById('display');
const search = document.getElementById('search');
const days = document.querySelector('.days');
const cityName = document.querySelector('#city')

// weathers
const weathers = {
    '01d': 'clear.gif',
    '01n': 'clearSkyNight.webp',
    '02d': 'fewClouds.webp',
    '02n': 'fewCloudsNight.webp',
    '03d': 'scatteredClouds.webp',
    '03n': 'scatteredCloudsNight.webp',
    '04d': 'brokenClouds.webp',
    '04n': 'brokenCloudsNight.gif',
    '09d': 'showerRain.webp',
    '09n': 'showerRainNight.webp',
    '10d': 'rain.webp',
    '10n': 'rainNight.webp',
    '11d': 'thunderStorm.webp',
    '11n': 'thunderStormNight.webp',
    '13d': 'snow.webp',
    '13n': 'snowNight.webp',
    '50d': 'mist.webp',
    '50n': 'mistNight.webp',
}

// validate city function
const validateCity = async (city) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            return true;
        } else if (data.cod === "404") {
            alert("City not found. Please enter a valid city name or check the spelling.");
            return false;
        } else {
            alert(`Error: ${data.message}`);
            return false;
        }
    } catch (error) {
        // Network or other fetch error
        console.error("Error validating city:", error);
        alert("An error occurred while validating the city. Please try again.");
        return false;
    }
};

const getUserLocWeather = async () => {
    try {
        const response = await fetch(userIpLocUrl)
        const locationData = await response.json();
        latitude = await locationData.lat;
        longitude = await locationData.lon;
        const userLocWeatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        const weatherDataResp = await fetch(userLocWeatherApi);
        const weatherData = await weatherDataResp.json()
        return weatherData;
    } catch (err) {
        console.log(err)
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const userLocWeatherData = await getUserLocWeather();
    displayData(userLocWeatherData);
    fetchHourlyForecast();
    const hourlyData = await fetchHourlyForecast()
    displayHourlyForecast(hourlyData)
    document.getElementById('bookmark').addEventListener("click",async e => {
        const city = document.getElementById('city').textContent.toLowerCase();
        const cities = getSavedCities();
        if (!cities.includes(city)) {
            cities.push(city);
            saveCities(cities);
            displayCities();
            search.value = city;
            const weatherData = await getSearch();
            displayData(weatherData);
        } else {
            alert("City already saved!");
        }
    })
})

const displayData = async (userLocWeatherData) => {

    if (userLocWeatherData) {
        const getWindDirection = (degrees) => {
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const index = Math.round((degrees % 360) / 45) % 8;
            return directions[index];
        }
        const dataSet = {
            name: userLocWeatherData.name,
            temperature: (userLocWeatherData.main.temp - 273.15).toFixed(2),
            currentWeather: userLocWeatherData.weather[0].main,
            currentWeatherIcon: userLocWeatherData.weather[0].icon,
            humidity: userLocWeatherData.main.humidity,
            pressure: userLocWeatherData.main.pressure,
            windSpeed: userLocWeatherData.wind.speed,
            windDirec: getWindDirection(userLocWeatherData.wind.deg),
            sunrise: new Date(userLocWeatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sunset: new Date(userLocWeatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            chance: userLocWeatherData.clouds.all
        }
        display.style.background = `url(./ASSETS/${weathers[dataSet.currentWeatherIcon]}) no-repeat center top `;
        display.style.backgroundSize = 'cover'
        const textColorClass = dataSet.currentWeatherIcon.includes('n') ? "text-light" : "light";
        const paeameterColorClass = dataSet.currentWeatherIcon.includes('n') ? "text-light" : "light";
        console.log(dataSet.currentWeatherIcon);
        console.log(dataSet.currentWeatherIcon.includes('n'))
        const bookmark = JSON.parse(localStorage.getItem("cities")).includes(dataSet.name.toLowerCase()) ? "fa-solid" : "fa-regular"
        console.log(bookmark)
        console.log(textColorClass)
        display.innerHTML = `
         <h1 class="opt pt-3 ${textColorClass}"><span id="city">${dataSet.name}</span> <span id="datee" class="fs-4"></span></h1>
                    <div class="opt row my-5 py-5 temp ${textColorClass}">
                        <h1 class="my-2"><span id="temperature">${dataSet.temperature}</span>℃</h1>
                        <h4 id="currWeather" class="">${dataSet.currentWeather} <img id="iconImg" width="50" src="https://openweathermap.org/img/wn/${dataSet.currentWeatherIcon}@2x.png"></img></h4>
                    </div>
                    <div class="row align-items-end para">
                        <div class="opt col ${paeameterColorClass}">  
                            <h4><em>Humidity</em></h4>
                            <i class="fa-solid fa-droplet fs-4"></i>
                            <h5 id="humidity">${dataSet.humidity}%</h5>
                        </div>
                        <div class="opt col ${paeameterColorClass}">
                            <h4><em>Wind Speed</em></h4>
                            <i class="fa-solid fa-wind fs-4"></i>
                            <h5 id="wind">${dataSet.windDirec} ${dataSet.windSpeed}km/h</h5>
                        </div>
                        <div class="opt col ${paeameterColorClass}">
                            <h4><em>Chance of rain</em></h4>
                            <i class="fa-solid fa-umbrella fs-4"></i>
                            <h5 id="chance">${dataSet.chance}%</h5>
                        </div>
                        <div class="opt col ${paeameterColorClass}">
                            <h4><em>Sunrise | Sunset</h4>
                            <img width="35" src="./ASSETS/sunrise.png"></img> | <img width="35" src="./ASSETS/sunset.png"></img>
                            <h6 id="sun" class="">${dataSet.sunrise} | ${dataSet.sunset}</h6>
                        </div>
                    </div>
                    <i id="bookmark" class="${bookmark} fa-bookmark fs-2 mt-3 me-3"></i>`
        bookmarkfn();
    }
}


const getSearch = async () => {
    city = search.value;
    validateCity(city)
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
        const weatherDataResp = await fetch(apiUrl);
        const weatherData = await weatherDataResp.json()
        return weatherData;
    } catch (err) {
        console.log(err)
        return null;
    }
}

const searchAnDisplay = async () => {
    const weatherData = await getSearch();
    displayData(weatherData)
    const hourlyData = await fetchSearchHourlyForcast();
    displayHourlyForecast(hourlyData)
    bookmark();
}

const fetchHourlyForecast = async () => {
    try {
        // Get user location
        const userLocation = await fetch(userIpLocUrl)
            .then(response => response.json());
        const lat = userLocation.lat;
        const lon = userLocation.lon;

        // Fetch hourly weather
        const hourlyApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const forecastData = await fetch(hourlyApiUrl)
            .then(response => response.json());

        return forecastData;
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        return null;
    }
};

const fetchSearchHourlyForcast = async () => {
    try {
        // Fetch hourly weather
        const hourlyApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
        console.log(hourlyApiUrl)
        const forecastData = await fetch(hourlyApiUrl)
            .then(response => response.json());
        return forecastData;
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        return null;
    }
}

const displayHourlyForecast = (data) => {
    const hourlyData = data.list.slice(0, 12); // Next 12 hours
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    hourlyData.forEach(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = (hour.main.temp - 273.15).toFixed(1); // Convert Kelvin to Celsius
        const weather = hour.weather[0].main;
        const chanceOfRain = (hour.pop * 100).toFixed(0); // Convert probability to percentage
        const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`;

        forecastContainer.innerHTML += `
        <div class="forecast-item">
                <p>${time}</p>
                <img src="${icon}" alt="${weather}">
                <p>${temp} ℃</p>
                <p>${weather}</p>
                <p>Rain: ${chanceOfRain}%</p>
            </div>
        `;
    });
    forecastbyDay(data);
};

const forecastbyDay = async (dataw) => {
    try {
        const now = new Date();
        const forecastbyDay = {};
        const data = await dataw;

        // Group data by day
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toISOString().split("T")[0]; // YYYY-MM-DD

            if (!forecastbyDay[day]) {
                forecastbyDay[day] = [];
            }

            forecastbyDay[day].push({
                time: date.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }),
                temp: (item.main.temp - 273.15).toFixed(1),
                icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
                weather: item,
            });
        });

        document.querySelector('.days').innerHTML = ``;

        Object.entries(forecastbyDay).forEach(([day, forecast], index) => {
            const date = new Date(day);
            let dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

            // Check if it's today or tomorrow
            if (day === now.toISOString().split("T")[0]) {
                dayName = "Today";
            } else if (day === new Date(now.getTime() + 86400000).toISOString().split("T")[0]) {
                dayName = "Tomorrow";
            }

            const selectedWeatherForecast = forecast[2] || forecast[0];

            const cardHTML = `
                <div class="col day text-dark card m-1 p-1 ${index == 0 ? "bg-light" : ""}" data-weather='${JSON.stringify({ "weather": selectedWeatherForecast.weather, "dayName": dayName })}'>
                    <h5>${dayName}</h5>
                    <p>${day}</p>
                    <p>${forecast[0].temp}℃ <img width="25" src=${forecast[0].icon}></img></p>
                </div>
            `;
            document.querySelector('.days').innerHTML += cardHTML;
        });

        document.querySelectorAll('.day').forEach((card, i) => {
            card.addEventListener('click', function () {
                document.querySelectorAll('.day').forEach(e => e.classList.remove('bg-light'));
                card.classList.add('bg-light')
                const weatherData = JSON.parse(this.getAttribute('data-weather'));
                dayDisplay(weatherData);
            });
        });
    } catch (error) {
        console.error("Error fetching day by day data: ", error);
    }
};

const dayDisplay = async (data) => {
    if (data.dayName != 'Today') {
        const userLocWeatherData = data["weather"];
        const getWindDirection = (degrees) => {
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const index = Math.round((degrees % 360) / 45) % 8;
            return directions[index];
        };

        const dataSet = {
            temperature: (userLocWeatherData.main.temp - 273.15).toFixed(2),
            currentWeather: userLocWeatherData.weather[0].main,
            currentWeatherIcon: userLocWeatherData.weather[0].icon,
            humidity: userLocWeatherData.main.humidity,
            windSpeed: userLocWeatherData.wind.speed,
            windDirec: getWindDirection(userLocWeatherData.wind.deg),
            sunrise: 'n/a',
            sunset: 'n/a',
            chance: userLocWeatherData.clouds.all,
        };

        const paeameterColorClass = dataSet.currentWeatherIcon.includes('n') ? "text-light" : "light";
        document.querySelectorAll('.opt').forEach(e => {
            e.classList.remove("text-light")
            e.classList.remove("light")
            e.classList.add(paeameterColorClass);
        })
        // Update UI
        display.style.background = `url(./ASSETS/${weathers[dataSet.currentWeatherIcon]}) no-repeat center top `;
        display.style.backgroundSize = 'cover'
        document.getElementById("datee").textContent = `(${data.dayName})`;
        document.getElementById("temperature").textContent = `${dataSet.temperature}`;
        document.getElementById("currWeather").innerHTML = `${dataSet.currentWeather} <img id="iconImg" width="50" src="https://openweathermap.org/img/wn/${dataSet.currentWeatherIcon}@2x.png"></img>`;
        document.getElementById("humidity").textContent = `${dataSet.humidity}%`;
        document.getElementById("wind").textContent = `${dataSet.windDirec} ${dataSet.windSpeed}km/h`;
        document.getElementById("chance").textContent = `${dataSet.chance}%`;
        document.getElementById("sun").textContent = `${dataSet.sunrise} | ${dataSet.sunset}`;
    } else {
        search.value = document.getElementById('city').textContent
        const weatherData = await getSearch();
        displayData(weatherData)
    }
};

// Saved cities list
// utility functions
let cities;
const getSavedCities = () => JSON.parse(localStorage.getItem("cities")) || []
const saveCities = (cities) => localStorage.setItem("cities", JSON.stringify(cities))

// DISPLAY CITIES
const displayCities = () => {
    const savedList = document.getElementById("saved-list");
    savedList.innerHTML = "";
    const cities = getSavedCities();
    cities.forEach((city, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="cities">${city}</td>
            <td><i class="fa-solid fa-trash text-secondary" data-index="${index}"></i></td>    
        `
        savedList.appendChild(row);
        document.querySelectorAll(".cities").forEach(city => {
            city.addEventListener('click', async () => {
                search.value = city.textContent;
                const weatherData = await getSearch();
                displayData(weatherData);
                city = city
                const hourlyData = await fetchSearchHourlyForcast();
                displayHourlyForecast(hourlyData)
            });
        });
    })
}

// add a city
const addCity = async () => {
    const city = prompt("Enter the city name: ").toLowerCase();
    if (city) {
        const cities = getSavedCities();
        if (await validateCity(city) == true) {
            if (!cities.includes(city)) {
                cities.push(city);
                saveCities(cities);
                displayCities();
            } else {
                alert("City already saved!");
            }
        } else {
            addCity();
        }
    }
}

// delete city
const deleteCity = (index) => {
    const cities = getSavedCities();
    cities.splice(index, 1);
    saveCities(cities);
    displayCities();
}

// bookmark
const bookmarkfn = () => {
    return document.getElementById('bookmark').addEventListener("click",async e => {
        const city = document.getElementById('city').textContent.toLowerCase();
        const cities = getSavedCities();
        if (!cities.includes(city)) {
            cities.push(city);
            saveCities(cities);
            displayCities();
            search.value = city;
            const weatherData = await getSearch();
            displayData(weatherData);
        } else {
            alert("City already saved!");
        }
    })
}


document.getElementById('addCity').addEventListener('click', addCity);
document.getElementById("saved-list").addEventListener("click", e => {

    if (e.target.classList.contains("fa-trash")) {
        const index = e.target.getAttribute("data-index");
        deleteCity(index);
    }
})

// initialize saved list
displayCities();

const hourlyForecast = document.querySelector('#forecastContainer');

let isMouseDown = false;
let startX;
let scrollLeft;

hourlyForecast.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - hourlyForecast.offsetLeft;
    scrollLeft = hourlyForecast.scrollLeft;
});

hourlyForecast.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

hourlyForecast.addEventListener('mouseup', () => {
    isMouseDown = false;
});

hourlyForecast.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return; // Prevent scrolling when mouse is not down
    e.preventDefault();
    const x = e.pageX - hourlyForecast.offsetLeft;
    const walk = (x - startX) * 3; // Multiply by 3 for faster scroll
    hourlyForecast.scrollLeft = scrollLeft - walk;
});

// For touch devices (mobile/tablets)
let touchStartX;
let touchStartScrollLeft;

hourlyForecast.addEventListener('touchstart', (e) => {
    isMouseDown = true;
    touchStartX = e.touches[0].pageX - hourlyForecast.offsetLeft;
    touchStartScrollLeft = hourlyForecast.scrollLeft;
});

hourlyForecast.addEventListener('touchend', () => {
    isMouseDown = false;
});

hourlyForecast.addEventListener('touchmove', (e) => {
    if (!isMouseDown) return; // Prevent scrolling when not touching
    e.preventDefault();
    const x = e.touches[0].pageX - hourlyForecast.offsetLeft;
    const walk = (x - touchStartX) * 3; // Multiply by 3 for faster scroll
    hourlyForecast.scrollLeft = touchStartScrollLeft - walk;
});
