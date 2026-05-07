const CONFIG = {
    adminPassword: '123456',
    apiUrl: '',
    apiKey: '',
    debug: false,
    maxLoginAttempts: 3,
    lockoutDuration: 30000
};

let loginAttempts = 0;
let lockoutEndTime = null;

const ADMIN_PASSWORD = {
    verify: async function(password) {
        if (this.isLockedOut()) {
            return { success: false, locked: true, remainingTime: this.getRemainingLockoutTime() };
        }
        const isValid = password === CONFIG.adminPassword;
        if (isValid) {
            this.resetAttempts();
            return { success: true };
        } else {
            loginAttempts++;
            if (loginAttempts >= CONFIG.maxLoginAttempts) {
                lockoutEndTime = Date.now() + CONFIG.lockoutDuration;
                return {
                    success: false,
                    attempts: loginAttempts,
                    locked: true,
                    remainingTime: CONFIG.lockoutDuration
                };
            }
            return {
                success: false,
                attempts: loginAttempts,
                remainingAttempts: CONFIG.maxLoginAttempts - loginAttempts
            };
        }
    },

    isLockedOut: function() {
        if (!lockoutEndTime) return false;
        if (Date.now() > lockoutEndTime) {
            this.resetAttempts();
            return false;
        }
        return true;
    },

    getRemainingLockoutTime: function() {
        if (!lockoutEndTime) return 0;
        return Math.max(0, lockoutEndTime - Date.now());
    },

    resetAttempts: function() {
        loginAttempts = 0;
        lockoutEndTime = null;
    },

    getAttempts: function() {
        return { current: loginAttempts, max: CONFIG.maxLoginAttempts };
    }
};

const ToastNotification = {
    show: function(message, type = 'success', duration = 3000) {
        let toast = document.getElementById('toastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = `toast-notification ${type}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    success: function(message) {
        this.show(message, 'success');
    },

    error: function(message) {
        this.show(message, 'error');
    },

    warning: function(message) {
        this.show(message, 'warning');
    }
};

const Validation = {
    validatePrice: function(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return { valid: false, message: '价格必须是数字' };
        if (num < 0) return { valid: false, message: '价格不能为负数' };
        if (num > 999999) return { valid: false, message: '价格超出范围' };
        return { valid: true };
    },

    validateImageUrl: function(url) {
        if (!url || url.trim() === '') return { valid: true };
        const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i;
        if (!urlPattern.test(url)) {
            return { valid: false, message: '图片链接格式不正确' };
        }
        return { valid: true };
    },

    validateName: function(name) {
        if (!name || name.trim() === '') {
            return { valid: false, message: '名称不能为空' };
        }
        if (name.length > 50) {
            return { valid: false, message: '名称过长' };
        }
        return { valid: true };
    }
};

const API = {
    async savePets(pets) {
        if (CONFIG.apiUrl) {
            try {
                const response = await fetch(CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': CONFIG.apiKey ? `Bearer ${CONFIG.apiKey}` : ''
                    },
                    body: JSON.stringify({ pets })
                });
                if (!response.ok) throw new Error('API request failed');
                return { success: true };
            } catch (error) {
                if (CONFIG.debug) console.error('API save error:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'API not configured' };
    },

    async fetchPets() {
        if (CONFIG.apiUrl) {
            try {
                const response = await fetch(CONFIG.apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': CONFIG.apiKey ? `Bearer ${CONFIG.apiKey}` : ''
                    }
                });
                if (!response.ok) throw new Error('API request failed');
                return await response.json();
            } catch (error) {
                if (CONFIG.debug) console.error('API fetch error:', error);
                return null;
            }
        }
        return null;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ADMIN_PASSWORD, ToastNotification, Validation, API };
}