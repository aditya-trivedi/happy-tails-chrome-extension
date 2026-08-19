(function () {
  if (window.__pawsomeInjected) return;
  window.__pawsomeInjected = true;

  const root = document.createElement("div");
  root.id = "pawsome-root";
  document.documentElement.appendChild(root);

  const species = Math.random() < 0.5 ? "dog" : "cat";
  const pet = window.Pawsome.createPet({ root, species });

  window.addEventListener(
    "mousemove",
    (e) => {
      pet.onPointerMove(e.clientX, e.clientY);
    },
    { passive: true }
  );

  let lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(dy) > 4) pet.onScrollBurst();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => pet.onResize());
})();
