const CONFIG = {
  adminPassword: 'admin123',
  apiUrl: '',
  apiKey: '',
  debug: false
};

const ADMIN_PASSWORD = {
  verify: async function(password) {
    return password === CONFIG.adminPassword;
  }
};