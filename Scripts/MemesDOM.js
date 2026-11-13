import { Maximize, Dogs, Bsod, Idle, Ass, ConsoleMeme, SecretImage, Rotate, Shutdown } from "./Memes.js";
import Vim from "./Vim.js";
import PageEffects from "./PageEffects.js";

class MemesDOM {
  static memesCollection = [
    new Maximize(),
    new Dogs(),
    new Bsod(),
    new Idle(),
    new Ass(),
    new ConsoleMeme(),
    new SecretImage(),
    new Rotate(),
    new Shutdown(),
    new Vim(),
    new PageEffects()
  ];

  static init() {
    for (const meme of this.memesCollection) {
      meme.init();
    }
  }
}

export default MemesDOM;
