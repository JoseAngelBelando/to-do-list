// El styles lo importamos aquí, ya se carga después al compilar todo
import '../scss/styles.scss';
//1 Carga de módulos y observador de mutaciones

(function () {
  // Función para verificar si el navegador soporta 'modulepreload'
  const supportsModulePreload = () => {
    const linkRelList = document.createElement('link').relList;
    return linkRelList && linkRelList.supports && linkRelList.supports('modulepreload');
  };

  // Función para cargar un módulo a través de una etiqueta 'link'
  const fetchModule = link => {
    // Si el módulo ya fue precargado, salir de la función
    if (link.ep) return;
    // Marcar el módulo como precargado
    link.ep = true;

    // Configurar las opciones de la petición 'fetch'
    const options = {};
    if (link.crossOrigin === 'use-credentials') {
      options.credentials = 'include';
    } else if (link.crossOrigin === 'anonymous') {
      options.credentials = 'omit';
    } else {
      options.credentials = 'same-origin';
    }
    if (link.integrity) options.integrity = link.integrity;
    if (link.referrerPolicy) options.referrerPolicy = link.referrerPolicy;

    // Realizar la petición 'fetch' para precargar el módulo
    fetch(link.href, options);
  };

  // Función para cargar todos los módulos con 'rel="modulepreload"'
  const loadModulePreloads = () => {
    document.querySelectorAll('link[rel="modulepreload"]').forEach(fetchModule);
  };

  // Si el navegador no soporta 'modulepreload', cargar los módulos manualmente
  if (!supportsModulePreload()) {
    loadModulePreloads();

    // Crear un observador para detectar cambios en el DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Si se añade una nueva etiqueta 'link' con 'rel="modulepreload"', cargar el módulo
            if (node.tagName === 'LINK' && node.rel === 'modulepreload') {
              fetchModule(node);
            }
          });
        }
      });
    });

    // Observar el documento para detectar cambios en los hijos y en el subárbol
    observer.observe(document, { childList: true, subtree: true });
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

let tasks = [
  {
    id: Date.now(),
    task: 'Make a todo app',
    completed: false
  }
];
// 3Filtrar y mostrar tareas
// Funciones para filtrar y mostrar las tareas según el filtro activo (todas, activas, completadas).

const getFilteredTasks = () => {
  // Obtener el filtro activo
  const activeFilter = document.querySelector('.filter--active').dataset.filter;

  // Devolver las tareas filtradas según el filtro activo
  if (activeFilter === 'active') {
    return tasks.filter(task => !task.completed);
  } else if (activeFilter === 'completed') {
    return tasks.filter(task => task.completed);
  } else {
    return tasks;
  }
};

const updateItemsLeft = () => {
  // Obtener el número de tareas activas
  const activeTasks = tasks.filter(task => !task.completed).length;

  // Actualizar el texto en 'itemsLeft' basado en el número de tareas
  if (tasks.length === 0) {
    itemsLeft.textContent = 'No tasks';
  } else if (activeTasks === 0) {
    itemsLeft.textContent = 'All tasks completed!';
  } else {
    itemsLeft.textContent = `${activeTasks} items left`;
  }
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
  // Crear un nuevo objeto de tarea
  const newTask = {
    id: Date.now(),
    task: taskText,
    completed: false
  };

  // Añadir la nueva tarea a la lista de tareas
  tasks.push(newTask);

  // Renderizar las tareas actualizadas
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
