const Todo = function (text, completed) {
  /*
  Optionally I can remove this context variable bound
  to the instance of this object and replace the anonymous
  functions passed to the event listeners with arrowfunctions. In objects, arrow functions uses the context of where the objects method is being called from as opposed to to anonymous functions which always uses the context of the object it is defined in.
  */
  const context = this;
  this.id = +new Date();
  this.completed = completed;
  this.text = text;

  this.node = document.createElement("div");
  this.node.classList.add("todo-item");

  this.checkbox = document.createElement("input");
  this.checkbox.setAttribute("type", "checkbox");
  this.checkbox.classList.add("todo-check");
  this.node.appendChild(this.checkbox);

  this.para = document.createElement("p");
  this.para.classList.add("todo-text");
  this.textNode = document.createTextNode(this.text);
  this.para.appendChild(this.textNode);
  this.node.appendChild(this.para);

  this.editBtn = document.createElement("button");
  this.editBtn.classList.add("edit-btn");
  this.editBtn.appendChild(document.createTextNode("Edit"));
  this.node.appendChild(this.editBtn);
  this.deleteBtn = document.createElement("button");
  this.deleteBtn.classList.add("delete-btn");
  this.deleteBtn.appendChild(document.createTextNode("Delete"));
  this.node.appendChild(this.deleteBtn);
  this.node.setAttribute("data-id", this.id);

  this.__proto__.toggleComplete = function () {
    this.completed = !this.completed;
    this.checkbox.checked = this.completed;
    TodoManager.updateSummary();
    TodoManager.persistTodos();
    console.log("Toggled");
  };

  this.__proto__.updateText = function (newText) {
    this.text = newText;
    this.textNode.nodeValue = this.text;
  };

  this.checkbox.addEventListener("change", function () {
    context.toggleComplete();
  });

  this.deleteBtn.addEventListener("click", function () {
    const id = this.parentNode.dataset.id;
    console.log(id);
    TodoManager.removeTodo(id);
  });

  this.editBtn.addEventListener("click", function () {
    TodoManager.editTodo(context.id, context.text);
  });

  this.checkbox.checked = this.completed;
};

const list = document.getElementById("todo-list");
const summary = document.getElementById("summary");
const editModal = document.getElementById("edit-modal");
const todosEmpty = document.getElementById("todos-empty");
const updateTodoBtn = document.getElementById("update-todo-btn");
const updateInput = document.getElementById("edit-todo-input");

const TodoManager = function (todoListNode, summaryEl, modal, emptyEl, updateInputEl) {

  let todoList = [];
  const TODOS_LOCAL_STORAGE_KEY = "todos";
  const initLocalStorageData = localStorage.getItem(TODOS_LOCAL_STORAGE_KEY);
  if (localStorage.getItem(TODOS_LOCAL_STORAGE_KEY)) {
    const initLocalStorageDataArray = JSON.parse(initLocalStorageData);
    initLocalStorageDataArray.forEach(t => {
      todoList.push(new Todo(t.text, t.completed));
    });
  }

  let currentEditId = null;

  const addTodo = function (todo) {
    todoList.unshift(todo);
    const li = document.createElement("li");
    li.appendChild(todo.node);
    li.classList.add("item");
    todoListNode.insertBefore(li, todoListNode.firstChild);
    updateSummary();
    persistTodos();
  };

  const updateUIWithTodos = function () {
    console.log(todoList);
    for (todo of todoList) {
      const li = document.createElement("li");
      li.appendChild(todo.node);
      li.classList.add("item");
      todoListNode.appendChild(li);
    }
    updateSummary();
  };

  const removeTodo = function (id) {
    const index = todoList.findIndex(t => t.id == id);
    const removedTodos = todoList.splice(index, 1);
    removedTodos[0].node.parentNode.classList.add("remove-item");
    setTimeout(function () {
      removedTodos[0].node.parentNode.remove();
    }, 250);
    updateSummary();
    persistTodos();
  };

  const todoCount = function () {
    return todoList.length;
  };

  const completedCount = function () {
    const completedTodoList = todoList.filter(t => t.completed);
    return completedTodoList.length;
  };

  // Unrevealed
  const updateSummary = function () {
    const children = summaryEl.children;
    children[0].innerHTML = `${todoList.length} todo(s)`;
    const completedTodos = todoList.filter(t => t.completed);
    children[1].innerHTML = `${completedTodos.length} completed`;
    if (todoList.length < 1) {
      emptyEl.style.display = "block";
    } else {
      emptyEl.style.display = "none";
    }

    if (todoList > 0) {
      todosEmpty.style.display = "block";
    }
    console.log(children);
  };

  const clearAll = function () {
    todoList = [];
    while (todoListNode.firstChild) {
      todoListNode.firstChild.remove();
    }
    updateUIWithTodos();
    persistTodos();
    console.log("todos", todoList);
  };

  const updateTodo = function (newText) {
    const todoIndex = todoList.findIndex(t => t.id == currentEditId);
    todoList[todoIndex].updateText(newText);
    closeModal();
    persistTodos();
  };

  const editTodo = function (id, text) {
    modal.style.visibility = "visible";
    currentEditId = id;
    updateInputEl.value = text;
  };

  const persistTodos = async function () {
    const serializedTodos = JSON.stringify(todoList);
    localStorage.setItem(TODOS_LOCAL_STORAGE_KEY, serializedTodos);
    console.log("Persisted");
  };

  return {
    addTodo,
    removeTodo,
    todoCount,
    completedCount,
    clearAll,
    updateTodo,
    updateSummary,
    editTodo,
    updateUIWithTodos,
    persistTodos
  };
}(list, summary, editModal, todosEmpty, updateInput);

const closeModal = function () {
  editModal.style.visibility = "hidden";
};

const inputField = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const clearAllBtn = document.getElementById("clr-all");
const closeModalBtn = document.getElementById("close-modal");

inputField.addEventListener('keyup', function (e) {
  // checking for enter key
  if (e.keyCode == 13) {
    if (inputField.value.trim()) {
      TodoManager.addTodo(new Todo(inputField.value, false));
      inputField.value = "";
    }
  }
});

updateTodoBtn.addEventListener("click", function () {
  TodoManager.updateTodo(updateInput.value);
});

closeModalBtn.addEventListener("click", closeModal);

clearAllBtn.addEventListener("click", function () {
  TodoManager.clearAll();
});

addBtn.addEventListener("click", function (e) {
  if (inputField.value.trim()) {
    TodoManager.addTodo(new Todo(inputField.value, false));
    inputField.value = "";
  } else {
    alert("Invalid todo");
  }
});

TodoManager.updateUIWithTodos();