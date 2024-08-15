const choreWheel = document.getElementById('chore-wheel');
const familyWheel = document.getElementById('family-wheel');
const result = document.getElementById('result');
const trackerContent = document.getElementById('tracker-content');

let chores = ['Dishes', 'Laundry', 'Vacuuming', 'Dusting'];
let familyMembers = ['Mom', 'Dad', 'Sister', 'Brother'];
let assignments = {};

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
        element.textContent = item;
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
            result.textContent = `Selected chore: ${selectedItem}`;
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
            chores.push(newItem);
        } else {
            familyMembers.push(newItem);
        }
        updateWheel(wheelType);
        input.value = '';
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
        weeklyReset();
    }, timeUntilReset);
}

updateWheel('chore');
updateWheel('family');
weeklyReset();