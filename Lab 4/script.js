// ==================== API CONFIGURATION ====================
const WEATHER_API_KEY = 'c07371c77c27c37589415ab178c72cbe'; // Students should add their OpenWeatherMap API key
const NASA_API_KEY = 'DEMO_KEY'; // NASA provides a demo key, but students can get their own

// ==================== DOM ELEMENTS ====================
const elements = {
    loading: document.getElementById('loading'),
    content: document.getElementById('content'),
    locationInput: document.getElementById('locationInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationName: document.getElementById('locationName'),
    coordinates: document.getElementById('coordinates'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    condition: document.getElementById('condition'),
    feelsLike: document.getElementById('feelsLike'),
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    apodImage: document.getElementById('apodImage'),
    apodTitle: document.getElementById('apodTitle'),
    apodDate: document.getElementById('apodDate'),
    apodExplanation: document.getElementById('apodExplanation'),
    apodCopyright: document.getElementById('apodCopyright'),
    spaceFacts: document.getElementById('spaceFacts'),
    spaceComparison: document.getElementById('spaceComparison'),
    timestamp: document.getElementById('timestamp')
};

// ==================== WEATHER ICON MAPPING ====================
const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
};

// ==================== SPACE FACTS DATA ====================
const spaceFacts = [
    {
        icon: '🌍',
        title: 'Earth Facts',
        facts: [
            'Earth rotates at 1,000 mph at the equator',
            'Our planet is 4.5 billion years old',
            'Earth\'s core is as hot as the Sun\'s surface',
            '70% of Earth is covered by water'
        ]
    },
    {
        icon: '🌙',
        title: 'Moon Facts',
        facts: [
            'The Moon is slowly drifting away from Earth',
            'There\'s no dark side of the Moon',
            'Moon dust smells like gunpowder',
            'The Moon has moonquakes'
        ]
    },
    {
        icon: '☀️',
        title: 'Sun Facts',
        facts: [
            'The Sun is 93 million miles from Earth',
            'Sunlight takes 8 minutes to reach Earth',
            'The Sun is 4.6 billion years old',
            'One million Earths could fit inside the Sun'
        ]
    },
    {
        icon: '🪐',
        title: 'Solar System',
        facts: [
            'A day on Venus is longer than its year',
            'Jupiter\'s Great Red Spot is shrinking',
            'Saturn\'s rings are made of ice and rock',
            'Mars has the largest volcano in the solar system'
        ]
    }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set default location
    elements.locationInput.value = 'Troy, NY';

    // Add event listeners
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Load initial data
    loadAllData('Troy, NY');

    // Update timestamp
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
}

// ==================== SEARCH HANDLER ====================
async function handleSearch() {
    const location = elements.locationInput.value.trim();
    if (location) {
        showLoading();
        await loadAllData(location);
    }
}

// ==================== LOAD ALL DATA ====================
async function loadAllData(location) {
    try {
        // Load weather and NASA data in parallel
        await Promise.all([
            loadWeatherData(location),
            loadNASAData()
        ]);

        // Generate dynamic content
        generateSpaceFacts();
        generateSpaceComparisons();

        hideLoading();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please check your API keys and try again.');
        hideLoading();
    }
}

// ==================== WEATHER DATA ====================
async function loadWeatherData(location) {
    try {
        // First, get coordinates from location name using Geocoding API
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error('Location not found');
        }

        const { lat, lon, name, state, country } = geoData[0];

        // Then get weather data using coordinates
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        displayWeatherData(weatherData, name, state, country, lat, lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);

        // Use demo data if API key is not set or there's an error
        if (!WEATHER_API_KEY) {
            useDemoWeatherData(location);
        } else {
            throw error;
        }
    }
}

function displayWeatherData(data, cityName, state, country, lat, lon) {
    // Location info
    const locationText = state ? `${cityName}, ${state}` : `${cityName}, ${country}`;
    elements.locationName.textContent = `📍 ${locationText}`;
    elements.coordinates.textContent = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°W`;

    // Main weather
    const weatherMain = data.weather[0].main;
    elements.weatherIcon.textContent = weatherIcons[weatherMain] || '🌡️';
    elements.temperature.textContent = `${Math.round(data.main.temp)}°F`;
    elements.condition.textContent = data.weather[0].description.charAt(0).toUpperCase() +
                                     data.weather[0].description.slice(1);
    elements.feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°F`;

    // Weather details
    elements.windSpeed.textContent = `${Math.round(data.wind.speed)} mph`;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.pressure.textContent = `${data.main.pressure} hPa`;
    elements.visibility.textContent = `${(data.visibility / 1609.34).toFixed(1)} mi`;
}

function useDemoWeatherData(location) {
    // Demo data for when API key is not set
    elements.locationName.textContent = `📍 ${location} (Demo Data)`;
    elements.coordinates.textContent = '42.7284°N, 73.6918°W';
    elements.weatherIcon.textContent = '☀️';
    elements.temperature.textContent = '72°F';
    elements.condition.textContent = 'Clear Sky';
    elements.feelsLike.textContent = 'Feels like 70°F';
    elements.windSpeed.textContent = '5 mph';
    elements.humidity.textContent = '45%';
    elements.pressure.textContent = '1013 hPa';
    elements.visibility.textContent = '10 mi';
}

// ==================== NASA APOD DATA ====================
async function loadNASAData() {
    try {
        const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        const response = await fetch(apodUrl);
        const data = await response.json();

        displayNASAData(data);
    } catch (error) {
        console.error('Error fetching NASA data:', error);
        useDemoNASAData();
    }
}

function displayNASAData(data) {
    elements.apodImage.src = data.url;
    elements.apodImage.alt = data.title;
    elements.apodTitle.textContent = data.title;
    elements.apodDate.textContent = formatDate(data.date);
    elements.apodExplanation.textContent = data.explanation;

    if (data.copyright) {
        elements.apodCopyright.textContent = `© ${data.copyright}`;
    } else {
        elements.apodCopyright.textContent = 'Image courtesy of NASA';
    }
}

function useDemoNASAData() {
    elements.apodImage.src = 'https://apod.nasa.gov/apod/image/2310/OrionNebula_Hubble_960.jpg';
    elements.apodTitle.textContent = 'The Orion Nebula';
    elements.apodDate.textContent = formatDate(new Date().toISOString().split('T')[0]);
    elements.apodExplanation.textContent = 'The Orion Nebula is a diffuse nebula situated in the Milky Way, being south of Orion\'s Belt in the constellation of Orion. It is one of the brightest nebulae and is visible to the naked eye in the night sky.';
    elements.apodCopyright.textContent = 'Image courtesy of NASA/ESA Hubble Space Telescope';
}

// ==================== SPACE FACTS GENERATION ====================
function generateSpaceFacts() {
    elements.spaceFacts.innerHTML = '';

    spaceFacts.forEach(factCategory => {
        const randomFact = factCategory.facts[Math.floor(Math.random() * factCategory.facts.length)];

        const factCard = document.createElement('div');
        factCard.innerHTML = `
            <div class="fact-icon">${factCategory.icon}</div>
            <div class="fact-title">${factCategory.title}</div>
            <div class="fact-text">${randomFact}</div>
        `;

        elements.spaceFacts.appendChild(factCard);
    });
}

// ==================== SPACE COMPARISONS ====================
function generateSpaceComparisons() {
    const temp = parseInt(elements.temperature.textContent);
    const humidity = parseInt(elements.humidity.textContent);
    const windSpeed = parseInt(elements.windSpeed.textContent);

    const comparisons = [
        {
            icon: '🌡️',
            title: 'Temperature Comparison',
            text: `At ${temp}°F on Earth, this is ${Math.abs(temp - (-243))}°F warmer than Mercury's night side (-243°F) but ${Math.abs(867 - temp)}°F cooler than Venus's surface (867°F)!`
        },
        {
            icon: '💨',
            title: 'Wind Speed Comparison',
            text: windSpeed > 100 ?
                `Your ${windSpeed} mph winds rival Mars's dust storms (60-100 mph)!` :
                `While your winds are ${windSpeed} mph, Neptune has winds up to 1,200 mph - the fastest in our solar system!`
        },
        {
            icon: '💧',
            title: 'Humidity vs Space',
            text: `Earth's ${humidity}% humidity is perfect for life! Meanwhile, Venus has crushing atmospheric pressure and Mars is bone dry.`
        },
        {
            icon: '🌍',
            title: 'Habitability',
            text: temp >= 32 && temp <= 100 ?
                'Your current temperature is within the "Goldilocks Zone" - perfect for liquid water and life!' :
                'Your weather is outside the ideal range for liquid water. Space is much more extreme!'
        }
    ];

    elements.spaceComparison.innerHTML = '';

    comparisons.forEach(comparison => {
        const comparisonCard = document.createElement('div');
        comparisonCard.innerHTML = `
            <div class="comparison-icon">${comparison.icon}</div>
            <div class="comparison-title">${comparison.title}</div>
            <div class="comparison-text">${comparison.text}</div>
        `;

        elements.spaceComparison.appendChild(comparisonCard);
    });
}

// ==================== UTILITY FUNCTIONS ====================
function showLoading() {
    elements.loading.style.display = 'block';
    elements.content.classList.add('hidden');
}

function hideLoading() {
    elements.loading.style.display = 'none';
    elements.content.classList.remove('hidden');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    elements.timestamp.textContent = `Last updated: ${timeString}`;
}

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

// ==================== API KEY REMINDER ====================
if (!WEATHER_API_KEY) {
    console.warn('⚠️ Weather API key not set. Using demo data. Get your free API key at: https://openweathermap.org/api');
}

console.log('🚀 Cosmic Weather Explorer initialized!');
console.log('💡 To use real weather data, add your OpenWeatherMap API key to the WEATHER_API_KEY variable');
console.log('🔑 Get your free API key at: https://openweathermap.org/api');
