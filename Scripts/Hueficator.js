export default class Hueficator {
    vowels = ["а", "у", "о", "ы", "и", "э", "я", "ю", "ё", "е"];
    consonants = ["б", "в", "г", "д", "ж", "з", "й", "к", "л", "м", "н", "п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ"];
    
    vowelsToReplace = {
        "а": "я",
        "у": "ю",
        "о": "е",
        "ы": "и",
        "и": "и",
        "э": "е",
        "я": "я",
        "ю": "ю",
        "ё": "е",
        "е": "е",
    };
    
    huefy(src) {
        if (src.length < 3) return src;
    
        let ending = src.toLowerCase();
    
        // Пропускаем начальные согласные (для коротких слов)
        ending = ending.substr(Math.min(...this.vowels.map((s) => ending.indexOf(s)).filter((i) => i >= 0)));
    
        // Берем окончание
        ending = ending.substr(ending.length < 5 ? -3 : -5)
    
        // Сокращаем окончание до первой согласной
        ending = ending.substr(Math.min(...this.consonants.map((s) => ending.indexOf(s)).filter((i) => i >= 0)));
    
        const base = src.substr(0, src.length - ending.length);
        const gIndex = Math.max(...this.vowels.map((g) => base.lastIndexOf(g)));
    
        ending = src.substr(gIndex + 1);
    
        const x = base[gIndex];
        const y = this.vowelsToReplace[x];
    
        if (!y) return src;
    
        return `${src}-ху${y}${ending}`;
    }
}