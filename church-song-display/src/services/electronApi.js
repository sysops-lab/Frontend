export const songAPI = {
  list(search = "") {
    return window.churchAPI.songs.list(search);
  },

  get(id) {
    return window.churchAPI.songs.get(id);
  },

  create(song) {
    return window.churchAPI.songs.create(song);
  },

  update(id, song) {
    return window.churchAPI.songs.update(id, song);
  },

  delete(id) {
    return window.churchAPI.songs.delete(id);
  },
};

export const displayAPI = {
  showSlide(slide) {
    return window.churchAPI.display.showSlide(slide);
  },

  clear() {
    return window.churchAPI.display.clear();
  },
};
