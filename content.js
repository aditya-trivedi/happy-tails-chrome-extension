(function () {
  if (window.__doggoCompanionInjected) return;
  window.__doggoCompanionInjected = true;

  const root = document.createElement("div");
  root.id = "doggo-companion-root";
  document.documentElement.appendChild(root);

  const dog = window.DoggoDog.createDoggo({ root });

  window.addEventListener(
    "mousemove",
    (e) => {
      dog.onPointerMove(e.clientX, e.clientY);
    },
    { passive: true }
  );

  let lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(dy) > 4) dog.onScrollBurst();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => dog.onResize());
})();
