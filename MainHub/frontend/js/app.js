// --- Lógica de Drag and Drop HTML5 ---

function allowDrop(ev) {
    ev.preventDefault();
    // Adiciona classe para feedback visual quando o card está sobre a coluna
    const column = ev.currentTarget;
    if (!column.classList.contains('drag-over')) {
        column.classList.add('drag-over');
    }
}

function dragLeave(ev) {
    // Remove o feedback visual quando o card sai da coluna
    ev.currentTarget.classList.remove('drag-over');
}

function drag(ev) {
    // Armazena o ID do elemento sendo arrastado
    ev.dataTransfer.setData("text", ev.target.id);
    // Efeito visual no card que está sendo arrastado
    setTimeout(() => {
        ev.target.classList.add('dragging');
    }, 0);
}

function drop(ev, columnElement) {
    ev.preventDefault();
    columnElement.classList.remove('drag-over');

    // Pega o ID do card arrastado
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);

    if (draggedElement) {
        draggedElement.classList.remove('dragging');

        // Encontra a lista de tarefas dentro da coluna destino
        const taskList = columnElement.querySelector('.task-list');

        // Anexa o card à nova coluna
        taskList.appendChild(draggedElement);

        // Atualiza contadores
        updateCounters();
    }
}

// Remove a classe dragging caso o drag termine fora das áreas de drop
document.addEventListener('dragend', (ev) => {
    if (ev.target.classList.contains('task-card')) {
        ev.target.classList.remove('dragging');
    }
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drag-over');
    });
});

// Função para atualizar os números nos cabeçalhos das colunas
function updateCounters() {
    const colunas = [
        { id: 'col-ideias' },
        { id: 'col-progresso' },
        { id: 'col-conclusao' }
    ];

    const spans = document.querySelectorAll('.kanban-column > div > span');

    colunas.forEach((col, index) => {
        const list = document.getElementById(col.id);
        if (list && spans[index]) {
            const count = list.querySelectorAll('.task-card').length;
            spans[index].textContent = count;
        }
    });
}
