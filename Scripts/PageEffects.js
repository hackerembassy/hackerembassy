import AchievementsDOM from "./AchievementsDOM.js";

// Unix commands taken literally, triggered by the console through "page-effect" events
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const random = (min, max) => min + Math.random() * (max - min);

export default class PageEffects {
  zoom = 1;

  zoomBy(factor) {
    // Rounded so that less + more lands exactly back on 1
    this.zoom = Math.round(Math.min(3, Math.max(0.2, this.zoom * factor)) * 100) / 100;
    // Only the console text scales, so the console still covers the site behind it
    const console = document.getElementById("console");
    console.style.fontSize = "";
    const baseSize = parseFloat(getComputedStyle(console).fontSize);
    console.style.fontSize = this.zoom === 1 ? "" : `${baseSize * this.zoom}px`;
  }

  // Everything floats away weightless and never comes back. The input line stays so the console still works
  async free() {
    const elements = [...document.querySelectorAll("#console > p, nav li, #topbar > a, #topbuttons img")].filter(
      (element) => element.style.visibility !== "hidden"
    );

    await Promise.all(
      elements.map(async (element) => {
        await element.animate(
          [
            { transform: "none", opacity: 1 },
            {
              transform: `translate(${random(-300, 300)}px, ${random(-600, -200)}px) rotate(${random(-180, 180)}deg)`,
              opacity: 0,
            },
          ],
          { duration: random(2500, 4500), easing: "ease-in", fill: "forwards" }
        ).finished;
        element.style.visibility = "hidden";
      })
    );
  }

  async sleep(seconds) {
    const overlay = document.createElement("div");
    overlay.classList.add("effect-sleep");
    overlay.innerHTML = "<span>Z</span><span>z</span><span>z</span>";
    document.body.appendChild(overlay);

    await sleep(seconds * 1000);
    overlay.remove();
  }

  man() {
    const walker = document.createElement("div");
    walker.classList.add("effect-man");
    walker.textContent = "🚶";
    document.body.appendChild(walker);
    walker.addEventListener("animationend", () => walker.remove());
  }

  // Every click removes whatever was clicked (except the console itself) until Esc
  kill() {
    if (document.documentElement.classList.contains("effect-kill")) return;
    document.documentElement.classList.add("effect-kill");

    const cleanup = () => {
      document.documentElement.classList.remove("effect-kill");
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    };

    const onKey = (event) => {
      if (event.key === "Escape") cleanup();
    };

    const onClick = (event) => {
      const target = event.target;
      const isProtected =
        target === document.body ||
        target === document.documentElement ||
        target.id === "console" ||
        target.closest("#console-input-container");

      if (isProtected) return;

      event.preventDefault();
      event.stopPropagation();

      if (AchievementsDOM.earnAchievment("kill"))
        AchievementsDOM.triggerAchievmentPopup(
          AchievementsDOM.AllAchievements["kill"],
          AchievementsDOM.DefaultShortAchievementDelay
        );

      target
        .animate(
          [
            { transform: "scale(1)", opacity: 1, filter: "blur(0)" },
            // Shrink rather than grow, growing wide elements adds a horizontal scrollbar
            { transform: "scale(0.6)", opacity: 0, filter: "blur(6px)" },
          ],
          { duration: 400, easing: "ease-out", fill: "forwards" }
        )
        .finished.then(() => (target.style.visibility = "hidden"));
    };

    // Let the Enter that ran the command finish before listening
    setTimeout(() => {
      document.addEventListener("click", onClick, true);
      document.addEventListener("keydown", onKey, true);
    });
  }

  handle = (event) => {
    const { name, arg, done } = event.detail;
    let result;

    if (name === "less") this.zoomBy(0.8);
    else if (name === "more") this.zoomBy(1.25);
    else if (name === "free") result = this.free();
    else if (name === "sleep") result = this.sleep(arg);
    else if (name === "man") this.man();
    else if (name === "kill") this.kill();

    Promise.resolve(result).then(done);
  };

  init() {
    window.addEventListener("page-effect", this.handle);
  }
}
