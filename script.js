const STORAGE_KEY = 'habitTrackerState_v1';

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function defaultState(){
  const initialQuote = document.getElementById('quote-text').textContent.trim();
  return {
    quote: initialQuote,
    habits: [
      { id: uid(), title: 'Exercise', count: 0 },
      { id: uid(), title: 'Learn German', count: 0 },
      { id: uid(), title: 'No Porn', count: 0 },
      { id: uid(), title: 'Make Up Bed', count: 0 },
      { id: uid(), title: 'Sweep Room', count: 0 }
    ],
    todos: [ { id: uid(), text: 'fdsfdsfdsfds', completed: false } ]
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if(!parsed || !Array.isArray(parsed.habits) || !Array.isArray(parsed.todos)) return defaultState();
    return parsed;
  }catch(e){
    console.warn('Failed to load state, using defaults', e);
    return defaultState();
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

const habitGrid = document.getElementById('habit-grid');
const todoWrap = document.getElementById('todo-wrap');

function render(){
  document.getElementById('quote-text').textContent = state.quote;
  renderHabits(state.habits);
  renderTodos(state.todos);
}

function renderHabits(list){
  habitGrid.innerHTML = '';
  list.forEach(h => habitGrid.appendChild(createHabitCard(h)));
}

function createHabitCard(h){
  const tpl = document.getElementById('habit-card-template');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = h.id;
  node.querySelector('[data-field="title"]').textContent = h.title;
  node.querySelector('[data-field="count"]').textContent = h.count;
  return node;
}

function renderTodos(list){
  todoWrap.innerHTML = '';
  list.forEach(t => todoWrap.appendChild(createTodoItem(t)));
}

function createTodoItem(t){
  const tpl = document.getElementById('todo-item-template');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = t.id;
  const label = node.querySelector('[data-field="text"]');
  label.textContent = t.text;
  if(t.completed){
    node.querySelector('input[type="checkbox"]').checked = true;
    label.classList.add('completed');
  }
  return node;
}

habitGrid.addEventListener('click', e => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if(!action) return;
  const card = e.target.closest('.card');
  const id = card.dataset.id;
  const idx = state.habits.findIndex(h => h.id === id);
  if(idx < 0) return;
  const h = state.habits[idx];

  if(action === 'inc'){ h.count += 1; card.querySelector('[data-field="count"]').textContent = h.count; saveState(); }
  if(action === 'dec'){ h.count = Math.max(0, h.count - 1); card.querySelector('[data-field="count"]').textContent = h.count; saveState(); }
  if(action === 'edit-habit'){
    const next = prompt('Rename habit', h.title);
    if(next && next.trim()){ h.title = next.trim(); card.querySelector('[data-field="title"]').textContent = h.title; saveState(); }
  }
  if(action === 'delete-habit'){
    state.habits.splice(idx,1);
    saveState();
    renderHabits(state.habits);
  }
});

document.querySelector('[data-action="add-habit"]').addEventListener('click', () => {
  const name = prompt('Habit name');
  if(!name) return;
  const start = Number(prompt('Starting streak', '0')) || 0;
  state.habits.push({ id: uid(), title: name.trim(), count: Math.max(0, start) });
  saveState();
  renderHabits(state.habits);
});

document.querySelector('[data-action="edit-quote"]').addEventListener('click', () => {
  const next = prompt('Edit quote', state.quote);
  if(next && next.trim()){
    state.quote = next.trim();
    saveState();
    document.getElementById('quote-text').textContent = state.quote;
  }
});

todoWrap.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;
  const item = e.target.closest('.todo-item');
  const id = item.dataset.id;
  const idx = state.todos.findIndex(t => t.id === id);
  if(idx < 0) return;
  const t = state.todos[idx];

  if(action === 'toggle'){
    const cb = item.querySelector('input[type="checkbox"]');
    t.completed = cb.checked;
    item.querySelector('.todo-text').classList.toggle('completed', t.completed);
    saveState();
  }
  if(action === 'edit-todo'){
    const next = prompt('Edit item', t.text);
    if(next && next.trim()){
      t.text = next.trim();
      item.querySelector('.todo-text').textContent = t.text;
      saveState();
    }
  }
  if(action === 'delete-todo'){
    state.todos.splice(idx,1);
    saveState();
    renderTodos(state.todos);
  }
});

document.querySelector('[data-action="add-todo"]').addEventListener('click', () => {
  const text = prompt('ToDo text');
  if(text && text.trim()){
    state.todos.push({ id: uid(), text: text.trim(), completed: false });
    saveState();
    renderTodos(state.todos);
  }
});

render();
