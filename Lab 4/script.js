// ==================== API CONFIGURATION ====================
const WEATHER_API_KEY = 'c07371c77c27c37589415ab178c72cbe'; // OpenWeatherMap API key
const NASA_API_KEY = 'DEMO_KEY'; // NASA DEMO_KEY has rate limits - get your own free key at https://api.nasa.gov/

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
        // Validate API key exists
        if (!WEATHER_API_KEY) {
            console.warn('Weather API key not set. Using demo data.');
            useDemoWeatherData(location);
            return;
        }

        // First, get coordinates from location name using Geocoding API
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            console.warn(`Geocoding API error: ${geoResponse.status}`);
            useDemoWeatherData(location);
            return;
        }

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            console.warn(`Location "${location}" not found. Using demo data for Troy, NY.`);
            // Try Troy, NY as fallback
            const fallbackUrl = `https://api.openweathermap.org/geo/1.0/direct?q=Troy,NY,US&limit=1&appid=${WEATHER_API_KEY}`;
            const fallbackResponse = await fetch(fallbackUrl);
            const fallbackData = await fallbackResponse.json();

            if (fallbackData && fallbackData.length > 0) {
                const { lat, lon, name, state, country } = fallbackData[0];
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`;
                const weatherResponse = await fetch(weatherUrl);
                const weatherData = await weatherResponse.json();
                displayWeatherData(weatherData, name, state, country, lat, lon);
            } else {
                useDemoWeatherData(location);
            }
            return;
        }

        const { lat, lon, name, state, country } = geoData[0];

        // Then get weather data using coordinates
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            console.warn(`Weather API error: ${weatherResponse.status}`);
            useDemoWeatherData(location);
            return;
        }

        const weatherData = await weatherResponse.json();
        displayWeatherData(weatherData, name, state, country, lat, lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        useDemoWeatherData(location);
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

        // Check if the response is OK (status 200-299)
        if (!response.ok) {
            console.warn(`NASA API returned status ${response.status}. Using demo data.`);
            if (response.status === 429) {
                console.warn('NASA API rate limit exceeded. Get your own free API key at https://api.nasa.gov/');
            }
            useDemoNASAData();
            return;
        }

        const data = await response.json();

        // Validate the data has required fields
        if (data && data.url && data.title) {
            displayNASAData(data);
        } else {
            console.warn('NASA API returned incomplete data. Using demo data.');
            useDemoNASAData();
        }
    } catch (error) {
        console.error('Error fetching NASA data:', error);
        useDemoNASAData();
    }
}

function displayNASAData(data) {
    try {
        // Check if it's a video or image
        if (data.media_type === 'video') {
            // Handle video - replace img with iframe
            const container = elements.apodImage.parentElement;
            container.innerHTML = `
                <iframe
                    src="${data.url}"
                    class="apod-image"
                    frameborder="0"
                    allowfullscreen
                    style="width: 100%; height: 100%;"
                ></iframe>
            `;
            console.log('📹 Today\'s APOD is a video!');
        } else {
            // Handle image normally
            if (elements.apodImage && elements.apodImage.tagName === 'IMG') {
                // Add loading indicator
                elements.apodImage.style.opacity = '0.5';

                elements.apodImage.src = data.url || '';
                elements.apodImage.alt = data.title || 'NASA Image';

                // Add load handler to remove loading state
                elements.apodImage.onload = function() {
                    elements.apodImage.style.opacity = '1';
                    console.log('✅ NASA APOD image loaded successfully');
                };

                // Add error handler for image loading
                elements.apodImage.onerror = function() {
                    console.error('❌ Failed to load NASA image, using demo data');
                    useDemoNASAData();
                };
            } else {
                // If iframe exists, replace with img
                const container = document.querySelector('.apod-image-container');
                container.innerHTML = `<img id="apodImage" src="${data.url}" alt="${data.title}" class="apod-image">`;
                // Re-cache the element
                elements.apodImage = document.getElementById('apodImage');

                // Add handlers to the new element
                elements.apodImage.onload = function() {
                    elements.apodImage.style.opacity = '1';
                    console.log('✅ NASA APOD image loaded successfully');
                };
                elements.apodImage.onerror = function() {
                    console.error('❌ Failed to load NASA image, using demo data');
                    useDemoNASAData();
                };
            }
        }

        elements.apodTitle.textContent = data.title || 'Untitled';
        elements.apodDate.textContent = data.date ? formatDate(data.date) : formatDate(new Date().toISOString().split('T')[0]);
        elements.apodExplanation.textContent = data.explanation || 'No description available.';

        if (data.copyright) {
            elements.apodCopyright.textContent = `© ${data.copyright}`;
        } else {
            elements.apodCopyright.textContent = 'Image courtesy of NASA';
        }
    } catch (error) {
        console.error('Error displaying NASA data:', error);
        useDemoNASAData();
    }
}

function useDemoNASAData() {
    // Ensure we have an image element, not iframe
    const container = document.querySelector('.apod-image-container');
    if (container && !elements.apodImage) {
        container.innerHTML = '<img id="apodImage" src="" alt="NASA Image" class="apod-image">';
        elements.apodImage = document.getElementById('apodImage');
    }

    // Array of stunning space images from reliable sources
    const spaceImages = [
        {
            url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80',
            title: 'The Milky Way Galaxy',
            explanation: 'Our home galaxy, the Milky Way, contains over 200 billion stars and stretches about 100,000 light-years across. This stunning view captures the galactic core rising above Earth\'s horizon.',
            credit: 'Photo by Jeremy Thomas on Unsplash'
        },
        {
            url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80',
            title: 'Nebula in Deep Space',
            explanation: 'Nebulae are vast clouds of dust and gas in space, often serving as stellar nurseries where new stars are born. These cosmic structures create some of the most beautiful sights in the universe.',
            credit: 'Photo by Greg Rakozy on Unsplash'
        },
        {
            url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&q=80',
            title: 'Starfield and Cosmic Dust',
            explanation: 'This breathtaking view shows countless stars scattered across space, interconnected by streams of cosmic dust and gas. Each point of light represents a distant sun, many with their own planetary systems.',
            credit: 'Photo by Aldebaran S on Unsplash'
        },
        {
            url: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=1200&q=80',
            title: 'The Cosmic Dance',
            explanation: 'Stars, galaxies, and nebulae create an endless cosmic ballet across the universe. This image captures the raw beauty of deep space, where light from distant objects has traveled for millions of years to reach us.',
            credit: 'Photo by Guillermo Ferla on Unsplash'
        },
        {
            url: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=1200&q=80',
            title: 'Galactic Wonder',
            explanation: 'The universe is filled with billions of galaxies, each containing hundreds of billions of stars. This spectacular view reminds us of the vast scale and incredible beauty of the cosmos.',
            credit: 'Photo by Stellrweb on Unsplash'
        }
    ];

    // Select a random image or use date-based selection for consistency throughout the day
    const today = new Date().toISOString().split('T')[0];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const selectedImage = spaceImages[dayOfYear % spaceImages.length];

    if (elements.apodImage && elements.apodImage.tagName === 'IMG') {
        elements.apodImage.src = selectedImage.url;
        elements.apodImage.alt = selectedImage.title;

        // Add error handler in case Unsplash is down too
        elements.apodImage.onerror = function() {
            console.warn('Primary demo image failed, trying fallback...');
            // Ultimate fallback - a different Unsplash image
            elements.apodImage.src = 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80';
        };
    } else {
        container.innerHTML = `<img id="apodImage" src="${selectedImage.url}" alt="${selectedImage.title}" class="apod-image">`;
        elements.apodImage = document.getElementById('apodImage');

        elements.apodImage.onerror = function() {
            console.warn('Primary demo image failed, trying fallback...');
            elements.apodImage.src = 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80';
        };
    }

    elements.apodTitle.textContent = selectedImage.title + ' (Demo)';
    elements.apodDate.textContent = formatDate(today);
    elements.apodExplanation.textContent = selectedImage.explanation + ' NASA API temporarily unavailable - get your own free API key at https://api.nasa.gov/ for daily astronomy pictures.';
    elements.apodCopyright.textContent = selectedImage.credit;
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
    try {
        // Handle both Date objects and date strings
        const date = typeof dateString === 'string' ? new Date(dateString + 'T00:00:00') : new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        // Return today's date as fallback
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
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
