const STORAGE_KEY = 'pets_custom_data';
const ANNOUNCEMENT_KEY = 'pets_announcement';

let allPets = [];
let filteredPets = [];
let currentPetIndex = 0;
let isSortedDesc = true;
let searchQuery = '';
let groupFilter = 'all';
let isAnimating = false;
let adminOriginalPets = [];
let adminEditedPets = [];
let adminFilteredCards = [];
let isAdminLoggedIn = false;

const GROUP_BATTLE_PASS = 'season-battle-pass';
const GROUP_SEASON = '赛季异色';
const GROUP_ADVENTURE = '赛季奇遇异色';
const GROUP_ACTIVITY = '活动异色';
const GROUP_BATTLE_PASS_CN = '赛季战令异色';

async function fetchPets() {
    try {
        const apiData = await API.fetchPets();
        if (apiData) {
            initPets(apiData);
            return;
        }
    } catch (error) {
        if (CONFIG.debug) console.warn('API fetch failed, using local data:', error);
    }
    if (typeof petsData !== 'undefined') {
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
    const customData = localStorage.getItem(STORAGE_KEY);
    if (customData) {
        try {
            const savedData = JSON.parse(customData);
            allPets = applyCustomData(allPets, savedData);
        } catch (e) {
            if (CONFIG.debug) console.error('Failed to load custom data:', e);
        }
    }
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

function applyFiltersAndSort() {
    filteredPets = allPets.filter(pet => {
        const matchesSearch = searchQuery === '' ||
            pet.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || pet.group === groupFilter;
        return matchesSearch && matchesGroup;
    });

    filteredPets.sort((a, b) => isSortedDesc ? b.price - a.price : a.price - b.price);
    renderPetGrid();
    updateResultCount();
}

function renderPetGrid() {
    const container = document.getElementById('content');

    if (filteredPets.length === 0) {
        container.innerHTML = '<div class="no-results">没有找到匹配的精灵</div>';
        return;
    }

    let html = '<div class="pet-grid" id="petGrid">';

    filteredPets.forEach((pet, index) => {
        const imageUrl = pet.image_url || `images/${pet.name}.png`;
        html += `
            <div class="pet-card" onclick="openModal(${index})" style="animation-delay: ${index * 30}ms">
                <div class="pet-image-wrapper">
                    <img class="pet-image" src="${imageUrl}" alt="${pet.name}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 120\'%3E%3Crect fill=\'%23e1f5fe\' width=\'120\' height=\'120\' rx=\'12\'/%3E%3Ctext fill=\'%2300838f\' font-family=\'sans-serif\' font-size=\'12\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E暂无图片%3C/text%3E%3C/svg%3E'" />
                </div>
                <div class="pet-info">
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-price">¥${pet.price}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    const battlePassPets = filteredPets.filter(pet => pet.group === GROUP_BATTLE_PASS);
    if (battlePassPets.length > 0 && groupFilter === 'all') {
        html += renderBattlePassSection(battlePassPets);
    }

    container.innerHTML = html;
}

function renderBattlePassSection(pets) {
    let html = '<div class="battle-pass-wrapper"><div class="battle-pass-section">';
    html += '<div class="battle-pass-header"><div class="battle-pass-icon">⚔️</div><h3>赛季战令异色</h3></div>';
    html += '<div class="battle-pass-grid">';

    pets.forEach((pet, index) => {
        const imageUrl = pet.image_url || `images/${pet.name}.png`;
        html += `
            <div class="battle-pass-card" onclick="openModal(${filteredPets.indexOf(pet)})">
                <img class="battle-pass-image" src="${imageUrl}" alt="${pet.name}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 120\'%3E%3Crect fill=\'%23e1f5fe\' width=\'120\' height=\'120\' rx=\'12\'/%3E%3Ctext fill=\'%2300838f\' font-family=\'sans-serif\' font-size=\'12\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E暂无图片%3C/text%3E%3C/svg%3E'" />
                <div class="battle-pass-name">${pet.name}</div>
                <div class="battle-pass-price">¥${pet.price}</div>
            </div>
        `;
    });

    html += '</div></div></div>';
    return html;
}

function updateResultCount() {
    const countEl = document.getElementById('resultCount');
    if (countEl) {
        countEl.textContent = `共 ${filteredPets.length} 只精灵`;
    }
}

function openModal(index) {
    currentPetIndex = index;
    const modal = document.getElementById('imageModal');
    const pet = filteredPets[index];
    const isBattlePass = pet.group === GROUP_BATTLE_PASS;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const modalContent = document.getElementById('modalContent');
    modalContent.className = 'modal-content' + (isBattlePass ? ' battle-pass' : '');

    const modalLoading = document.getElementById('modalLoading');
    const modalImage = document.getElementById('modalImage');

    modalLoading.classList.add('active');
    modalImage.style.opacity = '0';

    const imageUrl = pet.image_url || `images/${pet.name}.png`;

    const img = new Image();
    img.onload = function() {
        modalImage.src = imageUrl;
        modalImage.style.opacity = '1';
        modalLoading.classList.remove('active');
    };
    img.onerror = function() {
        modalImage.src = imageUrl;
        modalImage.style.opacity = '1';
        modalLoading.classList.remove('active');
    };
    img.src = imageUrl;

    document.getElementById('modalName').textContent = pet.name;
    document.getElementById('modalGroup').textContent = pet.group;
    document.getElementById('modalPrice').textContent = '¥' + pet.price;
    document.getElementById('modalCounter').textContent = `${currentPetIndex + 1} / ${filteredPets.length}`;

    document.getElementById('prevBtn').classList.toggle('disabled', currentPetIndex === 0);
    document.getElementById('nextBtn').classList.toggle('disabled', currentPetIndex === filteredPets.length - 1);

    preloadAdjacentImages();
}

function preloadAdjacentImages() {
    [-1, 1].forEach(dir => {
        const idx = currentPetIndex + dir;
        if (idx >= 0 && idx < filteredPets.length) {
            const pet = filteredPets[idx];
            if (pet.image_url) {
                const img = new Image();
                img.src = pet.image_url;
            }
        }
    });
}

function navigatePet(direction) {
    if (isAnimating) return;
    const newIndex = currentPetIndex + direction;
    if (newIndex < 0 || newIndex >= filteredPets.length) return;

    isAnimating = true;
    const modalContent = document.getElementById('modalContent');

    modalContent.classList.add(direction > 0 ? 'slide-left' : 'slide-right');

    setTimeout(() => {
        currentPetIndex = newIndex;
        openModal(currentPetIndex);
        modalContent.classList.remove('slide-left', 'slide-right');
        modalContent.classList.add('fade-in');

        setTimeout(() => {
            modalContent.classList.remove('fade-in');
            isAnimating = false;
        }, 300);
    }, 200);
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
    document.body.style.overflow = '';
}

function handleSearch(query) {
    searchQuery = query.trim();
    applyFiltersAndSort();
}

function handleFilterChange(value) {
    groupFilter = value;
    applyFiltersAndSort();
}

function handleSort() {
    isSortedDesc = !isSortedDesc;
    const btn = document.getElementById('sortBtn');
    btn.classList.toggle('active', isSortedDesc);
    btn.querySelector('.arrow').textContent = isSortedDesc ? '▼' : '▲';
    applyFiltersAndSort();
}

function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('pet');
    if (petId) {
        const index = filteredPets.findIndex(p => p.id == petId);
        if (index !== -1) {
            setTimeout(() => openModal(index), 500);
        }
    }
}

function loadAnnouncement() {
    const announcement = localStorage.getItem(ANNOUNCEMENT_KEY);
    const bar = document.getElementById('announcementBar');
    const content = document.getElementById('announcementContent');

    if (announcement && announcement.trim()) {
        content.textContent = announcement;
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}

function openAdminLogin() {
    if (ADMIN_PASSWORD.isLockedOut()) {
        ToastNotification.warning('登录尝试次数过多，请稍后再试');
        return;
    }
    document.getElementById('adminLoginModal').classList.add('active');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginError').style.display = 'none';
    document.getElementById('adminLoginError').textContent = '密码错误，请重新输入';
    document.getElementById('adminPassword').focus();
    updateLoginAttemptsDisplay();
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('active');
}

function updateLoginAttemptsDisplay() {
    const attempts = ADMIN_PASSWORD.getAttempts();
    const errorEl = document.getElementById('adminLoginError');
    const lockoutEl = document.getElementById('adminLoginLockout');

    if (lockoutEl) {
        if (ADMIN_PASSWORD.isLockedOut()) {
            lockoutEl.style.display = 'block';
            lockoutEl.textContent = `账户已锁定，请在 ${Math.ceil(ADMIN_PASSWORD.getRemainingLockoutTime() / 1000)} 秒后重试`;
        } else {
            lockoutEl.style.display = 'none';
        }
    }
}

async function verifyAdminPassword() {
    const passwordInput = document.getElementById('adminPassword');
    const errorEl = document.getElementById('adminLoginError');
    const lockoutEl = document.getElementById('adminLoginLockout');
    const password = passwordInput.value;
    const loginBtn = passwordInput.nextElementSibling;

    if (ADMIN_PASSWORD.isLockedOut()) {
        errorEl.textContent = `账户已锁定，请在 ${Math.ceil(ADMIN_PASSWORD.getRemainingLockoutTime() / 1000)} 秒后重试`;
        errorEl.style.display = 'block';
        return;
    }

    passwordInput.disabled = true;
    if (loginBtn) loginBtn.disabled = true;

    try {
        const result = await ADMIN_PASSWORD.verify(password);

        if (result.success) {
            isAdminLoggedIn = true;
            closeAdminLogin();
            openAdminPanel();
            ToastNotification.success('登录成功');
        } else if (result.locked) {
            errorEl.textContent = `密码错误，账户已锁定，请在 ${Math.ceil(result.remainingTime / 1000)} 秒后重试`;
            errorEl.style.display = 'block';
            if (lockoutEl) {
                lockoutEl.style.display = 'block';
                lockoutEl.textContent = `剩余尝试次数：0`;
            }
            startLockoutTimer();
        } else {
            errorEl.textContent = `密码错误，请重新输入（剩余 ${result.remainingAttempts} 次尝试）`;
            errorEl.style.display = 'block';
            passwordInput.value = '';
            updateLoginAttemptsDisplay();
        }
    } finally {
        passwordInput.disabled = false;
        if (loginBtn) loginBtn.disabled = false;
    }
}

function startLockoutTimer() {
    const lockoutEl = document.getElementById('adminLoginLockout');
    if (!lockoutEl) return;

    const updateTimer = () => {
        if (!ADMIN_PASSWORD.isLockedOut()) {
            lockoutEl.style.display = 'none';
            document.getElementById('adminLoginError').style.display = 'none';
            return;
        }
        const remaining = Math.ceil(ADMIN_PASSWORD.getRemainingLockoutTime() / 1000);
        lockoutEl.textContent = `账户已锁定，请在 ${remaining} 秒后重试`;
        setTimeout(updateTimer, 1000);
    };
    updateTimer();
}

function handleAdminKeypress(event) {
    if (event.key === 'Enter') {
        verifyAdminPassword();
    }
}

function openAdminPanel() {
    loadAdminData();
    loadAdminAnnouncement();
    document.getElementById('adminPanel').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
    if (!confirm('确定要关闭管理面板吗？未保存的修改将丢失。')) {
        return;
    }
    document.getElementById('adminPanel').classList.remove('active');
    document.body.style.overflow = '';
    isAdminLoggedIn = false;
}

function loadAdminData() {
    const customData = localStorage.getItem(STORAGE_KEY);
    adminOriginalPets = JSON.parse(JSON.stringify(allPets));

    if (customData) {
        const savedData = JSON.parse(customData);
        adminEditedPets = applyCustomData(allPets, savedData);
    } else {
        adminEditedPets = JSON.parse(JSON.stringify(allPets));
    }

    adminFilteredCards = [...adminEditedPets];
    renderAdminCardList();
    updateAdminStats();
}

function loadAdminAnnouncement() {
    const announcement = localStorage.getItem(ANNOUNCEMENT_KEY);
    document.getElementById('adminAnnouncementInput').value = announcement || '';
}

function renderAdminCardList() {
    const container = document.getElementById('adminCardList');
    let html = '';

    adminFilteredCards.forEach((pet) => {
        const actualIndex = adminEditedPets.indexOf(pet);
        const original = adminOriginalPets[actualIndex];
        const isModified = pet.price !== original.price || pet.image_url !== original.image_url;

        const statusClass = isModified ? 'modified' : '';
        const statusText = isModified ? '已修改' : '';
        const priceFieldClass = pet.price !== original.price ? 'modified' : '';
        const imageFieldClass = pet.image_url !== original.image_url ? 'modified' : '';

        const previewUrl = pet.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"%3E%3Crect fill="%23e1f5fe" width="120" height="120" rx="12"/%3E%3Ctext fill="%2300838f" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E暂无图片%3C/text%3E%3C/svg%3E';

        html += `
            <div class="admin-card-item ${statusClass}">
                ${statusText ? `<span class="admin-card-status ${statusClass}">${statusText}</span>` : ''}
                <div class="admin-card-header">
                    <span class="admin-card-id">#${pet.id}</span>
                    <span class="admin-card-group">${pet.group}</span>
                </div>
                <img class="admin-card-preview" src="${previewUrl}" alt="${pet.name}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 120\'%3E%3Crect fill=\'%23e1f5fe\' width=\'120\' height=\'120\' rx=\'12\'/%3E%3Ctext fill=\'%2300838f\' font-family=\'sans-serif\' font-size=\'14\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E暂无图片%3C/text%3E%3C/svg%3E'" />
                <div class="admin-card-name">${pet.name}</div>
                <div class="admin-field ${priceFieldClass}">
                    <label>💰 价格 (¥)</label>
                    <input type="number" value="${pet.price}" min="0" data-index="${actualIndex}" data-field="price" onchange="handleAdminFieldChange(this)" />
                    <div class="admin-field-error"></div>
                </div>
                <div class="admin-field ${imageFieldClass}">
                    <label>🖼️ 图片链接</label>
                    <input type="text" value="${pet.image_url || ''}" placeholder="输入图片URL" data-index="${actualIndex}" data-field="image_url" onchange="handleAdminFieldChange(this)" />
                    <div class="admin-field-error"></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function handleAdminFieldChange(input) {
    const index = parseInt(input.dataset.index);
    const field = input.dataset.field;
    const value = input.value;
    const fieldContainer = input.parentElement;

    let validation;
    if (field === 'price') {
        validation = Validation.validatePrice(value);
    } else if (field === 'image_url') {
        validation = Validation.validateImageUrl(value);
    }

    if (!validation.valid) {
        fieldContainer.classList.add('has-error');
        fieldContainer.querySelector('.admin-field-error').textContent = validation.message;
        input.setCustomValidity(validation.message);
    } else {
        fieldContainer.classList.remove('has-error');
        fieldContainer.querySelector('.admin-field-error').textContent = '';
        input.setCustomValidity('');
        adminEditedPets[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
        updateAdminStats();
        renderAdminCardList();
    }
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
    document.getElementById('adminTotalCount').textContent = adminEditedPets.length;
    document.getElementById('adminModifiedCount').textContent = getModifiedCount();
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

async function saveAdminChanges() {
    const modifiedPets = [];
    adminEditedPets.forEach((pet, index) => {
        const original = adminOriginalPets[index];
        if (pet.price !== original.price || pet.image_url !== original.image_url) {
            modifiedPets.push({
                id: pet.id,
                price: pet.price,
                image_url: pet.image_url
            });
        }
    });

    if (modifiedPets.length === 0) {
        ToastNotification.warning('没有需要保存的修改');
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(modifiedPets));
        allPets = JSON.parse(JSON.stringify(adminEditedPets));
        adminOriginalPets = JSON.parse(JSON.stringify(adminEditedPets));

        const apiResult = await API.savePets(allPets);
        if (apiResult.success) {
            ToastNotification.success(`已保存 ${modifiedPets.length} 项修改到服务器`);
        } else {
            ToastNotification.success(`已保存 ${modifiedPets.length} 项修改到本地`);
        }

        applyFiltersAndSort();
        renderAdminCardList();
        updateAdminStats();
    } catch (error) {
        ToastNotification.error('保存失败：' + error.message);
    }

    const announcement = document.getElementById('adminAnnouncementInput').value;
    localStorage.setItem(ANNOUNCEMENT_KEY, announcement);
    loadAnnouncement();
}

function resetAdminChanges() {
    if (!confirm('确定要重置所有修改吗？此操作不可撤销。')) {
        return;
    }
    localStorage.removeItem(STORAGE_KEY);
    adminEditedPets = JSON.parse(JSON.stringify(adminOriginalPets));
    adminFilteredCards = [...adminEditedPets];
    renderAdminCardList();
    updateAdminStats();
    ToastNotification.success('已重置所有修改');
}

document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') navigatePet(-1);
    else if (e.key === 'ArrowRight') navigatePet(1);
});

document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.addEventListener('keydown', function(e) {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel.classList.contains('active') && e.key === 'Escape') {
        closeAdminPanel();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    fetchPets();
    loadAnnouncement();
});