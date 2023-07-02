class TyperDOM {
  constructor(el, toRotate, period, speed = 100) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = "";
    this.speed = speed;
  }

  static typers;

  static init() {
    let css = document.createElement("style");
    css.innerHTML = ".typed > .wrap { border-right: 0.08em solid #fff}";
    document.body.appendChild(css);
  }

  static *GetAllTypers() {
    for (const element of document.getElementsByClassName("typed")) {
      const toRotate = element.getAttribute("data-type");
      const period = element.getAttribute("data-period");
      const speed = element.getAttribute("data-speed");
      
      if (toRotate) {
        yield new TyperDOM(element, JSON.parse(toRotate), period, speed);
      }
    }
  }

  static StartTypingAll() {
    this.typers = [...this.GetAllTypers()];
    for (const typer of this.typers) {
      typer.StartTyping();
    }
  }

  static StopTypingAll() {
    for (const typer of this.typers) {
      typer.StopTyping();
    }
  }

  typingTimeout;

  StartTyping() {
    this.tick();
    this.isDeleting = false;
  }

  StopTyping() {
    clearTimeout(this.typingTimeout);
  }

  tick() {
    let i = this.loopNum % this.toRotate.length;
    let fullTxt = this.toRotate[i];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

    let that = this;
    let delta = 120 - Math.random() * this.speed;

    if (this.isDeleting) {
      delta /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.loopNum++;
      delta = 5 * this.speed;
    }

    this.typingTimeout = setTimeout(function () {
      that.tick();
    }, delta);
  }
}

export default TyperDOM;
