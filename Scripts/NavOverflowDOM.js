import I18n from "./I18n.js";

// Keeps the nav on one row: links that don't fit move into a ">" menu at the end ("priority+" navigation)
class NavOverflowDOM {
  static list = document.getElementById("nav-list");
  static more = document.getElementById("nav-more");
  static toggle = document.getElementById("nav-more-button");
  static menu = document.getElementById("nav-more-list");

  static get isOpen() {
    return this.toggle.getAttribute("aria-expanded") === "true";
  }

  static setOpen(open) {
    this.toggle.setAttribute("aria-expanded", String(open));
    this.menu.hidden = !open;
  }

  static fits() {
    return this.list.scrollWidth <= this.list.clientWidth;
  }

  // Puts everything back on the row, then moves links from the end into the menu until the row fits
  static update() {
    this.setOpen(false);
    this.list.insertBefore(this.fragmentOf(this.menu), this.more);
    this.more.hidden = true;
    if (this.fits()) return;

    this.more.hidden = false;
    const items = [...this.list.children].filter((item) => item !== this.more);
    while (!this.fits() && items.length > 0) this.menu.prepend(items.pop());
  }

  static fragmentOf(container) {
    const fragment = document.createDocumentFragment();
    fragment.append(...container.children);
    return fragment;
  }

  static init() {
    this.toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      this.setOpen(!this.isOpen);
    });

    // Close on a pick, a click elsewhere or Esc
    this.menu.addEventListener("click", () => this.setOpen(false));
    document.addEventListener("click", (event) => {
      if (this.isOpen && !this.more.contains(event.target)) this.setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen) {
        this.setOpen(false);
        this.toggle.focus();
      }
    });

    // Link widths change with the screen, the language and once the font loads
    let frame;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => this.update());
    };
    new ResizeObserver(scheduleUpdate).observe(this.list.parentElement);
    I18n.onChange(scheduleUpdate);
    // fonts.ready never rejects
    void document.fonts?.ready.then(scheduleUpdate);
    this.update();
  }
}

export default NavOverflowDOM;
