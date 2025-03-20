document.addEventListener('DOMContentLoaded', function() {
  // Función para obtener tareas del API
  async function fetchTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    return tasks;
  }

  // Función para crear un elemento de tarea con botones de acción
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task';
    li.dataset.id = task._id;

    // Contenedor para el contenido de la tarea
    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    // Mostrar título
    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;
    contentDiv.appendChild(titleSpan);

    // Mostrar descripción (si existe)
    if (task.description) {
      const descP = document.createElement('p');
      descP.className = 'task-desc';
      descP.textContent = task.description;
      contentDiv.appendChild(descP);
    }

    li.appendChild(contentDiv);

    // Contenedor para botones de acción
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    // Botón para editar la tarea
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => enableEditMode(li, task));
    actionsDiv.appendChild(editBtn);

    // Botones para cambiar estado según el estado actual
    if (task.status === 'todo') {
      const toProgressBtn = document.createElement('button');
      toProgressBtn.textContent = 'Mover a En Progreso';
      toProgressBtn.className = 'change-status-btn';
      toProgressBtn.addEventListener('click', async () => {
        await updateTaskStatus(task._id, 'in-progress');
      });
      actionsDiv.appendChild(toProgressBtn);
    } else if (task.status === 'in-progress') {
      const toTodoBtn = document.createElement('button');
      toTodoBtn.textContent = 'Mover a Por Hacer';
      toTodoBtn.className = 'change-status-btn';
      toTodoBtn.addEventListener('click', async () => {
        await updateTaskStatus(task._id, 'todo');
      });
      actionsDiv.appendChild(toTodoBtn);
      
      const toDoneBtn = document.createElement('button');
      toDoneBtn.textContent = 'Mover a Hecho';
      toDoneBtn.className = 'change-status-btn';
      toDoneBtn.addEventListener('click', async () => {
        await updateTaskStatus(task._id, 'done');
      });
      actionsDiv.appendChild(toDoneBtn);
    } else if (task.status === 'done') {
      const toProgressBtn = document.createElement('button');
      toProgressBtn.textContent = 'Mover a En Progreso';
      toProgressBtn.className = 'change-status-btn';
      toProgressBtn.addEventListener('click', async () => {
        await updateTaskStatus(task._id, 'in-progress');
      });
      actionsDiv.appendChild(toProgressBtn);
    }

    // Botón para eliminar la tarea
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', async () => {
      if (confirm('¿Deseas eliminar esta tarea?')) {
        await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
        loadTasks();
      }
    });
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(actionsDiv);
    return li;
  }

  // Función para actualizar el estado de una tarea mediante la API
  async function updateTaskStatus(taskId, newStatus) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      loadTasks();
    } else {
      alert('Error al actualizar el estado de la tarea.');
    }
  }

  // Función para renderizar las tareas en las columnas correspondientes
  function renderTasks(tasks) {
    const todoList = document.getElementById('todo-tasks');
    const inProgressList = document.getElementById('in-progress-tasks');
    const doneList = document.getElementById('done-tasks');

    // Limpiar listas
    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';

    tasks.forEach(task => {
      const li = createTaskElement(task);
      if(task.status === 'todo') {
        todoList.appendChild(li);
      } else if(task.status === 'in-progress') {
        inProgressList.appendChild(li);
      } else if(task.status === 'done') {
        doneList.appendChild(li);
      }
    });
  }

  // Función para cargar y renderizar tareas
  async function loadTasks() {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    renderTasks(tasks);
  }

  // Manejar el formulario para agregar una nueva tarea
  document.getElementById('add-task-btn').addEventListener('click', async function() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    if (!title) {
      return alert('Por favor, ingresa un título para la tarea.');
    }
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    if(res.ok) {
      document.getElementById('task-title').value = '';
      document.getElementById('task-desc').value = '';
      loadTasks();
    }
  });

  // Función para habilitar el modo de edición en una tarea
  function enableEditMode(li, task) {
    li.innerHTML = ''; // Limpiar el contenido actual
  
    // Input para editar el título
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.className = 'edit-title';
  
    // Área de texto para editar la descripción
    const descInput = document.createElement('textarea');
    descInput.value = task.description || '';
    descInput.className = 'edit-desc';
  
    // Botón para guardar cambios
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar';
    saveBtn.className = 'save-btn';
    saveBtn.addEventListener('click', async () => {
      const updatedTitle = titleInput.value;
      const updatedDesc = descInput.value;
      // Actualizar la tarea mediante la API (se conserva el estado actual)
      await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updatedTitle, description: updatedDesc, status: task.status })
      });
      loadTasks();
    });
  
    // Botón para cancelar la edición
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.addEventListener('click', loadTasks);
  
    li.appendChild(titleInput);
    li.appendChild(descInput);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);
  }
  
  // Cargar tareas al inicio
  loadTasks();
});
