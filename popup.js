(function () {
  const STORAGE_KEY = "pawsomeSettings";
  const DEFAULT_SETTINGS = { version: 1, species: "dog", breed: "classic" };
  const pawsome = window.Pawsome;

  function normalizeSettings(raw) {
    const source = raw && typeof raw === "object" ? raw : DEFAULT_SETTINGS;
    return {
      version: 1,
      species: "dog",
      breed: pawsome.normalizeBreed(source.breed),
    };
  }

  const classicArt = document.getElementById("classic-art");
  const goldenArt = document.getElementById("golden-art");
  const dachshundArt = document.getElementById("dachshund-art");
  const huskyArt = document.getElementById("husky-art");
  const labradorArt = document.getElementById("labrador-art");
  const shepherdArt = document.getElementById("shepherd-art");

  classicArt.innerHTML = pawsome.DOG_SVG;
  goldenArt.innerHTML = pawsome.GOLDEN_SVG;
  dachshundArt.innerHTML = pawsome.DACHSHUND_SVG;
  huskyArt.innerHTML = pawsome.HUSKY_SVG;
  labradorArt.innerHTML = pawsome.LABRADOR_SVG;
  shepherdArt.innerHTML = pawsome.SHEPHERD_SVG;

  const breedButtons = Array.from(document.querySelectorAll("[data-breed]"));

  let current = DEFAULT_SETTINGS;

  function render(settings) {
    current = normalizeSettings(settings);

    for (const btn of breedButtons) {
      const on = btn.dataset.breed === current.breed;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    }
  }

  function save(patch) {
    const settings = normalizeSettings(Object.assign({}, current, patch));
    render(settings);
    try {
      chrome.storage.sync.set({ [STORAGE_KEY]: settings });
    } catch (err) {
      /* storage unavailable */
    }
  }

  try {
    chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_SETTINGS }, (result) => {
      render(normalizeSettings(result[STORAGE_KEY]));
    });
  } catch (err) {
    render(DEFAULT_SETTINGS);
  }

  for (const btn of breedButtons) {
    btn.addEventListener("click", () => save({ breed: btn.dataset.breed }));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const ids = breedButtons.map((b) => b.dataset.breed);
      const cols = 3;
      const i = ids.indexOf(current.breed);
      let next = i;
      if (e.key === "ArrowRight") next = (i + 1) % ids.length;
      else if (e.key === "ArrowLeft") next = (i - 1 + ids.length) % ids.length;
      else if (e.key === "ArrowDown") next = (i + cols) % ids.length;
      else if (e.key === "ArrowUp") next = (i - cols + ids.length) % ids.length;
      save({ breed: ids[next] });
      document.querySelector(`[data-breed="${ids[next]}"]`).focus();
    });
  }
})();
