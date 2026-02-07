const DATA_URL = 'https://raw.githubusercontent.com/aetherodie-cmyk/omg-kanban/main/data.json';

let data = {
    todo: [],
    inprogress: [],
    done: [],
    ideas: []
};

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("from", ev.target.parentNode.parentNode.id);
}

function drop(ev) {
    ev.preventDefault();
    var cardId = ev.dataTransfer.getData("text");
    var fromColumnId = ev.dataTransfer.getData("from");
    var toColumnId = ev.currentTarget.id;

    let cardElement = document.getElementById(cardId);
    let cardsContainer = ev.currentTarget.querySelector('.cards');
    cardsContainer.appendChild(cardElement);

    // Update local data (won't persist without backend)
    let cardData = data[fromColumnId].find(card => "card-" + card.id === cardId);
    if (cardData) {
        data[fromColumnId] = data[fromColumnId].filter(card => "card-" + card.id !== cardId);
        data[toColumnId].push(cardData);
    }
}

function renderCard(card) {
    const cardElement = document.createElement('div');
    cardElement.id = "card-" + card.id;
    cardElement.className = 'card';
    cardElement.draggable = true;
    cardElement.ondragstart = drag;

    const titleElement = document.createElement('h3');
    titleElement.textContent = card.title;
    cardElement.appendChild(titleElement);

    if (card.description) {
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = card.description;
        cardElement.appendChild(descriptionElement);
    }

    if (card.tags && card.tags.length > 0) {
        const tagsElement = document.createElement('div');
        tagsElement.className = 'tags';
        card.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsElement.appendChild(tagElement);
        });
        cardElement.appendChild(tagsElement);
    }

    return cardElement;
}

function renderBoard() {
    for (const columnId in data) {
        if (columnId === 'lastUpdated') continue;
        const column = document.getElementById(columnId);
        if (!column) continue;
        const cardsContainer = column.querySelector('.cards');
        cardsContainer.innerHTML = '';
        data[columnId].forEach(card => {
            const cardElement = renderCard(card);
            cardsContainer.appendChild(cardElement);
        });
    }
    
    // Show last updated time
    if (data.lastUpdated) {
        const footer = document.getElementById('last-updated');
        if (footer) {
            const date = new Date(data.lastUpdated);
            footer.textContent = '最後更新: ' + date.toLocaleString('zh-TW');
        }
    }
}

async function loadData() {
    try {
        // Add cache buster to get fresh data
        const response = await fetch(DATA_URL + '?t=' + Date.now());
        if (response.ok) {
            data = await response.json();
            renderBoard();
            console.log('Data loaded from GitHub');
        } else {
            console.error('Failed to load data, using defaults');
            renderBoard();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Use empty defaults on error
        renderBoard();
    }
}

// Load data on page load
loadData();

// Auto-refresh every 30 seconds
setInterval(loadData, 30000);
