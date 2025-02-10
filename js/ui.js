// ui.js

// ------------------------------
// Import/Export Functions
// ------------------------------
function exportConfig() {
  const config = {
    totalCards: document.getElementById('total-cards').value,
    drawSize: document.getElementById('draw-size').value,
    cardGroups: [],
    searchers: []
  };

  // Get card groups.
  const cardGroupsContainer = document.getElementById('card-groups-container');
  const groups = cardGroupsContainer.querySelectorAll('.card-group');
  groups.forEach(group => {
    const groupConfig = {
      engine: group.querySelector('.group-engine').value,
      desired: group.querySelector('.group-desired').value,
      operator: group.querySelector('.group-operator').value,
      unique: group.querySelector('.group-unique').checked,
      disabled: group.querySelector('.group-disable') ? group.querySelector('.group-disable').checked : false,
      cards: []
    };
    const cardRows = group.querySelectorAll('.card-row');
    cardRows.forEach(row => {
      groupConfig.cards.push({
        name: row.querySelector('.card-name').value,
        amount: row.querySelector('.card-amount').value
      });
    });
    config.cardGroups.push(groupConfig);
  });

  // Get searchers.
  const searchersContainer = document.getElementById('searchers-container');
  const searcherSlots = searchersContainer.querySelectorAll('.searcher-slot');
  searcherSlots.forEach(slot => {
    config.searchers.push({
      name: slot.querySelector('.searcher-name').value,
      engine: slot.querySelector('.searcher-engine').value,
      amount: slot.querySelector('.searcher-amount').value,
      disabled: slot.querySelector('.searcher-disable').checked
    });
  });

  const dataStr = JSON.stringify(config, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "config.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig(config) {
  document.getElementById('total-cards').value = config.totalCards;
  document.getElementById('draw-size').value = config.drawSize;

  document.getElementById('card-groups-container').innerHTML = "";
  document.getElementById('searchers-container').innerHTML = "";

  config.cardGroups.forEach(groupConfig => {
    loadCardGroup(groupConfig);
  });

  config.searchers.forEach(searcherConfig => {
    loadSearcher(searcherConfig);
  });

  updateTotalRegistered();
}

function loadCardGroup(groupConfig) {
  addCardGroup();
  const container = document.getElementById('card-groups-container');
  const group = container.lastElementChild;
  group.querySelector('.group-engine').value = groupConfig.engine;
  group.querySelector('.group-desired').value = groupConfig.desired;
  group.querySelector('.group-operator').value = groupConfig.operator;
  group.querySelector('.group-unique').checked = groupConfig.unique;
  if (group.querySelector('.group-disable')) {
    group.querySelector('.group-disable').checked = groupConfig.disabled;
    if (groupConfig.disabled) group.classList.add('disabled');
  }
  const rowsContainer = group.querySelector('.card-rows');
  rowsContainer.innerHTML = "";
  groupConfig.cards.forEach(cardConfig => {
    addCardRow(rowsContainer, cardConfig.name, cardConfig.amount);
  });
  updateGroupTotal(group);
}

function loadSearcher(searcherConfig) {
  addSearcherSlot(searcherConfig.name, searcherConfig.engine, searcherConfig.amount);
  const container = document.getElementById('searchers-container');
  const slot = container.lastElementChild;
  slot.querySelector('.searcher-disable').checked = searcherConfig.disabled;
  if (searcherConfig.disabled) slot.classList.add('disabled');
  updateTotalRegistered();
}

// ------------------------------
// Existing UI Functions
// ------------------------------
function updateTotalRegistered() {
  let total = 0;
  const searcherSlots = document.querySelectorAll('.searcher-slot');
  searcherSlots.forEach(slot => {
    const disableCheckbox = slot.querySelector('.searcher-disable');
    if (disableCheckbox && disableCheckbox.checked) return;
    const amount = parseInt(slot.querySelector('.searcher-amount').value, 10);
    if (!isNaN(amount)) total += amount;
  });
  const cardGroups = document.querySelectorAll('.card-group');
  cardGroups.forEach(group => {
    const disableGroup = group.querySelector('.group-disable');
    if (disableGroup && disableGroup.checked) return;
    const rows = group.querySelectorAll('.card-row');
    rows.forEach(row => {
      const amount = parseInt(row.querySelector('.card-amount').value, 10);
      if (!isNaN(amount)) total += amount;
    });
  });
  document.getElementById('total-registered').innerText = "Total Registered Cards: " + total;
}

document.getElementById('dark-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

function addSearcherSlot(name = '', engine = '', amount = 1) {
  const container = document.getElementById('searchers-container');
  const slot = document.createElement('div');
  slot.className = 'slot searcher-slot';
  slot.innerHTML = `
    <div class="searcher-header">
      <span class="remove-searcher" title="Delete Searcher">×</span>
    </div>
    <div class="searcher-body">
      <div class="searcher-row">
        <div class="field half">
          <label>Name:</label>
          <input type="text" class="searcher-name" value="${name}">
        </div>
        <div class="field half">
          <label>Engine:</label>
          <input type="text" class="searcher-engine" value="${engine}">
        </div>
      </div>
      <div class="searcher-row">
        <div class="field small">
            <label>Amount:</label>
            <input type="number" class="searcher-amount" value="${amount}" min="0">
        </div>
        <div class="field max">
          <label>
            <input type="checkbox" class="searcher-disable">
            <span class="disable-text">Disable Searcher</span>
          </label>
          <span class="tooltip">
            <i class="info-icon">?</i>
            <span class="tooltiptext">When checked, this searcher is ignored.</span>
          </span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(slot);
  slot.querySelector('.remove-searcher').addEventListener('click', () => {
    slot.remove();
    updateTotalRegistered();
  });
  const disableCheckbox = slot.querySelector('.searcher-disable');
  disableCheckbox.addEventListener('change', function() {
    if (this.checked) {
      slot.classList.add('disabled');
    } else {
      slot.classList.remove('disabled');
    }
    updateTotalRegistered();
  });
  slot.querySelector('.searcher-amount').addEventListener('input', updateTotalRegistered);
  slot.querySelector('.searcher-name').addEventListener('input', updateTotalRegistered);
  slot.querySelector('.searcher-engine').addEventListener('input', updateTotalRegistered);
  updateTotalRegistered();
}

function addCardGroup() {
  const container = document.getElementById('card-groups-container');
  const group = document.createElement('div');
  group.className = 'card-group';
  group.innerHTML = `
    <div class="card-group-top">
      <div class="delete-group" title="Delete Group">×</div>
    </div>
    <div class="card-group-engine">
      <label>Group Engine (optional):</label>
      <input type="text" class="group-engine" value="">
    </div>
    <div class="card-group-settings">
      <div class="group-settings-left">
        <div class="group-settings-option">
          <label>Desired Amount:</label>
          <input type="number" class="group-desired" value="1" min="0">
        </div>
        <div class="group-settings-option">
          <label>Operator:</label>
          <select class="group-operator">
            <option value="exactly">Exactly</option>
            <option value="more or equal" selected>More or Equal</option>
            <option value="less or equal">Less or Equal</option>
          </select>
        </div>
      </div>
      <div class="group-total-container">
        <span class="group-total-label">Total Cards:</span>
        <span class="group-total">0</span>
      </div>
    </div>
    <div class="card-rows"></div>
    <button type="button" class="add-card-btn">Add Card</button>
    <div class="card-group-footer">
      <div class="unique-container">
        <label><input type="checkbox" class="group-unique"> No Repeated Copies Allowed</label>
        <span class="tooltip">
          <i class="info-icon">?</i>
          <span class="tooltiptext">When enabled, only distinct card names count; duplicates are ignored.</span>
        </span>
      </div>
      <div>
        <label class="disable-group-footer">
          <input type="checkbox" class="group-disable">
          Disable Group
        </label>
        <span class="tooltip">
          <i class="info-icon">?</i>
          <span class="tooltiptext">When checked, this group is ignored.</span>
        </span>
      </div>
    </div>
  `;
  container.appendChild(group);
  
  const rowsContainer = group.querySelector('.card-rows');
  addCardRow(rowsContainer);
  
  const delGroupBtn = group.querySelector('.delete-group');
  delGroupBtn.addEventListener('click', () => {
    group.remove();
    updateGroupDeleteButtons();
    updateTotalRegistered();
  });
  group.querySelector('.add-card-btn').addEventListener('click', () => {
    addCardRow(group.querySelector('.card-rows'));
    updateCardRowDeleteButtons(group);
    updateGroupTotal(group);
    updateTotalRegistered();
  });
  group.querySelector('.group-disable').addEventListener('change', function() {
    if (this.checked) {
      group.classList.add('disabled');
    } else {
      group.classList.remove('disabled');
    }
    updateTotalRegistered();
  });
  group.querySelector('.group-desired').addEventListener('input', () => {
    updateGroupTotal(group);
    updateTotalRegistered();
  });
  group.querySelector('.group-engine').addEventListener('input', updateTotalRegistered);
  group.querySelector('.group-operator').addEventListener('input', updateTotalRegistered);
  updateGroupDeleteButtons();
  updateCardRowDeleteButtons(group);
  updateGroupTotal(group);
  updateTotalRegistered();
}

function addCardRow(container, name = '', amount = 1) {
  const row = document.createElement('div');
  row.className = 'card-row';
  row.innerHTML = `
    <div class="card-row-top">
      <label>Card Name:</label>
      <input type="text" class="card-name" value="${name}">
    </div>
    <div class="card-row-bottom">
      <div>
        <label>Amount:</label>
        <input type="number" class="card-amount" value="${amount}" min="0">
      </div>
      <span class="delete-card" title="Delete Card">×</span>
    </div>
  `;
  container.appendChild(row);
  row.querySelector('.delete-card').addEventListener('click', () => {
    if (container.children.length > 1) {
      row.remove();
      updateCardRowDeleteButtons(container.parentElement);
      updateGroupTotal(container.parentElement);
      updateTotalRegistered();
    }
  });
  row.querySelector('.card-amount').addEventListener('input', () => {
    updateGroupTotal(container.parentElement);
    updateTotalRegistered();
  });
  row.querySelector('.card-name').addEventListener('input', updateTotalRegistered);
  updateCardRowDeleteButtons(container.parentElement);
}

function updateGroupDeleteButtons() {
  const groups = document.querySelectorAll('.card-group');
  if (groups.length <= 1) {
    groups.forEach(g => {
      const delBtn = g.querySelector('.delete-group');
      if (delBtn) { delBtn.style.display = 'none'; }
    });
  } else {
    groups.forEach(g => {
      const delBtn = g.querySelector('.delete-group');
      if (delBtn) { delBtn.style.display = 'block'; }
    });
  }
}

function updateCardRowDeleteButtons(groupElement) {
  const rows = groupElement.querySelectorAll('.card-row');
  if (rows.length <= 1) {
    rows.forEach(r => {
      const delBtn = r.querySelector('.delete-card');
      if (delBtn) { delBtn.style.display = 'none'; }
    });
  } else {
    rows.forEach(r => {
      const delBtn = r.querySelector('.delete-card');
      if (delBtn) { delBtn.style.display = 'inline-flex'; }
    });
  }
}

function updateGroupTotal(groupElement) {
  let sum = 0;
  const rows = groupElement.querySelectorAll('.card-row');
  rows.forEach(row => {
    const amount = parseInt(row.querySelector('.card-amount').value, 10);
    if (!isNaN(amount)) sum += amount;
  });
  const totalSpan = groupElement.querySelector('.group-total');
  if (totalSpan) {
    totalSpan.innerText = sum;
  }
}

document.getElementById('export-button').addEventListener('click', exportConfig);
document.getElementById('import-button').addEventListener('click', () => {
  document.getElementById('import-file').click();
});
document.getElementById('import-file').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const config = JSON.parse(e.target.result);
      importConfig(config);
    } catch(err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

document.addEventListener('DOMContentLoaded', function() {
  // Do not auto-add a searcher slot.
  addCardGroup();
  
  document.getElementById('add-searcher').addEventListener('click', () => {
    addSearcherSlot();
  });
  
  document.getElementById('add-card-group').addEventListener('click', () => {
    addCardGroup();
  });
  
  document.getElementById('calculate-button').addEventListener('click', () => {
    document.getElementById('error').innerText = '';
    document.getElementById('result').innerText = '';
    document.getElementById('samples').innerHTML = '';
    
    const totalCards = parseInt(document.getElementById('total-cards').value, 10);
    const drawSize = parseInt(document.getElementById('draw-size').value, 10);
    if (isNaN(totalCards) || isNaN(drawSize) || totalCards <= 0 || drawSize <= 0) {
      document.getElementById('error').innerText = 'Invalid deck or draw size.';
      return;
    }
    if (drawSize > totalCards) {
      document.getElementById('error').innerText = 'Draw size cannot be greater than total deck size.';
      return;
    }
    
    const deck = [];
    
    const searcherSlots = document.querySelectorAll('.searcher-slot');
    searcherSlots.forEach(slot => {
      const disableFlag = slot.querySelector('.searcher-disable');
      if (disableFlag && disableFlag.checked) return;
      const name = slot.querySelector('.searcher-name').value.trim();
      const engine = slot.querySelector('.searcher-engine').value.trim();
      const amount = parseInt(slot.querySelector('.searcher-amount').value, 10);
      if (name && !isNaN(amount) && amount > 0) {
        deck.push({
          name: name,
          engine: engine,
          count: amount,
          isSearcher: true,
          searchForEngines: engine
        });
      }
    });
    
    const successConditions = [];
    const cardGroups = document.querySelectorAll('.card-group');
    cardGroups.forEach((group, idx) => {
      const disableGroup = group.querySelector('.group-disable');
      if (disableGroup && disableGroup.checked) return;
      const groupEngineRaw = group.querySelector('.group-engine').value.trim();
      const groupEngines = groupEngineRaw ? groupEngineRaw.split(',').map(s => s.trim()).filter(s => s) : [];
      const desired = parseInt(group.querySelector('.group-desired').value, 10);
      const operator = group.querySelector('.group-operator').value;
      const unique = group.querySelector('.group-unique').checked;
      if (isNaN(desired)) return;
      successConditions.push({
        engines: groupEngines,
        desiredAmount: desired,
        operator: operator,
        searcherLimit: 1,
        unique: unique
      });
      
      const cardRows = group.querySelectorAll('.card-row');
      cardRows.forEach(row => {
        const cardName = row.querySelector('.card-name').value.trim();
        const amount = parseInt(row.querySelector('.card-amount').value, 10);
        if (cardName && !isNaN(amount) && amount > 0) {
          deck.push({
            name: cardName,
            engine: groupEngineRaw,
            count: amount,
            isSearcher: false,
            conditionIndex: successConditions.length - 1
          });
        }
      });
    });
    
    let deckSum = deck.reduce((acc, card) => acc + card.count, 0);
    if (deckSum > totalCards) {
      document.getElementById('error').innerText = 'The sum of configured cards exceeds the total cards in deck.';
      return;
    }
    if (deckSum < totalCards) {
      deck.push({
        name: 'Blank',
        engine: '',
        count: totalCards - deckSum,
        isSearcher: false
      });
    }
    
    const config = {
      deck: deck,
      handSize: drawSize,
      successConditions: successConditions
    };
    
    const resultObj = calculateOdds(config);
    const probabilityPct = (resultObj.probability * 100).toFixed(2);
    document.getElementById('result').innerText = 'Odds: ' + probabilityPct + '%';
    
    if (resultObj.sampleDraws && resultObj.sampleDraws.length > 0) {
      let samples = resultObj.sampleDraws.slice();
      shuffle(samples);
      samples = samples.slice(0, 5);
      const samplesDiv = document.getElementById('samples');
      samplesDiv.innerHTML = `
        <div class="samples-header">
          <span class="samples-title">Draw examples</span>
          <span class="tooltip">
            <i class="info-icon">?</i>
            <span class="tooltiptext">These are a few sample successful hands drawn from your deck.</span>
          </span>
        </div>
        <hr class="samples-separator">
      `;
      samples.forEach(sample => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'sample-draw';
        sample.forEach((cardName, index) => {
          const cardDiv = document.createElement('div');
          cardDiv.className = 'sample-card';
          cardDiv.innerText = cardName;
          if (cardName === 'Blank') {
            cardDiv.style.backgroundColor = 'white';
            cardDiv.style.color = 'black';
          } else {
            cardDiv.style.backgroundColor = getColor(cardName);
            cardDiv.style.border = '1px solid #333';
            cardDiv.style.color = '#333';
          }
          rowDiv.appendChild(cardDiv);
          if (index < sample.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'sample-separator';
            sep.innerText = " - ";
            rowDiv.appendChild(sep);
          }
        });
        samplesDiv.appendChild(rowDiv);
      });
      samplesDiv.style.display = 'block';
    } else {
      document.getElementById('samples').style.display = 'none';
    }
  });
});

