document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('deadline-form');
    const list = document.getElementById('deadlines');
    let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    // Render deadlines
    function renderDeadlines() {
        list.innerHTML = '';
        deadlines.forEach((deadline, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${deadline.type}: ${deadline.description} - Due: ${new Date(deadline.date).toLocaleString()}</span>
                <button onclick="removeDeadline(${index})">Remove</button>
            `;
            list.appendChild(li);
        });
    }

    // Add deadline
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        deadlines.push({ type, description, date });
        localStorage.setItem('deadlines', JSON.stringify(deadlines));
        renderDeadlines();
        form.reset();
        scheduleReminder({ type, description, date });
    });

    // Remove deadline
    window.removeDeadline = (index) => {
        deadlines.splice(index, 1);
        localStorage.setItem('deadlines', JSON.stringify(deadlines));
        renderDeadlines();
    };

    // Schedule reminder (client-side, triggers 1 hour before)
    function scheduleReminder(deadline) {
        const dueTime = new Date(deadline.date).getTime();
        const reminderTime = dueTime - (60 * 60 * 1000); // 1 hour before
        const now = Date.now();
        if (reminderTime > now) {
            setTimeout(() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`Reminder: ${deadline.type} - ${deadline.description} is due soon!`);
                }
            }, reminderTime - now);
        }
    }

    // Initial render and schedule existing reminders
    renderDeadlines();
    deadlines.forEach(scheduleReminder);
});