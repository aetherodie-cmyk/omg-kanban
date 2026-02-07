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

    // Update data
    let cardData = data[fromColumnId].find(card => "card-" + card.id === cardId);
    if (cardData) {
        data[fromColumnId] = data[fromColumnId].filter(card => "card-" + card.id !== cardId);
        data[toColumnId].push(cardData);
        saveData();
    }
}

function addCard(columnId) {
    const title = prompt("請輸入卡片標題：");
    if (!title) return;

    const description = prompt("請輸入卡片描述：");
    const tags = prompt("請輸入標籤（用逗號分隔）：");

    const newCard = {
        id: Date.now(),
        title,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    data[columnId].push(newCard);
    saveData();
    renderBoard();
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
        const column = document.getElementById(columnId);
        const cardsContainer = column.querySelector('.cards');
        cardsContainer.innerHTML = '';
        data[columnId].forEach(card => {
            const cardElement = renderCard(card);
            cardsContainer.appendChild(cardElement);
        });
    }
}

function saveData() {
    localStorage.setItem('kanbanData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('kanbanData');
    if (savedData) {
        data = JSON.parse(savedData);
    } else {
        // Sample data for first-time users
        data = {
            todo: [
                { id: 1, title: '設定專案 repository', description: '在 GitHub 上建立新的 repo', tags: ['開發'] },
                { id: 2, title: '設計資料庫 schema', description: '規劃訂單和使用者資料表', tags: ['設計'] }
            ],
            inprogress: [
                { id: 3, title: '開發使用者認證功能', description: '實作登入和註冊頁面', tags: ['開發'] }
            ],
            done: [
                { id: 4, title: '完成專案提案', description: '與 stakeholders 確認需求', tags: ['討論'] }
            ],
            ideas: [
                { id: 5, title: '整合第三方支付', description: '研究 Stripe 或 Braintree', tags: ['研究'] }
            ]
        };
    }
    renderBoard();
}

loadData();
