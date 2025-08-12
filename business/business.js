// Function to update the time display (adjusted for Europe/Madrid timezone)
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Madrid' // Adjust for location timezone
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Function to update gauge displays
function updateGauge(gaugeId, value, maxValue = 100) {
    const gauge = document.getElementById(gaugeId);
    const circumference = 314; // 2 * π * 50
    const offset = circumference - (value / maxValue) * circumference;
    gauge.style.strokeDashoffset = offset;
}

// Function to update wind direction arrow
function updateWindDirection(degrees) {
    const arrow = document.getElementById('windDirectionArrow');
    arrow.style.transform = `translate(-50%, -100%) rotate(${degrees}deg)`;
}

// Function to update temperature indicator position (now assuming vertical bar from bottom)
function updateTemperatureIndicator(temp, minTemp, maxTemp) {
    const indicator = document.getElementById('tempIndicator');
    const range = maxTemp - minTemp;
    const position = ((temp - minTemp) / range) * 200;
    indicator.style.height = `${Math.max(0, Math.min(200, position))}px`; // Change to height for bottom-up fill
}

// Function to map weather condition to icon
function getWeatherIcon(condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    return '🌤️';
}

// Function to generate dynamic activity suggestions based on weather data
function generateSuggestions(data) {
    const suggestions = [];
    const temp = data.temperature;
    const rainChance = data.rainChance || 0;
    const windSpeed = data.windSpeed;
    const condition = data.weatherCondition.toLowerCase();

    if (temp > 30 && rainChance < 20 && condition.includes('clear')) {
        suggestions.push('Go for a swim or light jog – track your heart rate and stay hydrated with Oura insights. 🏊');
        suggestions.push('Enjoy outdoor yoga in the shade – monitor body temperature and recovery via Oura. 🧘');
        suggestions.push('Plan a team picnic – log steps and activity to meet daily goals with Oura. 🌳');
    } else if (temp > 20 && temp <= 30 && rainChance < 20 && condition.includes('clear')) {
        suggestions.push('Go for a run or bike ride outdoors – track your active calories and heart rate with your Oura ring.');
        suggestions.push('Plan a team hike – monitor your readiness score before starting.');
        suggestions.push('Enjoy a picnic or outdoor yoga – log the activity to boost your daily movement goals.');
    } else if (temp > 10 && temp <= 20 && rainChance < 30) {
        suggestions.push('Take a brisk walk in the park – aim for 10,000 steps on your Oura to improve your activity score.');
        suggestions.push('Organize a light outdoor team-building game – keep an eye on your body temperature via Oura.');
        suggestions.push('Cycle to work if possible – use Oura to track recovery after the commute.');
    } else if (temp <= 10 || rainChance >= 30 || condition.includes('rain') || condition.includes('snow')) {
        suggestions.push('Opt for indoor workouts like gym sessions or home exercises – Oura can help optimize your training based on readiness.');
        suggestions.push('Focus on recovery activities such as meditation or stretching – check your Oura sleep data for better rest.');
        suggestions.push('Host an indoor wellness workshop – encourage tracking HRV with Oura for stress management.');
    } else {
        suggestions.push('Mix indoor and outdoor activities – use Oura to balance your energy levels throughout the day.');
        suggestions.push('Track a short walk and monitor wind effects on your pace via Oura activity insights.');
    }

    if (windSpeed > 10) {
        suggestions.push('Avoid high-wind activities; instead, do strength training indoors and log it in Oura.');
    }
    if (data.humidity > 80) {
        suggestions.push('Stay hydrated during activities – Oura can indirectly help by tracking overall readiness.');
    }
    if (temp > 30) {
        suggestions.push('Drink plenty of water and take breaks – use Oura to monitor readiness and avoid overexertion.');
    }

    return suggestions.slice(0, 5);
}

// Function to update the suggestions list in the DOM
function updateSuggestions(suggestions) {
    const list = document.getElementById('suggestionList');
    list.innerHTML = ''; // Clear existing
    suggestions.forEach(sug => {
        const li = document.createElement('li');
        li.textContent = sug;
        list.appendChild(li);
    });
}

// Function to update all weather data on the dashboard
function updateWeatherData(data) {
    document.getElementById('currentTemp').textContent = `${data.temperature.toFixed(1)}°C`;
    document.getElementById('minTemp').textContent = `${data.minTemp.toFixed(1)}°C`;
    document.getElementById('maxTemp').textContent = `${data.maxTemp.toFixed(1)}°C`;
    updateTemperatureIndicator(data.temperature, data.minTemp, data.maxTemp);
    document.getElementById('humidityValue').textContent = data.humidity;
    updateGauge('humidityGauge', data.humidity);
    document.getElementById('windSpeedValue').textContent = data.windSpeed.toFixed(2);
    updateGauge('windSpeedGauge', data.windSpeed, 20);
    document.getElementById('windDirectionValue').textContent = data.windDirection;
    updateWindDirection(data.windDirection);
    document.getElementById('weatherDescription').textContent = data.weatherCondition;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(data.weatherCondition);
    document.getElementById('sunriseTime').textContent = new Date(data.sunrise * 1000).toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: data.timezone || 'Europe/Madrid'
    });
    document.getElementById('sunsetTime').textContent = new Date(data.sunset * 1000).toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: data.timezone || 'Europe/Madrid'
    });
    document.getElementById('rainChance').textContent = `${data.rainChance}%`;
    if (document.getElementById('locationSmall')) {
        document.getElementById('locationSmall').textContent = data.location;
    }

    const suggestions = generateSuggestions(data);
    updateSuggestions(suggestions);
}

// Function to fetch data from OpenWeatherMap One Call API for better min/max and rain data
async function fetchWeatherData() {
    try {
        const apiKey = '3e08267a6a1d9c62c0195fe25593f4af';
        const lat = 41.75; // Sant Fruitós de Bages latitude
        const lon = 1.8746; // Sant Fruitós de Bages longitude
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        const data = {
            temperature: apiData.current.temp,
            minTemp: apiData.daily[0].temp.min,
            maxTemp: apiData.daily[0].temp.max,
            humidity: apiData.current.humidity,
            windSpeed: apiData.current.wind_speed,
            windDirection: apiData.current.wind_deg,
            weatherCondition: apiData.current.weather[0].description,
            location: 'Industrial Shields', // Hardcoded as One Call doesn't provide city name
            sunrise: apiData.daily[0].sunrise,
            sunset: apiData.daily[0].sunset,
            rainChance: Math.round(apiData.daily[0].pop * 100),
            timezone: apiData.timezone
        };

        updateWeatherData(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Fallback to sample data with realistic values for Spain in August
        const sampleApiData = {
            temperature: 32.7,
            minTemp: 22.5,
            maxTemp: 34.2,
            humidity: 52,
            windSpeed: 1.95,
            windDirection: 188,
            weatherCondition: 'clear sky',
            location: 'Industrial Shields',
            sunrise: Math.floor(Date.now() / 1000) - 21600, // Approximate 6 hours ago
            sunset: Math.floor(Date.now() / 1000) + 14400,  // Approximate 4 hours from now
            rainChance: 0,
            timezone: 'Europe/Madrid'
        };
        updateWeatherData(sampleApiData);
    }
}

// Initialize the dashboard
function initDashboard() {
    updateTime();
    fetchWeatherData();

    // Update time every second
    setInterval(updateTime, 1000);

    // Update weather data every 5 minutes (300,000 ms)
    setInterval(fetchWeatherData, 300000);
}

// Start the dashboard when page loads
window.addEventListener('load', initDashboard);

// Function to generate dynamic activity suggestions based on weather data
function generateSuggestions(data) {
    const suggestions = [];
    const temp = data.temperature;
    const rainChance = data.rainChance || 0;
    const windSpeed = data.windSpeed;
    const condition = data.weatherCondition.toLowerCase();

    if (temp > 30 && rainChance < 20 && condition.includes('clear')) {
        suggestions.push('Go for a swim or light jog – track your heart rate and stay hydrated with Oura insights. 🏊');
        suggestions.push('Enjoy outdoor yoga in the shade – monitor body temperature and recovery via Oura. 🧘');
        suggestions.push('Plan a team picnic – log steps and activity to meet daily goals with Oura. 🌳');
    } else if (temp > 20 && temp <= 30 && rainChance < 20 && condition.includes('clear')) {
        suggestions.push('Go for a run or bike ride outdoors – track your active calories and heart rate with your Oura ring.');
        suggestions.push('Plan a team hike – monitor your readiness score before starting.');
        suggestions.push('Enjoy a picnic or outdoor yoga – log the activity to boost your daily movement goals.');
    } else if (temp > 10 && temp <= 20 && rainChance < 30) {
        suggestions.push('Take a brisk walk in the park – aim for 10,000 steps on your Oura to improve your activity score.');
        suggestions.push('Organize a light outdoor team-building game – keep an eye on your body temperature via Oura.');
        suggestions.push('Cycle to work if possible – use Oura to track recovery after the commute.');
    } else if (temp <= 10 || rainChance >= 30 || condition.includes('rain') || condition.includes('snow')) {
        suggestions.push('Opt for indoor workouts like gym sessions or home exercises – Oura can help optimize your training based on readiness.');
        suggestions.push('Focus on recovery activities such as meditation or stretching – check your Oura sleep data for better rest.');
        suggestions.push('Host an indoor wellness workshop – encourage tracking HRV with Oura for stress management.');
    } else {
        suggestions.push('Mix indoor and outdoor activities – use Oura to balance your energy levels throughout the day.');
        suggestions.push('Track a short walk and monitor wind effects on your pace via Oura activity insights.');
    }

    if (windSpeed > 10) {
        suggestions.push('Avoid high-wind activities; instead, do strength training indoors and log it in Oura.');
    }
    if (data.humidity > 80) {
        suggestions.push('Stay hydrated during activities – Oura can indirectly help by tracking overall readiness.');
    }
    if (temp > 30) {
        suggestions.push('Drink plenty of water and take breaks – use Oura to monitor readiness and avoid overexertion.');
    }

    return suggestions.slice(0, 5);
}

// Function to update the suggestions list in the DOM
function updateSuggestions(suggestions) {
    const list = document.getElementById('suggestionList');
    if (!list) return;

    list.innerHTML = ''; // Clear existing suggestions
    suggestions.forEach((suggestion, index) => {
        const li = document.createElement('li');
        li.className = 'suggestion-item fade-in';
        li.textContent = suggestion;
        li.style.animationDelay = `${index * 0.1}s`;
        list.appendChild(li);
    });
}

// Example usage with sample weather data (replace with your actual data source)
const sampleWeatherData = {
    temperature: 25,
    humidity: 60,
    windSpeed: 5.5,
    rainChance: 10,
    weatherCondition: 'clear sky'
};

// Update suggestions when the page loads
window.addEventListener('load', () => {
    const suggestions = generateSuggestions(sampleWeatherData);
    updateSuggestions(suggestions);
});

// Additional possible output functions (commented out for now):
// - Integrate Oura API: Fetch real user data like readiness score, activity levels.
//   Example: async function fetchOuraData(accessToken) { /* Fetch from https://api.ouraring.com/v2/usercollection/daily_readiness */ }
//   Then, in generateSuggestions, personalize based on readiness (e.g., if low, suggest rest).
// - User input: Allow users to input preferences (e.g., indoor/outdoor) via form and filter suggestions.
//   Example: Add a form with checkboxes, add event listener to regenerate suggestions.
// - Visual charts: Use Chart.js to show activity trends correlated with weather history.
//   Example: function renderActivityChart(weatherHistory, ouraHistory) { /* Create line chart */ }
// - Notifications: Push web notifications for weather changes affecting activities.
//   Example: if ('Notification' in window) { Notification.requestPermission().then(() => new Notification('Weather Update')); }

//should put in the top of js , bec some error above will not lead to api fetch : warning







// Start the dashboard when page loads
window.addEventListener('load', initDashboard);
const optionsGrid = document.getElementById('optionsGrid');
const bulkOrder = document.getElementById('bulk-order');

bulkOrder.addEventListener('mouseenter', () => {
    optionsGrid.classList.add('bulk-hover');
});
bulkOrder.addEventListener('mouseleave', () => {
    optionsGrid.classList.remove('bulk-hover');
});
// the hover then backgroudn change



// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    // Animate hamburger menu
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');

    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.product-card, .option-card, .industry-card, .stat-item').forEach(el => {
    observer.observe(el);
});

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '%';
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target + '%';
            }
        };

        updateCounter();
    });
}

// Trigger counter animation when statistics section is visible
const statsSection = document.querySelector('.statistics');
let countersAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
            animateCounters();
            countersAnimated = true;
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// Button click effects
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', function (e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.ripple.style.width = size + 'px';
        ripple.ripple.style.height = size + 'px';
        ripple.ripple.style.left = x + 'px';
        ripple.ripple.style.top = y + 'px';

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 1000);
    });
});










































// Function to update the time display (adjusted for +08 timezone)
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai' // Adjust for +08 timezone
    });
    document.getElementById('currentTime').textContent = timeString;
}

// Function to update gauge displays
function updateGauge(gaugeId, value, maxValue = 100) {
    const gauge = document.getElementById(gaugeId);
    const circumference = 314; // 2 * π * 50
    const offset = circumference - (value / maxValue) * circumference;
    gauge.style.strokeDashoffset = offset;
}

// Function to update wind direction arrow
function updateWindDirection(degrees) {
    const arrow = document.getElementById('windDirectionArrow');
    arrow.style.transform = `translate(-50%, -100%) rotate(${degrees}deg)`;
}

// Function to update temperature indicator position
function updateTemperatureIndicator(temp, minTemp, maxTemp) {
    const indicator = document.getElementById('tempIndicator');
    const range = maxTemp - minTemp;
    const position = ((temp - minTemp) / range) * 200;
    const topPosition = 200 - position;
    indicator.style.top = `${Math.max(0, Math.min(200, topPosition))}px`;
}

// Function to map weather condition to icon
function getWeatherIcon(condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    return '🌤️';
}

// Function to update all weather data on the dashboard
function updateWeatherData(data) {
    // Update temperature
    document.getElementById('currentTemp').textContent = `${data.temperature.toFixed(1)}°C`;
    document.getElementById('minTemp').textContent = `${data.minTemp.toFixed(1)}°C`;
    document.getElementById('maxTemp').textContent = `${data.maxTemp.toFixed(1)}°C`;
    updateTemperatureIndicator(data.temperature, data.minTemp, data.maxTemp);

    // Update humidity
    document.getElementById('humidityValue').textContent = data.humidity;
    updateGauge('humidityGauge', data.humidity);

    // Update wind speed
    document.getElementById('windSpeedValue').textContent = data.windSpeed.toFixed(2);
    updateGauge('windSpeedGauge', data.windSpeed, 20); // Max wind speed 20 m/s

    // Update wind direction
    document.getElementById('windDirectionValue').textContent = data.windDirection;
    updateWindDirection(data.windDirection);

    // Update weather description and icon
    document.getElementById('weatherDescription').textContent = data.weatherCondition;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(data.weatherCondition);

    // Update sunrise and sunset times
    document.getElementById('sunriseTime').textContent = new Date(data.sunrise * 1000).toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: 'Asia/Shanghai'
    });
    document.getElementById('sunsetTime').textContent = new Date(data.sunset * 1000).toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: 'Asia/Shanghai'
    });

    // Update rain chance (if available)
    document.getElementById('rainChance').textContent = data.rainChance ? `${data.rainChance}%` : '0%';
}

// Function to fetch data from OpenWeatherMap API
async function fetchWeatherData() {
    try {

        const apiKey = '3e08267a6a1d9c62c0195fe25593f4af';
        // Specify location (replace with actual coordinates for Industrial Shields)
        // Example coordinates (default to a generic location; replace with actual lat/lon)
        const lat = 39.9042; // Example: Beijing latitude
        const lon = 116.4074; // Example: Beijing longitude
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        // Alternative: Use city name (uncomment if you have a valid city name)
        // const city = 'Industrial Shields'; // Replace with actual city name if known
        // const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        const data = {
            temperature: apiData.main.temp,
            minTemp: apiData.main.temp_min,
            maxTemp: apiData.main.temp_max,
            humidity: apiData.main.humidity,
            windSpeed: apiData.wind.speed,
            windDirection: apiData.wind.deg,
            weatherCondition: apiData.weather[0].description,
            location: apiData.name,
            sunrise: apiData.sys.sunrise,
            sunset: apiData.sys.sunset,
            rainChance: apiData.rain ? (apiData.rain['1h'] || 0) * 100 : 0 // Approximate rain chance
        };

        updateWeatherData(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Fallback to sample data
        const sampleApiData = {/// error give alll zero , like pyuthon rmse
            temperature: 2.6,
            minTemp: -0.5,
            maxTemp: 8.6,
            humidity: 87,
            windSpeed: 1.44,
            windDirection: 350,
            weatherCondition: 'clear',
            location: 'Industrial Shields',
            sunrise: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            sunset: Math.floor(Date.now() / 1000) + 3600,  // 1 hour from now
            rainChance: 0
        };
        updateWeatherData(sampleApiData);
    }
}

// Initialize the dashboard
function initDashboard() {
    updateTime();
    fetchWeatherData();

    // Update time every second
    setInterval(updateTime, 1000);

    // Update weather data every 5 minutes (300,000 ms)
    setInterval(fetchWeatherData, 300000);
}

// Start the dashboard when page loads
window.addEventListener('load', initDashboard);