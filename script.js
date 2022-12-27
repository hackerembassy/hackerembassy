import TyperDOM from "./Scripts/TyperDOM.js";
import MemesDOM from "./Scripts/MemesDOM.js";
import ScrollDOM from "./Scripts/ScrollDOM.js";
import AchievementsDOM from "./Scripts/AchievementsDOM.js";

// We will add webpack later
ScrollDOM.init();
TyperDOM.StartTypingAll();
MemesDOM.init();
AchievementsDOM.updateStatsString();