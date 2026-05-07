let adminOriginalPets = [];
let adminEditedPets = [];
let adminFilteredCards = [];
let isAdminLoggedIn = false;

const STORAGE_KEY = 'pets_custom_data';

function openAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  const error = document.getElementById('adminLoginError');
  
  if (modal) {
    modal.classList.add('active');
    document.getElementById('adminPassword').value = '';
    error.style.display = 'none';
    document.getElementById('adminPassword').focus();
  }
}

function closeAdminLogin() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function handleAdminKeypress(event) {
  if (event.key === 'Enter') {
    verifyAdminPassword();
  }
}

async function verifyAdminPassword() {
  const passwordInput = document.getElementById('adminPassword');
  const errorElement = document.getElementById('adminLoginError');
  const password = passwordInput.value;
  
  const isValid = await ADMIN_PASSWORD.verify(password);
  
  if (isValid) {
    isAdminLoggedIn = true;
    closeAdminLogin();
    openAdminPanel();
  } else {
    errorElement.textContent = '密码输入错误，请重新输入';
    errorElement.classList.add('show');
    passwordInput.value = '';
    passwordInput.focus();
    
    setTimeout(() => {
      errorElement.classList.remove('show');
    }, 3000);
  }
}

function openAdminPanel() {
  loadAdminData();
  const panel = document.getElementById('adminPanel');
  if (panel) {
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAdminPanel() {
  if (!confirm('确定要关闭管理面板吗？未保存的修改将丢失。')) {
    return;
  }
  
  const panel = document.getElementById('adminPanel');
  if (panel) {
    panel.classList.remove('active');
    document.body.style.overflow = '';
  }
  isAdminLoggedIn = false;
}

function loadAdminData() {
  const customData = localStorage.getItem(STORAGE_KEY);
  adminOriginalPets = JSON.parse(JSON.stringify(window.allPets || []));
  
  if (customData) {
    const savedData = JSON.parse(customData);
    adminEditedPets = applyCustomData(window.allPets || [], savedData);
  } else {
    adminEditedPets = JSON.parse(JSON.stringify(window.allPets || []));
  }
  
  adminFilteredCards = [...adminEditedPets];
  renderAdminCardList();
  updateAdminStats();
}

function applyCustomData(basePets, customData) {
  const merged = [...basePets];
  if (customData && Array.isArray(customData)) {
    customData.forEach(item => {
      const index = merged.findIndex(p => p.id === item.id);
      if (index !== -1) {
        merged[index] = { ...merged[index], ...item };
      }
    });
  }
  return merged;
}

function getModifiedCount() {
  let count = 0;
  adminEditedPets.forEach((pet, index) => {
    const original = adminOriginalPets[index];
    if (pet.price !== original.price || pet.image_url !== original.image_url) {
      count++;
    }
  });
  return count;
}

function updateAdminStats() {
  const totalCount = document.getElementById('adminTotalCount');
  const modifiedCount = document.getElementById('adminModifiedCount');
  
  if (totalCount) totalCount.textContent = adminEditedPets.length;
  if (modifiedCount) modifiedCount.textContent = getModifiedCount();
}

function filterAdminCards(query) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    adminFilteredCards = [...adminEditedPets];
  } else {
    adminFilteredCards = adminEditedPets.filter(pet =>
      pet.name.toLowerCase().includes(lowerQuery)
    );
  }
  renderAdminCardList();
}

function renderAdminCardList() {
  const container = document.getElementById('adminCardList');
  if (!container) return;
  
  let html = '';
  
  adminFilteredCards.forEach((pet, displayIndex) => {
    const actualIndex = adminEditedPets.indexOf(pet);
    const original = adminOriginalPets[actualIndex];
    const isModified = pet.price !== original.price || pet.image_url !== original.image_url;
    
    const statusClass = isModified ? 'modified' : '';
    const statusText = isModified ? '已修改' : '';
    const priceFieldClass = pet.price !== original.price ? 'modified' : '';
    const imageFieldClass = pet.image_url !== original.image_url ? 'modified' : '';
    
    const previewUrl = pet.image_url || `images/${encodeURIComponent(pet.name)}.png`;
    
    html += `
      <div class="admin-card-item ${statusClass}">
        ${statusText ? `<span class="admin-card-status ${statusClass}">${statusText}</span>` : ''}
        <div class="admin-card-header">
          <span class="admin-card-id">#${pet.id}</span>
          <span class="admin-card-group">${getGroupDisplayName(pet.group)}</span>
        </div>
        <img class="admin-card-preview" src="${previewUrl}" alt="${pet.name}" 
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 120\'%3E%3Crect fill=\'%23e1f5fe\' width=\'120\' height=\'120\' rx=\'12\'/%3E%3Ctext fill=\'%2300838f\' font-family=\'sans-serif\' font-size=\'14\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E暂无图片%3C/text%3E%3C/svg%3E'" />
        <div class="admin-card-name">${pet.name}</div>
        <div class="admin-field ${priceFieldClass}">
          <label>💰 价格 (¥)</label>
          <input type="number" value="${pet.price}" min="0" data-index="${actualIndex}" data-field="price" onchange="handleAdminFieldChange(this)" />
        </div>
        <div class="admin-field ${imageFieldClass}">
          <label>🖼️ 图片链接</label>
          <input type="text" value="${pet.image_url || ''}" placeholder="输入图片URL" data-index="${actualIndex}" data-field="image_url" onchange="handleAdminFieldChange(this)" />
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function handleAdminFieldChange(input) {
  const index = parseInt(input.dataset.index);
  const field = input.dataset.field;
  
  if (!isNaN(index) && adminEditedPets[index]) {
    if (field === 'price') {
      adminEditedPets[index].price = parseInt(input.value) || 0;
    } else if (field === 'image_url') {
      adminEditedPets[index].image_url = input.value.trim() || null;
    }
    
    const pet = adminEditedPets[index];
    const original = adminOriginalPets[index];
    const isModified = pet.price !== original.price || pet.image_url !== original.image_url;
    
    input.parentElement.classList.toggle('modified', isModified);
    input.parentElement.parentElement.classList.toggle('modified', isModified);
    
    updateAdminStats();
  }
}

async function saveAdminChanges() {
  const modifiedPets = adminEditedPets.filter((pet, index) => {
    const original = adminOriginalPets[index];
    return pet.price !== original.price || pet.image_url !== original.image_url;
  });
  
  if (modifiedPets.length === 0) {
    showSaveStatus('没有需要保存的修改', 'success');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/pets', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modifiedPets)
    });
    
    if (response.ok) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modifiedPets));
      adminOriginalPets = JSON.parse(JSON.stringify(adminEditedPets));
      updateAdminStats();
      renderAdminCardList();
      showSaveStatus('保存成功！', 'success');
    } else {
      throw new Error('保存失败');
    }
  } catch (error) {
    console.error('Save failed:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modifiedPets));
    adminOriginalPets = JSON.parse(JSON.stringify(adminEditedPets));
    updateAdminStats();
    renderAdminCardList();
    showSaveStatus('已保存到本地（服务器不可用）', 'success');
  }
}

function cancelAdminChanges() {
  if (!confirm('确定要取消所有修改吗？')) {
    return;
  }
  
  adminEditedPets = JSON.parse(JSON.stringify(adminOriginalPets));
  adminFilteredCards = [...adminEditedPets];
  renderAdminCardList();
  updateAdminStats();
}

function showSaveStatus(message, type) {
  const status = document.getElementById('saveStatus');
  if (!status) return;
  
  status.textContent = message;
  status.className = `save-status ${type} show`;
  
  setTimeout(() => {
    status.classList.remove('show');
  }, 3000);
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

document.addEventListener('keydown', function(e) {
  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel && adminPanel.classList.contains('active') && e.key === 'Escape') {
    closeAdminPanel();
  }
});