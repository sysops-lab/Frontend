const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("churchAPI", {
  songs: {
    list: (search) => ipcRenderer.invoke("songs:list", search),

    get: (id) => ipcRenderer.invoke("songs:get", id),

    create: (song) => ipcRenderer.invoke("songs:create", song),

    update(id, song) {
      return ipcRenderer.invoke("songs:update", id, song);
    },

    delete: (id) => ipcRenderer.invoke("songs:delete", id),
  },

  display: {
    showSlide: (slide) => ipcRenderer.invoke("display:show-slide", slide),

    clear: () => ipcRenderer.invoke("display:clear"),

    onSlide: (callback) => {
      const listener = (_, slide) => callback(slide);

      ipcRenderer.on("display:slide", listener);

      return () => {
        ipcRenderer.removeListener("display:slide", listener);
      };
    },

    onClear: (callback) => {
      const listener = () => callback();

      ipcRenderer.on("display:clear", listener);

      return () => {
        ipcRenderer.removeListener("display:clear", listener);
      };
    },
  },
});
