// El styles lo importamos aquí, ya se carga después al compilar todo
import '../scss/styles.scss';
//1 Carga de módulos y observador de mutaciones

(function () {
  const supportsModulePreload = () => {
    const linkRelList = document.createElement('link').relList;
    return linkRelList && linkRelList.supports && linkRelList.supports('modulepreload');
  };

  const fetchModule = link => {
    if (link.ep) return;
    link.ep = true;
    const options = {
      credentials:
        link.crossOrigin === 'use-credentials' ? 'include' : link.crossOrigin === 'anonymous' ? 'omit' : 'same-origin'
    };
    if (link.integrity) options.integrity = link.integrity;
    if (link.referrerPolicy) options.referrerPolicy = link.referrerPolicy;
    fetch(link.href, options);
  };

  const loadModulePreloads = () => {
    document.querySelectorAll('link[rel="modulepreload"]').forEach(fetchModule);
  };

  if (!supportsModulePreload()) {
    loadModulePreloads();
    new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'LINK' && node.rel === 'modulepreload') {
              fetchModule(node);
            }
          });
        }
      }
    }).observe(document, { childList: true, subtree: true });
  }
})();

// 2 Declaraciones iniciales
// Aquí se declaran las referencias a los elementos del DOM y la lista de tareas.
const tasksContainer = document.getElementById('tasks');
const filtersContainer = document.getElementById('filters');
const form = document.getElementById('form');
const itemsLeft = document.getElementById('items-left');
const deleteCompletedBtn = document.getElementById('delete-completed');
const filterButtons = document.querySelectorAll('.filter');

let tasks = [{ id: Date.now(), task: 'Make a todo app', completed: false }];

// 3Filtrar y mostrar tareas
// Funciones para filtrar y mostrar las tareas según el filtro activo (todas, activas, completadas).

const getFilteredTasks = () => {
  const activeFilter = document.querySelector('.filter--active').dataset.filter;
  return activeFilter === 'active'
    ? tasks.filter(task => !task.completed)
    : activeFilter === 'completed'
    ? tasks.filter(task => task.completed)
    : tasks;
};

const updateItemsLeft = () => {
  const activeTasks = tasks.filter(task => !task.completed).length;
  itemsLeft.textContent =
    tasks.length === 0 ? 'No tasks' : activeTasks === 0 ? 'All tasks completed!' : `${activeTasks} items left`;
};
const renderTasks = () => {
  const fragment = document.createDocumentFragment();
  getFilteredTasks().forEach(task => {
    const taskContainer = document.createElement('div');
    taskContainer.classList.add('task-container');

    const checkbox = document.createElement('input');
    checkbox.classList.add('task-check');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.id = task.id;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const label = document.createElement('label');
    label.classList.add('task-text');
    label.textContent = task.task;
    label.htmlFor = task.id;

    const deleteIcon = document.createElement('img');
    deleteIcon.classList.add('task-delete');
    deleteIcon.src = './assets/images/icon-cross.svg';
    deleteIcon.addEventListener('click', () => deleteTask(task.id));

    taskContainer.append(checkbox, label, deleteIcon);
    fragment.append(taskContainer);
  });

  tasksContainer.textContent = '';
  tasksContainer.append(fragment);
  updateItemsLeft();
};

renderTasks();

// 4Añadir, eliminar y completar tareas
// Funciones para añadir, eliminar y completar tareas, además de gestionar los filtros.
const addTask = taskText => {
  tasks.push({ id: Date.now(), task: taskText, completed: false });
  renderTasks();
};

const deleteTask = taskId => {
  tasks = tasks.filter(task => task.id !== taskId);
  renderTasks();
};

const toggleTaskCompletion = taskId => {
  tasks = tasks.map(task => {
    if (task.id === taskId) task.completed = !task.completed;
    return task;
  });
  renderTasks();
};

const applyFilter = filterElement => {
  filterButtons.forEach(button => button.classList.remove('filter--active'));
  filterElement.classList.add('filter--active');
  renderTasks();
};

const clearCompletedTasks = () => {
  tasks = tasks.filter(task => !task.completed);
  renderTasks();
};
// 5Event Listeners
// Configuración de los event listeners para manejar las interacciones del usuario.
form.addEventListener('submit', event => {
  event.preventDefault();
  const taskText = event.target.task.value.trim();
  if (taskText) {
    addTask(taskText);
    event.target.reset();
  }
});

deleteCompletedBtn.addEventListener('click', clearCompletedTasks);

filtersContainer.addEventListener('click', event => {
  if (event.target.dataset.filter) applyFilter(event.target);
});
