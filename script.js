import I18n from "./Scripts/I18n.js";
import LanguageDOM from "./Scripts/LanguageDOM.js";
import NavOverflowDOM from "./Scripts/NavOverflowDOM.js";
import TyperDOM from "./Scripts/TyperDOM.js";
import MemesDOM from "./Scripts/MemesDOM.js";
import ScrollDOM from "./Scripts/ScrollDOM.js";
import AchievementsDOM from "./Scripts/AchievementsDOM.js";

// We will add webpack later
// Everything starts right away with the English markup, translations are applied once loaded
ScrollDOM.init();
TyperDOM.StartTypingAll();
MemesDOM.init();
AchievementsDOM.updateStatsString();
LanguageDOM.init();
NavOverflowDOM.init();

I18n.onChange(() => {
  TyperDOM.StopTypingAll();
  TyperDOM.StartTypingAll();
  ScrollDOM.updateLabels();
  AchievementsDOM.updateStatsString();
});

I18n.init().catch(console.error);
