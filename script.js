const choreWheel = document.getElementById('chore-wheel');
const familyWheel = document.getElementById('family-wheel');
const result = document.getElementById('result');

let chores = ['Dishes', 'Laundry', 'Vacuuming', 'Dusting'];
let familyMembers = ['Mom', 'Dad', 'Sister', 'Brother'];

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
        }
    }, 5000);
}