import { Maximize, Dogs, Bsod, Idle, Ass } from "./Memes.js";

class MemesDOM {
  static memesCollection = [
    new Maximize(),
    new Dogs(),
    new Bsod(),
    new Idle(),
    new Ass(),
  ];

  static init() {
    for (const meme of this.memesCollection) {
      meme.init();
    }
  }
}

export default MemesDOM;
