// ===== STATE =====
let todos = [];
let currentFilter = 'all';
let currentSort = 'date';
let searchQuery = '';
let selectedCategory = 'work';
let selectedPriority = 'medium';

// ===== DOM ELEMENTS =====
const todoInput = document.getElementById('todoInput');
const addButton = document.getElementById('addButton');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const filterButtons = document.querySelectorAll('.filter-button');
const categoryButtons = document.querySelectorAll('.category-btn');
const priorityButtons = document.querySelectorAll('.priority-btn');

// ===== INITIALIZATION =====
function init() {
    loadTodos();
    loadTheme();
    renderTodos();
    updateTaskCount();
    setupEventListeners();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Add todo
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTodos();
    });
    
    // Sort
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTodos();
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderTodos();
        });
    });
    
    // Category selection
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedCategory = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Priority selection
    priorityButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedPriority = button.dataset.priority;
            priorityButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// ===== LOCAL STORAGE =====
function loadTodos() {
    const savedTodos = localStorage.getItem('enhancedTodos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

function saveTodos() {
    localStorage.setItem('enhancedTodos', JSON.stringify(todos));
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ===== TODO OPERATIONS =====
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        category: selectedCategory,
        priority: selectedPriority,
        createdAt: Date.now()
    };
    
    todos.unshift(newTodo);
    saveTodos();
    todoInput.value = '';
    renderTodos();
    updateTaskCount();
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateTaskCount();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

// ===== FILTERING & SORTING =====
function getFilteredTodos() {
    let filtered = [...todos];
    
    // Apply status filter
    switch (currentFilter) {
        case 'active':
            filtered = filtered.filter(todo => !todo.completed);
            break;
        case 'completed':
            filtered = filtered.filter(todo => todo.completed);
            break;
    }
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(todo =>
            todo.text.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'name':
            filtered.sort((a, b) => a.text.localeCompare(b.text));
            break;
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'status':
            filtered.sort((a, b) => {
                if (a.completed === b.completed) return 0;
                return a.completed ? 1 : -1;
            });
            break;
        case 'date':
        default:
            filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return filtered;
}

// ===== UI UPDATES =====
function updateTaskCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.add('visible');
        
        const emptyMessages = {
            'completed': 'No completed tasks yet',
            'active': 'No active tasks',
            'all': searchQuery ? 'No tasks found' : 'Your peaceful space awaits...'
        };
        emptyState.querySelector('p').textContent = emptyMessages[currentFilter];
        return;
    }
    
    emptyState.classList.remove('visible');
    
    todoList.innerHTML = filteredTodos.map((todo, index) => `
        <div class="todo-item" style="animation-delay: ${index * 0.05}s">
            <div class="todo-item-content">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo.id}')">
                    <svg class="check-icon icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                
                <div class="todo-main">
                    <div class="todo-text ${todo.completed ? 'completed' : ''}">
                        ${escapeHtml(todo.text)}
                    </div>
                    
                    <div class="todo-meta">
                        ${renderPriorityBadge(todo.priority)}
                        ${renderCategoryBadge(todo.category)}
                    </div>
                </div>
                
                <button class="delete-button" onclick="deleteTodo('${todo.id}')">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderPriorityBadge(priority) {
    const icons = {
        high: '<path d="M12 5v14"></path><path d="m5 12 7-7 7 7"></path>',
        medium: '<path d="M5 12h14"></path>',
        low: '<path d="M12 19V5"></path><path d="m5 12 7 7 7-7"></path>'
    };
    
    return `
        <span class="priority-badge ${priority}">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${icons[priority]}
            </svg>
            ${priority}
        </span>
    `;
}

function renderCategoryBadge(category) {
    const labels = {
        work: 'Work',
        personal: 'Personal',
        health: 'Health',
        other: 'Other'
    };
    
    return `<span class="category-badge ${category}">${labels[category]}</span>`;
}

// ===== UTILITIES =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INITIALIZE APP =====
init();
