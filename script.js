const choreWheel = document.getElementById('chore-wheel');
const familyWheel = document.getElementById('family-wheel');
const result = document.getElementById('result');
const trackerContent = document.getElementById('tracker-content');
const leaderboardContent = document.getElementById('leaderboard-content');
const weatherInfo = document.getElementById('weather-info');
const suggestionList = document.getElementById('suggestion-list');
const scheduleTable = document.getElementById('schedule-table');
const timerChoreSelect = document.getElementById('timer-chore-select');
const timerFamilySelect = document.getElementById('timer-family-select');
const timerDisplay = document.getElementById('timer-display');
const timerStartStop = document.getElementById('timer-start-stop');
const timerReset = document.getElementById('timer-reset');
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
let choreSchedule = [];
const API_KEY = 'YOUR_API_KEY';
const CITY = 'New York';
let timerInterval;
let timerSeconds = 0;
let timerRunning = false;
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
        generateChoreSchedule();
        updateTimerSelects();
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
        generateChoreSchedule();
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
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            currentWeather = data.weather[0].main;
            currentTemperature = data.main.temp;
            weatherInfo.textContent = `Current Weather: ${currentWeather}, Temperature: ${currentTemperature}°C`;
            updateWheel('chore');
            suggestChores();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            weatherInfo.textContent = 'Weather data unavailable';
        });
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
function suggestChores() {
    const suggestions = [];
    if (currentWeather === 'Clear' || currentWeather === 'Sunny') {
        suggestions.push('Wash windows', 'Mow the lawn', 'Clean the garage');
    } else if (currentWeather === 'Rain') {
        suggestions.push('Organize closets', 'Clean the basement', 'Sort through old clothes');
    } else if (currentWeather === 'Snow') {
        suggestions.push('Shovel the driveway', 'Clean out the fridge', 'Organize the pantry');
    } else {
        suggestions.push('Dust furniture', 'Vacuum carpets', 'Clean bathrooms');
    }
    suggestionList.innerHTML = '';
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionList.appendChild(li);
    });
}
function generateChoreSchedule() {
    choreSchedule = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let familyIndex = 0;
    let choreIndex = 0;
    for (let i = 0; i < 7; i++) {
        const day = daysOfWeek[i];
        const assignments = [];
        for (let j = 0; j < familyMembers.length; j++) {
            const familyMember = familyMembers[familyIndex];
            const chore = chores[choreIndex];
            assignments.push({ familyMember, chore: chore.name });
            familyIndex = (familyIndex + 1) % familyMembers.length;
            choreIndex = (choreIndex + 1) % chores.length;
        }
        choreSchedule.push({ day, assignments });
    }
    updateScheduleTable();
}
function updateScheduleTable() {
    scheduleTable.innerHTML = '';
    const headerRow = scheduleTable.insertRow();
    headerRow.innerHTML = '<th>Day</th>' + familyMembers.map(member => `<th>${member}</th>`).join('');
    choreSchedule.forEach(daySchedule => {
        const row = scheduleTable.insertRow();
        const dayCell = row.insertCell();
        dayCell.textContent = daySchedule.day;
        familyMembers.forEach(member => {
            const cell = row.insertCell();
            const assignment = daySchedule.assignments.find(a => a.familyMember === member);
            cell.textContent = assignment ? assignment.chore : '';
        });
    });
}
function updateTimerSelects() {
    timerChoreSelect.innerHTML = '';
    timerFamilySelect.innerHTML = '';
    chores.forEach(chore => {
        const option = document.createElement('option');
        option.value = chore.name;
        option.textContent = chore.name;
        timerChoreSelect.appendChild(option);
    });
    familyMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        timerFamilySelect.appendChild(option);
    });
}
function startStopTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerStartStop.textContent = 'Start';
        timerRunning = false;
    } else {
        timerInterval = setInterval(updateTimer, 1000);
        timerStartStop.textContent = 'Stop';
        timerRunning = true;
    }
}
function updateTimer() {
    timerSeconds++;
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}
function padZero(num) {
    return num.toString().padStart(2, '0');
}
function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = 0;
    timerDisplay.textContent = '00:00:00';
    timerStartStop.textContent = 'Start';
    timerRunning = false;
}
familyMembers.forEach(member => familyPoints[member] = 0);
fetchWeather();
setInterval(fetchWeather, 3600000);
updateWheel('chore');
updateWheel('family');
updateLeaderboard();
generateChoreSchedule();
weeklyReset();
updateTimerSelects();
timerStartStop.addEventListener('click', startStopTimer);
timerReset.addEventListener('click', resetTimer);