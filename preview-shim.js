(function () {
  if (window.chrome && window.chrome.storage) return;

  const KEY = "doggoPreviewStorage";

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (err) {
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  const listeners = [];

  function makeArea(areaName) {
    return {
      get(defaults, callback) {
        const stored = readAll()[areaName] || {};
        const out = Object.assign({}, defaults);
        for (const key of Object.keys(defaults || {})) {
          if (key in stored) out[key] = stored[key];
        }
        setTimeout(() => callback(out), 0);
      },
      set(items, callback) {
        const all = readAll();
        const area = Object.assign({}, all[areaName] || {}, items);
        all[areaName] = area;
        writeAll(all);
        const changes = {};
        for (const [key, value] of Object.entries(items)) changes[key] = { newValue: value };
        listeners.forEach((fn) => fn(changes, areaName));
        if (callback) setTimeout(callback, 0);
      },
    };
  }

  window.chrome = window.chrome || {};
  window.chrome.storage = {
    sync: makeArea("sync"),
    local: makeArea("local"),
    onChanged: { addListener: (fn) => listeners.push(fn) },
  };
})();
