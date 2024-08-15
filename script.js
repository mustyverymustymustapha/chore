const choreWheel = document.getElementById('chore-wheel');
const familyWheel = document.getElementById('family-wheel');
const result = document.getElementById('result');
const trackerContent = document.getElementById('tracker-content');
const leaderboardContent = document.getElementById('leaderboard-content');
const weatherInfo = document.getElementById('weather-info');
let chores = [
    { name: 'Dishes', baseDifficulty: 2 },
    { name: 'Laundry', baseDifficulty: 3 },
    { name: 'Vacuuming', baseDifficulty: 2 },
    { name: 'Dusting', baseDifficulty: 1 }
];
let familyMembers = ['Mom', 'Dad', 'Sister', 'Brother'];
let assignments = {};
let familyPoints = {};
let currentWeather = '';
let currentTemperature = 0;
function updateWheel(wheelType) {
    const wheel = wheelType === 'chore' ? choreWheel : familyWheel;
    const items = wheelType === 'chore' ? chores : familyMembers;
    wheel.innerHTML = '';
    const angleIncrement = 360 / items.length;
    items.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'wheel-item';
        element.style.transform = `rotate(${index * angleIncrement}deg)`;
        element.style.backgroundColor = `hsl(${index * (360 / items.length)}, 70%, 50%)`;
        if (wheelType === 'chore') {
            const adjustedDifficulty = calculateAdjustedDifficulty(item);
            element.innerHTML = `${item.name}<span class="difficulty-stars">${'★'.repeat(adjustedDifficulty)}</span>`;
        } else {
            element.textContent = item;
        }
        wheel.appendChild(element);
    });
}
function spinWheel(wheelType) {
    const wheel = wheelType === 'chore' ? choreWheel : familyWheel;
    const items = wheelType === 'chore' ? chores : familyMembers;
    const randomAngle = Math.floor(Math.random() * 360) + 720;
    wheel.style.transform = `rotate(${randomAngle}deg)`;
    setTimeout(() => {
        const selectedIndex = Math.floor(((randomAngle % 360) / 360) * items.length);
        const selectedItem = items[selectedIndex];
        if (wheelType === 'chore') {
            const adjustedDifficulty = calculateAdjustedDifficulty(selectedItem);
            result.textContent = `Selected chore: ${selectedItem.name} (Difficulty: ${'★'.repeat(adjustedDifficulty)})`;
        } else {
            result.textContent += ` | Selected family member: ${selectedItem}`;
            assignments[selectedItem] = result.textContent.split('|')[0].trim().replace('Selected chore: ', '');
            updateTracker();
        }
    }, 5000);
}
function addItem(wheelType) {
    const input = document.getElementById(`${wheelType}-input`);
    const newItem = input.value.trim();
    if (newItem) {
        if (wheelType === 'chore') {
            const baseDifficulty = parseInt(document.getElementById('chore-base-difficulty').value);
            chores.push({ name: newItem, baseDifficulty: baseDifficulty });
        } else {
            familyMembers.push(newItem);
            familyPoints[newItem] = 0;
        }
        updateWheel(wheelType);
        input.value = '';
        updateLeaderboard();
    }
}
function updateTracker() {
    trackerContent.innerHTML = '';
    for (const [member, chore] of Object.entries(assignments)) {
        const item = document.createElement('div');
        item.className = 'tracker-item';
        item.innerHTML = `
            <span>${member}: ${chore}</span>
            <button onclick="completeChore('${member}')">Complete</button>
        `;
        trackerContent.appendChild(item);
    }
}
function completeChore(member) {
    const item = trackerContent.querySelector(`.tracker-item:has(span:contains('${member}'))`);
    item.classList.add('completed');
    item.querySelector('button').disabled = true;
    const choreName = assignments[member].split('(')[0].trim();
    const chore = chores.find(c => c.name === choreName);
    if (chore) {
        const adjustedDifficulty = calculateAdjustedDifficulty(chore);
        familyPoints[member] = (familyPoints[member] || 0) + adjustedDifficulty;
    }
    updateLeaderboard();
}
function resetTracker() {
    assignments = {};
    updateTracker();
}
function weeklyReset() {
    const now = new Date();
    const nextSunday = new Date(now.setDate(now.getDate() + (7 - now.getDay()) % 7));
    nextSunday.setHours(0, 0, 0, 0);
    const timeUntilReset = nextSunday.getTime() - now.getTime();
    setTimeout(() => {
        resetTracker();
        familyPoints = Object.fromEntries(Object.entries(familyPoints).map(([k, v]) => [k, 0]));
        updateLeaderboard();
        weeklyReset();
    }, timeUntilReset);
}
function updateLeaderboard() {
    leaderboardContent.innerHTML = '';
    const sortedFamily = Object.entries(familyPoints).sort((a, b) => b[1] - a[1]);
    sortedFamily.forEach(([member, points]) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `<span>${member}</span><span>${points} points</span>`;
        leaderboardContent.appendChild(item);
    });
}
function fetchWeather() {
    const apiKey = '1321560a792c3786300c1109d5496297';
    const city = 'Karachi';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            currentWeather = data.weather[0].main;
            currentTemperature = data.main.temp;
            weatherInfo.textContent = `Current Weather: ${currentWeather}, Temperature: ${currentTemperature}°C`;
            updateWheel('chore');
        })
        .catch(error => console.error('Error fetching weather:', error));
}
function calculateAdjustedDifficulty(chore) {
    let adjustedDifficulty = chore.baseDifficulty;
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        adjustedDifficulty -= 1;
    }
    if (currentWeather === 'Rain' || currentWeather === 'Snow') {
        adjustedDifficulty += 1;
    }
    if (currentTemperature > 30) {
        adjustedDifficulty += 1;
    } else if (currentTemperature < 0) {
        adjustedDifficulty += 2;
    }
    return Math.max(1, Math.min(5, adjustedDifficulty));
}
familyMembers.forEach(member => familyPoints[member] = 0);
fetchWeather();
setInterval(fetchWeather, 3600000);
updateWheel('chore');
updateWheel('family');
updateLeaderboard();
weeklyReset();