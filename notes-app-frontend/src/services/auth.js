import api from './api';

const authService = {
  login: (email, password) => {
    return api.post('/login', {
      email,
      password
    });
  },

  register: (userData) => {
    return api.post('/register', userData);
  },

  logout: () => {
    return api.post('/logout');
  },

  getCurrentUser: () => {
    return api.get('/user');
  }
};

export default authService;
