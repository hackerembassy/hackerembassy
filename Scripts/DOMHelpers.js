class DOMHelpers {
  static displayElement(element, displayType = "block") {
    element.style.display = displayType;
  }

  static hideElement(element) {
    element.style.display = "none";
  }

  static addMultipleEventListeners(events, func) {
    events.forEach((event) => {
      window.addEventListener(event, func);
    });
  }

  static removeMultipleEventListeners(events, func) {
    events.forEach((event) => {
      window.removeEventListener(event, func);
    });
  }

  static getSelectionText() {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  static openFullscreen(elem = document.documentElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  }
}

export default DOMHelpers;
