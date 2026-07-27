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

        if (!weatherResponse.ok) {
            throw new Error("Greška pri dohvatu vremena");
        }

        const weather = await weatherResponse.json();

        const temp = Math.round(weather.current.temperature_2m);
        const icon = weatherIcon(weather.current.weather_code);

        weatherInfo.textContent = `${icon} ${temp}°C`;

		const cityResponse = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=hr`
		);

		if (cityResponse.ok) {

			const city = await cityResponse.json();

			locationInfo.textContent =
				city.address.city ||
				city.address.town ||
				city.address.village ||
				city.address.municipality ||
				city.address.county ||
				"Hrvatska";

		} else {

			locationInfo.textContent = "Hrvatska";

		}

        // Privremeno - samo da provjerimo radi li vrijeme
        

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

// =========================
// CITY MODAL
// =========================

const cityModal = document.getElementById("cityModal");
const citySearch = document.getElementById("citySearch");
const cityResults = document.getElementById("cityResults");
const closeCityModal = document.getElementById("closeCityModal");
const useGpsBtn = document.getElementById("useGpsBtn");


function openCityModal() {

    console.log(cityModal);

    cityModal.classList.remove("hidden");
    citySearch.focus();
}

function closeModal() {
    cityModal.classList.add("hidden");
    citySearch.value = "";
    cityResults.innerHTML = "";
}

if (locationInfo) {
    locationInfo.style.cursor = "pointer";
    locationInfo.title = "Odaberi grad";
    locationInfo.addEventListener("click", openCityModal);
}

if (closeCityModal) {
    closeCityModal.addEventListener("click", closeModal);
}

if (cityModal) {
    cityModal.addEventListener("click", (e) => {
        if (e.target === cityModal) {
            closeModal();
        }
    });
}

async function searchCity(query) {

    if (query.length < 2) {
        cityResults.innerHTML = "";
        return;
    }

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&accept-language=hr&limit=10`
    );

    const cities = await response.json();

    cityResults.innerHTML = "";

    cities.forEach(city => {

        const div = document.createElement("div");

        div.className = "city-item";

        div.textContent = city.display_name;

        div.onclick = () => {

            closeModal();

            loadWeather(
                parseFloat(city.lat),
                parseFloat(city.lon)
            );

        };

        cityResults.appendChild(div);

    });

}

citySearch.addEventListener("input", () => {

    searchCity(citySearch.value.trim());

});