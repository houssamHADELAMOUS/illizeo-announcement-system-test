import api from './api';

const notesService = {
  getAll: () => {
    return api.get('/notes');
  },

  getById: (id) => {
    return api.get(`/notes/${id}`);
  },

  create: (noteData) => {
    return api.post('/notes', noteData);
  },

  update: (id, noteData) => {
    return api.put(`/notes/${id}`, noteData);
  },

  delete: (id) => {
    return api.delete(`/notes/${id}`);
  }
};

export default notesService;
