class AchievementsDOM {
  static AllAchievements = {
    bsod: "Oh no :O",
    dogs: "DoggyStyleOS",
    alive: "You need more sleep",
    ass: "Ha, Gay",
    console: "Bash-bash Baby",
    secret: "Oh myyyy",
    refresh: "Wrong arrows"
  };
  
  static EarnedAchievements;

  static loadEarnedAchievements(){
    this.EarnedAchievements = JSON.parse(
        localStorage.getItem(this.AchievementStorageKey) ?? "{}"
      );
  }

  static AchievementPopup = document.getElementById("achievement");
  static AchievementPlaceholder = document.getElementById(
    "achievement-placeholder"
  );
  static AchievementsStatsPlaceholder =
    document.getElementById("achievements-stats");
  static DefaultShortAchievementDelay = 500;
  static DefaultMediumAchievementDelay = 1500;
  static DefaultLongAchievementDelay = 4000;
  static AchievementPopupDuration = 8000;
  static AchievementTriggeredClass = "triggered";
  static AchievementStorageKey = "achievements";

  static triggerAchievmentPopup(text, delay = 0) {
    setTimeout(() => {
      this.AchievementPlaceholder.innerHTML = text;
      this.AchievementPopup.classList.toggle(this.AchievementTriggeredClass);
      setTimeout(
        () =>
          this.AchievementPopup.classList.toggle(
            this.AchievementTriggeredClass
          ),
        this.AchievementPopupDuration
      );
    }, delay);
  }

  static earnAchievment(key) {
    this.loadEarnedAchievements();

    let value = this.AllAchievements[key];

    if (this.EarnedAchievements[key]) return false;

    this.EarnedAchievements[key] = value;

    localStorage.setItem(
      this.AchievementStorageKey,
      JSON.stringify(this.EarnedAchievements)
    );

    this.updateStatsString();

    return true;
  }

  static hasAchievment(key) {
    if (!this.EarnedAchievements)
        this.loadEarnedAchievements();

    return !!this.EarnedAchievements[key];
  }

  static updateStatsString() {
    if (!this.EarnedAchievements)
        this.loadEarnedAchievements();

    this.AchievementsStatsPlaceholder.innerHTML = `Найдено пасхалок: ${Object.keys(this.EarnedAchievements).length} из ${Object.keys(this.AllAchievements).length - 1}`;
  }
}

export default AchievementsDOM;
