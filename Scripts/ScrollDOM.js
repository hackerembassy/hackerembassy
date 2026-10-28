import TyperDOM from "./TyperDOM.js";

class ScrollDOM {
  static indicatorList = document.querySelector(".indicators");
  static scroller = document.querySelector(".scroll");
  static scrollElements = document.querySelectorAll(".scroll-item-outer");
  static scrollNamePlacement = document.querySelector("#scroll-name-placement");
  static scrollNameSizer = document.querySelector("#scroll-name-sizer");

  // One indicator per slide, so adding or removing a photo only touches the slide markup
  static createIndicators() {
    this.indicators = Array.from(this.scrollElements, (slide, i) => {
      const item = document.createElement("li");
      item.className = "indicator";
      const button = document.createElement("button");
      button.className = "indicator-button";
      button.setAttribute("aria-label", `Scroll to item #${i + 1}`);
      if ("secret" in slide.dataset) button.id = "scroll-indicator-secret";
      item.append(button);
      this.indicatorList.append(item);
      return button;
    });
    this.setAriaPressed(0);
  }

  static setAriaPressed(index) {
    this.indicators.forEach((indicator, i) => {
      indicator.setAttribute("aria-pressed", i === index);
    });
  }

  static convertToImageCommand(text) {
    return `display /home/user/images/${text}.png`;
  }

  static setCaption(index) {
    const caption = this.convertToImageCommand(this.scrollElements[index].dataset.name);
    this.scrollNamePlacement.dataset.type = JSON.stringify([caption]);
    // Same markup as the typer renders, so both copies wrap identically
    this.scrollNameSizer.innerHTML = `<span class="wrap">${caption}</span>`;
  }

  // Slides are offset in percent of the carousel height, so the position stays exact on resize and rotation
  static showSlide(index) {
    this.scroller.style.transform = `translateY(-${index * 100}%)`;
  }

  static init() {
    this.createIndicators();
    this.setCaption(0);
    this.indicators.forEach((indicator, i) => {
      indicator.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.setAriaPressed(i);
        TyperDOM.StopTypingAll();
        this.setCaption(i);
        TyperDOM.StartTypingAll();

        this.showSlide(i);
      });
    });
  }
}

export default ScrollDOM;
