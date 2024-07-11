// El styles lo importamos aquí, ya se carga después al compilar todo
import '../scss/styles.scss';

import iconCross from '../assets/images/icon-cross.svg';

const tasksElement = document.getElementById('tasks');
const filtersElement = document.getElementById('filters');
const formElement = document.getElementById('form');
const itemsLeftElement = document.getElementById('items-left');
const deleteCompleteElement = document.getElementById('delete-completed');
const switchElement = document.getElementById('switch');
const allFilters = document.querySelectorAll('.filter');

let allTasks = [
  {
    id: Date.now(),
    task: 'Comprar el pan',
    completed: false
  }
];

const countItemsLeft = () => {
  if (allTasks.length === 0) {
    itemsLeftElement.textContent = 'No tasks';
    return;
  }

  const itemsLeft = allTasks.filter(task => !task.completed).length;
  if (itemsLeft === 0) {
    itemsLeftElement.textContent = 'All tasks completed!';
  } else {
    itemsLeftElement.textContent = `${itemsLeft} items left`;
  }
};

const insertTasks = (tasksToRender = allTasks) => {
  const fragment = document.createDocumentFragment();

  tasksToRender.forEach(task => {
    const newTaskContainer = document.createElement('div');
    newTaskContainer.classList.add('task-container');

    const newTaskCheck = document.createElement('input');
    newTaskCheck.classList.add('task-check');
    newTaskCheck.type = 'checkbox';
    newTaskCheck.checked = task.completed;
    newTaskCheck.id = task.id;

    const newTaskText = document.createElement('label');
    newTaskText.classList.add('task-text');
    newTaskText.textContent = task.task;
    newTaskText.htmlFor = task.id;

    const newTaskDelete = document.createElement('img');
    newTaskDelete.classList.add('task-delete');
    newTaskDelete.src = iconCross;

    newTaskDelete.addEventListener('click', () => deleteTask(task.id));
    newTaskCheck.addEventListener('change', () => completeTask(task.id));

    newTaskContainer.append(newTaskCheck, newTaskText, newTaskDelete);

    fragment.append(newTaskContainer);
  });

  tasksElement.textContent = '';
  tasksElement.append(fragment);
  countItemsLeft();
};

const saveTask = task => {
  allTasks.push(task);
  insertTasks();
};

const createTask = task => {
  const newTask = {
    id: Date.now(),
    task: task,
    completed: false
  };

  saveTask(newTask);
};

const deleteTask = id => {
  allTasks = allTasks.filter(task => task.id !== id);
  insertTasks();
};

const completeTask = id => {
  allTasks = allTasks.map(task => {
    if (task.id === id) {
      task.completed = !task.completed;
    }
    return task;
  });

  insertTasks();
};

const deleteAllCompletedTasks = () => {
  allTasks = allTasks.filter(task => !task.completed);
  insertTasks();
};

const getFilteredTasks = filter => {
  let filteredTasks = allTasks;
  if (filter === 'active') {
    filteredTasks = allTasks.filter(task => !task.completed);
  } else if (filter === 'completed') {
    filteredTasks = allTasks.filter(task => task.completed);
  }

  return filteredTasks;
};

const filterTasks = event => {
  if (!event.target.dataset.filter) return;
  allFilters.forEach(filter => filter.classList.remove('filter--active'));
  event.target.classList.add('filter--active');
  const filteredTasks = getFilteredTasks(event.target.dataset.filter);
  insertTasks(filteredTasks);
};

insertTasks();

formElement.addEventListener('submit', event => {
  event.preventDefault();
  const inputValue = event.target.task.value;
  if (!inputValue) return;
  createTask(inputValue);
  event.target.reset();
});

deleteCompleteElement.addEventListener('click', deleteAllCompletedTasks);

filtersElement.addEventListener('click', filterTasks);
