document.addEventListener('DOMContentLoaded', () => {
    showTasks('all');
    document.getElementById('task-form').addEventListener('submit', addTask);
});

function fetchTasks(callback) {
    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            callback(data);
        });
}

function fetchCompletedTasksForToday(callback) {
    fetch('/tasks/completed/today')
        .then(response => response.json())
        .then(data => {
            callback(data);
        });
}

function fetchPendingTasksForToday(callback) {
    fetch('/tasks/pending/today')
        .then(response => response.json())
        .then(data => {
            callback(data);
        });
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="task-text ${task.status === 'completed' ? 'completed' : ''}">
                ${index + 1}. ${task.task}
            </span>
            <div class="task-actions">
                ${task.status === 'pending' ? `<button class="complete" onclick="completeTask(${task.id})">Complete</button>` : '<button class="completed-status">Completed</button>'}
                <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function renderTableTasks(tasks, tableId) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${task.task}</td>
        `;
        tableBody.appendChild(row);
    });
}

function addTask(event) {
    event.preventDefault();
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value;

    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task })
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            showTasks('all');
            taskInput.value = '';
        }
    });
}

function completeTask(id) {
    fetch(`/tasks/${id}`, {
        method: 'PATCH'
    })
    .then(response => response.json())
    .then(data => {
        if (data.changed) {
            showTasks('all');
        }
    });
}

function deleteTask(id) {
    fetch(`/tasks/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.deleted) {
            showTasks('all');
        }
    });
}

function showTasks(view) {
    const tasksView = document.getElementById('tasks-view');
    const completedView = document.getElementById('completed-view');
    const pendingView = document.getElementById('pending-view');

    tasksView.classList.add('hidden');
    completedView.classList.add('hidden');
    pendingView.classList.add('hidden');

    switch(view) {
        case 'all':
            tasksView.classList.remove('hidden');
            fetchTasks(renderTasks);
            break;
        case 'completed':
            completedView.classList.remove('hidden');
            fetchCompletedTasksForToday(data => renderTableTasks(data, 'completed-tasks'));
            break;
        case 'pending':
            pendingView.classList.remove('hidden');
            fetchPendingTasksForToday(data => renderTableTasks(data, 'pending-tasks'));
            break;
    }
}
