let allPets = [];
let filteredPets = [];
let currentPetIndex = 0;
let isSortedDesc = true;
let searchQuery = '';
let groupFilter = 'all';
let isAnimating = false;

const GROUP_BATTLE_PASS = 'season-battle-pass';
const GROUP_SEASON = '赛季异色';
const GROUP_ADVENTURE = '赛季奇遇异色';
const GROUP_ACTIVITY = '活动异色';
const GROUP_BATTLE_PASS_CN = '赛季战令异色';

async function initApp() {
  await fetchPets();
  setupEventListeners();
}

async function fetchPets() {
  try {
    const response = await fetch('http://localhost:3000/api/pets');
    if (!response.ok) throw new Error('Network response was not ok');
    const pets = await response.json();
    initPets(pets);
  } catch (error) {
    console.warn('Backend service unavailable, using local data:', error);
    initPets(petsData);
  }
}

function initPets(pets) {
  allPets = pets;
  loadCustomData();
  applyFiltersAndSort();
  parseURLParams();
}

function loadCustomData() {
  const customData = localStorage.getItem('pets_custom_data');
  if (customData) {
    try {
      const savedData = JSON.parse(customData);
      savedData.forEach(item => {
        const pet = allPets.find(p => p.id === item.id);
        if (pet) {
          Object.assign(pet, item);
        }
      });
    } catch (e) {
      console.error('Failed to load custom data:', e);
    }
  }
}

function applyFiltersAndSort() {
  filteredPets = allPets.filter(pet => {
    const matchesSearch = searchQuery === '' || pet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilter === 'all' || pet.group === groupFilter;
    return matchesSearch && matchesGroup;
  });
  
  filteredPets.sort((a, b) => isSortedDesc ? b.price - a.price : a.price - b.price);
  renderPetCards();
}

function renderPetCards() {
  const cardGrid = document.getElementById('cardGrid');
  if (!cardGrid) return;
  
  if (filteredPets.length === 0) {
    cardGrid.innerHTML = '<div class="no-results">🐾 没有找到匹配的宠物</div>';
    return;
  }
  
  let html = '';
  filteredPets.forEach((pet, index) => {
    const delay = (index % 4) * 0.1;
    const imageUrl = pet.image_url || `images/${encodeURIComponent(pet.name)}.png`;
    
    html += `
      <div class="pet-card" style="animation-delay: ${delay}s" onclick="showPetDetail(${pet.id})">
        <div class="pet-image-wrapper">
          <img class="pet-image" src="${imageUrl}" alt="${pet.name}" 
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 120\'%3E%3Crect fill=\'%23e1f5fe\' width=\'120\' height=\'120\' rx=\'12\'/%3E%3Ctext fill=\'%2300838f\' font-family=\'sans-serif\' font-size=\'14\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E${encodeURIComponent(pet.name)}%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="pet-info">
          <div class="pet-name">${pet.name}</div>
          <div class="pet-group">${getGroupDisplayName(pet.group)}</div>
          <div class="pet-price">¥${pet.price}</div>
        </div>
      </div>
    `;
  });
  
  cardGrid.innerHTML = html;
}

function getGroupDisplayName(group) {
  const groupNames = {
    'season-battle-pass': '赛季战令',
    '赛季异色': '赛季异色',
    '赛季奇遇异色': '赛季奇遇',
    '活动异色': '活动异色'
  };
  return groupNames[group] || group;
}

function handleSearch() {
  searchQuery = document.getElementById('searchInput').value.trim();
  applyFiltersAndSort();
  updateURLParams();
}

function handleGroupFilter(group) {
  groupFilter = group;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  applyFiltersAndSort();
  updateURLParams();
}

function toggleSort() {
  isSortedDesc = !isSortedDesc;
  applyFiltersAndSort();
}

function updateURLParams() {
  const params = new URLSearchParams();
  if (searchQuery) params.set('search', searchQuery);
  if (groupFilter !== 'all') params.set('group', groupFilter);
  history.pushState({}, '', '?' + params.toString());
}

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  const group = params.get('group');
  
  if (search) {
    searchQuery = search;
    document.getElementById('searchInput').value = search;
  }
  if (group) {
    groupFilter = group;
    const btn = document.querySelector(`.nav-btn[data-group="${group}"]`);
    if (btn) btn.classList.add('active');
  }
}

function showPetDetail(petId) {
  const pet = allPets.find(p => p.id === petId);
  if (!pet) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h2>${pet.name}</h2>
      <img src="${pet.image_url || `images/${encodeURIComponent(pet.name)}.png`}" alt="${pet.name}" style="width: 100%; border-radius: 12px; margin: 16px 0;" />
      <p><strong>分类：</strong>${getGroupDisplayName(pet.group)}</p>
      <p><strong>价格：</strong>¥${pet.price}</p>
    </div>
  `;
  document.body.appendChild(modal);
}

function setupEventListeners() {
  document.getElementById('searchInput')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal-overlay.active');
      modals.forEach(m => m.remove());
    }
  });
}

document.addEventListener('DOMContentLoaded', initApp);