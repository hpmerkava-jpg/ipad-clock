const weatherInfo = document.getElementById("weatherInfo");
const locationInfo = document.getElementById("locationInfo");

function weatherIcon(code) {

    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 99) return "⛈️";

    return "❓";

}

async function loadWeather(lat, lon) {

    try {

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        );

        const weather = await weatherResponse.json();

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=hr`
        );

        const geo = await geoResponse.json();

        const temp = Math.round(weather.current.temperature_2m);
        const icon = weatherIcon(weather.current.weather_code);

        weatherInfo.textContent = `${icon} ${temp}°C`;

        if (geo.results && geo.results.length > 0) {

            locationInfo.textContent = geo.results[0].name;

        }

    }
	catch (err) {

		console.error("Weather error:", err);

		weatherInfo.textContent = "GREŠKA";

	}

}

function initWeather() {

    if (!navigator.geolocation) {

        weatherInfo.textContent = "--°C";

        return;

    }

    navigator.geolocation.getCurrentPosition(

        pos => {

            loadWeather(
                pos.coords.latitude,
                pos.coords.longitude
            );

        },

		(err) => {

			console.error("GPS:", err);

			weatherInfo.textContent = "GPS";

		}

    );

}

initWeather();

setInterval(initWeather, 30 * 60 * 1000);