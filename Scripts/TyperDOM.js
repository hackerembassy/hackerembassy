class TyperDOM {
  constructor(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = "";
  }

  static typers;

  static init() {
    let css = document.createElement("style");
    css.innerHTML = ".typed > .wrap { border-right: 0.08em solid #fff}";
    document.body.appendChild(css);
  }

  static *GetAllTypers() {
    let elements = document.getElementsByClassName("typed");
    for (let i = 0; i < elements.length; i++) {
      let toRotate = elements[i].getAttribute("data-type");
      let period = elements[i].getAttribute("data-period");
      if (toRotate) {
        yield new TyperDOM(elements[i], JSON.parse(toRotate), period);
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
    let delta = 120 - Math.random() * 100;

    if (this.isDeleting) {
      delta /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }

    this.typingTimeout = setTimeout(function () {
      that.tick();
    }, delta);
  }
}

export default TyperDOM;
