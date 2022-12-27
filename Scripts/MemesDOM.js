import { Maximize, Dogs, Bsod, Idle, Ass, ConsoleMeme } from "./Memes.js";

class MemesDOM {
  static memesCollection = [
    new Maximize(),
    new Dogs(),
    new Bsod(),
    new Idle(),
    new Ass(),
    new ConsoleMeme()
  ];

  static init() {
    for (const meme of this.memesCollection) {
      meme.init();
    }
  }
}

export default MemesDOM;
