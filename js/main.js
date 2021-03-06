const listsContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const taskCountElement = document.querySelector('[data-task-count]');
const taskContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const taskRenameContainer = document.querySelector('[data-task-rename-container]')
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')
const deleteTaskButton = document.querySelector('[data-delete-task-button]');

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY) || null;


clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender();
})

taskRenameContainer.addEventListener('click', e=>{
    const container = taskRenameContainer;
    const selectedList = lists.find(list => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(task => task.id === container.id);
    const renameInput = taskRenameContainer.querySelector('input');
    if(e.target.tagName.toLowerCase() === 'button'){
        if (!renameInput.value){
            container.style = "display: none;"
            return; 
        } if(renameInput.value){
            selectedTask.name = renameInput.value;
            container.style = "display: none;"
            renameInput.value = null;
            saveAndRender();
        }
    }
})

listsContainer.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() === 'li'){
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }
});

taskContainer.addEventListener('click', e =>{
    if(e.target.tagName.toLowerCase() === 'input'){
        const selectedList = lists.find(list => list.id === selectedListId);
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
        selectedTask.complete = e.target.checked;
        save();
        renderTaskCount(selectedList);
    }
    if(e.target.tagName.toLowerCase() === 'button'){
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks = selectedList.tasks.filter(task => task.id !== e.target.id);
        saveAndRender();
    }
    if(e.target.tagName.toLowerCase() === 'img'){
        const selectedList = lists.find(list => list.id === selectedListId);
        const editTaskButton = selectedList.tasks.find(task => task.id === e.target.id);
        taskRenameContainer.id = editTaskButton.id;
        taskRenameContainer.style = "display: block;"
    }
})

newListForm.addEventListener('submit', e => {
    e.preventDefault();//prevents reload of page
    const listName = newListInput.value;
    if (listName == null || listName === '') return;
    const list = createList(listName);
    newListInput.value = null;
    lists.push(list);
    saveAndRender();
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();//prevents reload of page
    const taskName = newTaskInput.value;
    if (taskName == null || taskName === '') return;
    const task = createTask(taskName);
    newTaskInput.value = null;
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks.push(task);
    saveAndRender();
})

deleteListButton.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null;
    saveAndRender();
})

function createTask(name){
    return { 
        id: Date.now().toString(), 
        name: name, 
        complete: false 
    };
}

function createList(name){
    return { 
        id: Date.now().toString(), 
        name: name, 
        tasks: [] 
    };
}

function saveAndRender(){
    save();
    render();
}

function save(){
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY,selectedListId);
}

function renderLists(){
    lists.forEach(list => {
        const listElement = document.createElement('li');
        listElement.dataset.listId = list.id;
        listElement.classList.add("list","px-2");
        listElement.innerText = list.name;
        if (list.id === selectedListId) {
            listElement.classList.add('active-list')
        };
        listsContainer.appendChild(listElement);
    })
}

function render() {
    clearElement(listsContainer);   
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId);
    if(!selectedList){
      listDisplayContainer.style.display = 'none';
    }else{
        listDisplayContainer.style.display = '';
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(taskContainer);
        renderTasks(selectedList);
    }
}

function renderTasks(selectedList){
    selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content,true);
    const checkbox = taskElement.querySelector('input');
    const deleteButton = taskElement.querySelector('button');
    const editButton = taskElement.querySelector('img');
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    deleteButton.id = task.id;
    editButton.id = task.id;
    const label = taskElement.querySelector('label');
    label.htmlFor = task.id;
    label.append(task.name);
    taskContainer.appendChild(taskElement)
    })
}

function renderTaskCount(selectedList){
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1? "task" : "tasks";
    taskCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function clearElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
};
saveAndRender();