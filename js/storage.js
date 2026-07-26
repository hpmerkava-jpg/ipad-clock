class StorageManager {

    constructor() {

        this.prefix = "ipadClock.";

    }

    save(key, value) {

        localStorage.setItem(
            this.prefix + key,
            JSON.stringify(value)
        );

    }

    load(key, defaultValue = null) {

        const value = localStorage.getItem(this.prefix + key);

        if (value === null)
            return defaultValue;

        try {

            return JSON.parse(value);

        } catch (e) {

            return defaultValue;

        }

    }

    remove(key) {

        localStorage.removeItem(this.prefix + key);

    }

    clear() {

        Object.keys(localStorage).forEach(key => {

            if (key.startsWith(this.prefix))
                localStorage.removeItem(key);

        });

    }

    /* ---------- Alarmi ---------- */

    saveAlarms(alarms) {

        this.save("alarms", alarms);

    }

    loadAlarms() {

        return this.load("alarms", []);

    }

    /* ---------- Postavke ---------- */

    saveSettings(settings) {

        this.save("settings", settings);

    }

    loadSettings() {

        return this.load("settings", {});

    }

}

const storage = new StorageManager();

const DEFAULT_SETTINGS = {
    sound: "standard.mp3"
};

function loadSettings() {

    try {

        return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(localStorage.getItem("ipadClock.settings") || "{}")
        };

    } catch {

        return { ...DEFAULT_SETTINGS };

    }

}

function saveSettings(settings) {

    localStorage.setItem(
        "ipadClock.settings",
        JSON.stringify(settings)
    );

}

function getAlarmSound() {

    return loadSettings().sound;

}

function setAlarmSound(sound) {

    const settings = loadSettings();

    settings.sound = sound;

    saveSettings(settings);

}