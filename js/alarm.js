class AlarmManager {

    constructor() {

        this.alarms = [];
		this.audioUnlocked = false;
        this.container = null;
        this.modal = null;

        this.btnAdd = null;
        this.btnSave = null;
        this.btnCancel = null;

        this.hourSelect = null;
        this.minuteSelect = null;
        this.labelInput = null;

        this.overlay = null;
        this.overlayTime = null;
        this.overlayName = null;

        this.btnSnooze = null;
        this.btnStop = null;

        this.audio = null;

        this.editingAlarmId = null;
        this.activeAlarmId = null;

        this.snoozeUntil = null;
        this.snoozeAlarm = null;

        this.lastTriggeredMinute = "";

    }


    init() {

        this.container = document.getElementById("alarmContainer");
        this.modal = document.getElementById("alarmModal");

        this.btnAdd = document.getElementById("btnAddAlarm");
        this.btnSave = document.getElementById("btnSaveAlarm");
        this.btnCancel = document.getElementById("btnCancelAlarm");

        this.hourSelect = document.getElementById("alarmHour");
        this.minuteSelect = document.getElementById("alarmMinute");
        this.labelInput = document.getElementById("alarmLabel");

        this.overlay = document.getElementById("alarmOverlay");
        this.overlayTime = document.getElementById("alarmTime");
        this.overlayName = document.getElementById("alarmName");

        this.btnSnooze = document.getElementById("btnSnooze");
        this.btnStop = document.getElementById("btnStop");

        this.audio = document.getElementById("alarmAudio");
		const unlockAudio = () => {

			if (!this.audio || this.audioUnlocked) {
				return;
			}

			this.audio.volume = 0;

			const promise = this.audio.play();

			if (promise) {

				promise
					.then(() => {

						this.audio.pause();
						this.audio.currentTime = 0;
						this.audio.volume = 1;

						this.audioUnlocked = true;

						console.log("Audio otključan.");

					})
					.catch(() => {

						this.audio.volume = 1;

					});

			}

		};

		document.addEventListener("touchstart", unlockAudio, { once: true });
		document.addEventListener("pointerdown", unlockAudio, { once: true });
		document.addEventListener("click", unlockAudio, { once: true });
        if (
            !this.container ||
            !this.modal ||
            !this.btnAdd ||
            !this.btnSave ||
            !this.btnCancel ||
            !this.hourSelect ||
            !this.minuteSelect ||
            !this.labelInput
        ) {
            console.error("Nedostaju HTML elementi potrebni za alarm.");
            return;
        }

        this.alarms = this.loadAlarms();

        this.fillSelectors();
        this.bindEvents();
        this.render();

        this.checkAlarms();

        setInterval(() => {

            this.checkAlarms();

        }, 1000);

    }


    loadAlarms() {

        let loaded = [];

        if (
            typeof storage !== "undefined" &&
            typeof storage.loadAlarms === "function"
        ) {

            loaded = storage.loadAlarms();

        } else {

            try {

                loaded = JSON.parse(
                    localStorage.getItem("ipadClock.alarms") || "[]"
                );

            } catch (error) {

                loaded = [];

            }

        }

        if (!Array.isArray(loaded)) {
            return [];
        }

        return loaded.map(alarm => this.normalizeAlarm(alarm));

    }


    saveAlarms() {

        if (
            typeof storage !== "undefined" &&
            typeof storage.saveAlarms === "function"
        ) {

            storage.saveAlarms(this.alarms);

            return;

        }

        localStorage.setItem(
            "ipadClock.alarms",
            JSON.stringify(this.alarms)
        );

    }


    normalizeAlarm(alarm) {

        const repeat = Array.isArray(alarm.repeat)
            ? alarm.repeat
                .map(day => Number(day))
                .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
            : [];

        return {

            id: alarm.id || this.createId(),

            hour: this.validHour(alarm.hour),

            minute: this.validMinute(alarm.minute),

            label: String(alarm.label || "Alarm"),

            enabled: alarm.enabled !== false,

            repeat: [...new Set(repeat)]

        };

    }


    validHour(value) {

        const hour = Number(value);

        if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
            return 7;
        }

        return hour;

    }


    validMinute(value) {

        const minute = Number(value);

        if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
            return 0;
        }

        return minute;

    }


    createId() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {

            return window.crypto.randomUUID();

        }

        return (
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2)
        );

    }


    bindEvents() {

        this.btnAdd.addEventListener("click", () => {

            this.newAlarm();

        });


        this.btnCancel.addEventListener("click", () => {

            this.closeModal();

        });


        this.btnSave.addEventListener("click", () => {

            this.saveAlarm();

        });


        document.querySelectorAll(".day").forEach(button => {

            button.addEventListener("click", () => {

                button.classList.toggle("active");

            });

        });


        this.modal.addEventListener("click", event => {

            if (event.target === this.modal) {

                this.closeModal();

            }

        });


        if (this.btnStop) {

            this.btnStop.addEventListener("click", () => {

                this.stopAlarm();

            });

        }


        if (this.btnSnooze) {

            this.btnSnooze.addEventListener("click", () => {

                this.snoozeAlarmForFiveMinutes();

            });

        }


        document.addEventListener("keydown", event => {

            if (
                event.key === "Escape" &&
                !this.modal.classList.contains("hidden")
            ) {

                this.closeModal();

            }

        });

    }


    fillSelectors() {

        this.hourSelect.innerHTML = "";
        this.minuteSelect.innerHTML = "";

        for (let hour = 0; hour < 24; hour++) {

            const option = document.createElement("option");

            option.value = String(hour);
            option.textContent = String(hour).padStart(2, "0");

            this.hourSelect.appendChild(option);

        }

        for (let minute = 0; minute < 60; minute++) {

            const option = document.createElement("option");

            option.value = String(minute);
            option.textContent = String(minute).padStart(2, "0");

            this.minuteSelect.appendChild(option);

        }

    }


    newAlarm() {

        this.editingAlarmId = null;

        this.setModalTitle("Novi alarm");

        this.hourSelect.value = "7";
        this.minuteSelect.value = "0";
        this.labelInput.value = "";

        this.clearSelectedDays();

        this.openModal();

        this.labelInput.focus();

    }


    editAlarm(id) {

        const alarm = this.alarms.find(item => item.id === id);

        if (!alarm) {
            return;
        }

        this.editingAlarmId = alarm.id;

        this.setModalTitle("Uredi alarm");

        this.hourSelect.value = String(alarm.hour);
        this.minuteSelect.value = String(alarm.minute);
        this.labelInput.value = alarm.label;

        this.clearSelectedDays();

        alarm.repeat.forEach(day => {

            const button = document.querySelector(
                `.day[data-day="${day}"]`
            );

            if (button) {
                button.classList.add("active");
            }

        });

        this.openModal();

        this.labelInput.focus();

    }


    setModalTitle(text) {

        const title = this.modal.querySelector("h2");

        if (title) {
            title.textContent = text;
        }

    }


    clearSelectedDays() {

        document.querySelectorAll(".day").forEach(button => {

            button.classList.remove("active");

        });

    }


    getSelectedDays() {

        return Array.from(
            document.querySelectorAll(".day.active")
        )
            .map(button => Number(button.dataset.day))
            .filter(day => Number.isInteger(day) && day >= 0 && day <= 6);

    }


    openModal() {

        this.modal.classList.remove("hidden");

    }


    closeModal() {

        this.modal.classList.add("hidden");

        this.editingAlarmId = null;

        this.clearSelectedDays();

    }


    saveAlarm() {

        const alarmData = {

            hour: this.validHour(this.hourSelect.value),

            minute: this.validMinute(this.minuteSelect.value),

            label: this.labelInput.value.trim() || "Alarm",

            repeat: this.getSelectedDays()

        };


        if (this.editingAlarmId) {

            const alarm = this.alarms.find(
                item => item.id === this.editingAlarmId
            );

            if (alarm) {

                alarm.hour = alarmData.hour;
                alarm.minute = alarmData.minute;
                alarm.label = alarmData.label;
                alarm.repeat = alarmData.repeat;

            }

        } else {

            this.alarms.push({

                id: this.createId(),

                hour: alarmData.hour,

                minute: alarmData.minute,

                label: alarmData.label,

                enabled: true,

                repeat: alarmData.repeat

            });

        }

        this.sortAlarms();
        this.saveAlarms();
        this.render();
        this.closeModal();

    }


    sortAlarms() {

        this.alarms.sort((first, second) => {

            const firstMinutes =
                first.hour * 60 + first.minute;

            const secondMinutes =
                second.hour * 60 + second.minute;

            return firstMinutes - secondMinutes;

        });

    }


    formatRepeat(days) {

        if (!Array.isArray(days) || days.length === 0) {

            return "Jednom";

        }

        const dayNames = {

            0: "Ned",
            1: "Pon",
            2: "Uto",
            3: "Sri",
            4: "Čet",
            5: "Pet",
            6: "Sub"

        };

        const normalizedDays = [...new Set(
            days.map(day => Number(day))
        )];

        const weekdays = [1, 2, 3, 4, 5];
        const weekend = [0, 6];
        const everyDay = [0, 1, 2, 3, 4, 5, 6];

        if (this.sameDays(normalizedDays, everyDay)) {

            return "Svaki dan";

        }

        if (this.sameDays(normalizedDays, weekdays)) {

            return "Pon Uto Sri Čet Pet";

        }

        if (this.sameDays(normalizedDays, weekend)) {

            return "Sub Ned";

        }

        const displayOrder = [1, 2, 3, 4, 5, 6, 0];

        return displayOrder
            .filter(day => normalizedDays.includes(day))
            .map(day => dayNames[day])
            .join(" ");

    }


    sameDays(first, second) {

        if (first.length !== second.length) {
            return false;
        }

        return second.every(day => first.includes(day));

    }


    escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    render() {

        this.container.innerHTML = "";

        if (this.alarms.length === 0) {

            this.container.innerHTML = `
                <div class="alarmEmpty">
                    Nema spremljenih alarma
                </div>
            `;

            return;

        }

        this.alarms.forEach(alarm => {

            const card = document.createElement("div");

            card.className = "alarmCard";
            card.dataset.alarmId = alarm.id;

            const time =
                String(alarm.hour).padStart(2, "0") +
                ":" +
                String(alarm.minute).padStart(2, "0");

            card.innerHTML = `
                <div class="alarmLeft">

                    <div class="alarmTime">
                        ${time}
                    </div>

                    <div class="alarmLabel">
                        ${this.escapeHtml(alarm.label)}
                    </div>

                    <div class="alarmRepeat">
                        ${this.formatRepeat(alarm.repeat)}
                    </div>

                </div>

                <div class="alarmRight">

                    <div
                        class="switch ${alarm.enabled ? "on" : ""}"
                        role="switch"
                        aria-checked="${alarm.enabled}"
                        aria-label="Uključi ili isključi alarm">
                    </div>

                    <button
                        class="deleteAlarm"
                        type="button"
                        aria-label="Obriši alarm">
                        🗑
                    </button>

                </div>
            `;


            const switchElement = card.querySelector(".switch");
            const deleteButton = card.querySelector(".deleteAlarm");


            switchElement.addEventListener("click", event => {

                event.stopPropagation();

                alarm.enabled = !alarm.enabled;

                this.saveAlarms();
                this.render();

            });


            deleteButton.addEventListener("click", event => {

                event.stopPropagation();

                this.deleteAlarm(alarm.id);

            });


            card.addEventListener("click", () => {

                this.editAlarm(alarm.id);

            });


            this.container.appendChild(card);

        });

    }


    deleteAlarm(id) {

        this.alarms = this.alarms.filter(
            alarm => alarm.id !== id
        );

        this.saveAlarms();
        this.render();

    }


    checkAlarms() {

        const now = new Date();
		console.log(
			"Provjera:",
			now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0"),
			this.alarms
		);
        this.checkSnooze(now);

        const minuteKey = [
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes()
        ].join("-");

        if (this.lastTriggeredMinute === minuteKey) {
            return;
        }

        this.lastTriggeredMinute = minuteKey;

        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

		const alarm = this.alarms.find(item => {

			console.log(
				"Alarm:",
				item.hour,
				item.minute,
				"Sada:",
				currentHour,
				currentMinute,
				"Enabled:",
				item.enabled,
				"Repeat:",
				item.repeat
			);

			if (!item.enabled) {
				return false;
			}

			if (item.hour !== currentHour) {
				return false;
			}

			if (item.minute !== currentMinute) {
				return false;
			}

			if (item.repeat.length === 0) {
				return true;
			}

			return item.repeat.includes(currentDay);

		});
		if (!alarm) {
			return;
		}

		this.startAlarm(alarm);

		if (alarm.repeat.length === 0) {

			alarm.enabled = false;

			this.saveAlarms();

			this.render();

		}
			}


    checkSnooze(now) {

        if (!this.snoozeUntil || !this.snoozeAlarm) {
            return;
        }

        if (now.getTime() < this.snoozeUntil) {
            return;
        }

        const alarm = this.snoozeAlarm;

        this.snoozeUntil = null;
        this.snoozeAlarm = null;

        this.startAlarm(alarm);

    }


    startAlarm(alarm) {

        this.activeAlarmId = alarm.id;

        if (this.overlayTime) {

            this.overlayTime.textContent =
                String(alarm.hour).padStart(2, "0") +
                ":" +
                String(alarm.minute).padStart(2, "0");

        }

        if (this.overlayName) {

            this.overlayName.textContent = alarm.label;

        }

        if (this.overlay) {

            this.overlay.classList.remove("hidden");

        }

        if (this.audio) {

		this.audio.pause();
		this.audio.currentTime = 0;
		this.audio.load();

		const playPromise = this.audio.play();

            if (
                playPromise &&
                typeof playPromise.catch === "function"
            ) {

                playPromise.catch(error => {

                    console.warn(
                        "Preglednik nije dopustio automatsku reprodukciju alarma.",
                        error
                    );

                });

            }

        }

    }


    stopAlarm() {

        this.stopAudio();

        if (this.overlay) {

            this.overlay.classList.add("hidden");

        }

        this.activeAlarmId = null;
        this.snoozeUntil = null;
        this.snoozeAlarm = null;

    }


    snoozeAlarmForFiveMinutes() {

        let alarm = this.alarms.find(
            item => item.id === this.activeAlarmId
        );

        if (!alarm) {

            alarm = {

                id: this.activeAlarmId || this.createId(),

                hour: new Date().getHours(),

                minute: new Date().getMinutes(),

                label: this.overlayName
                    ? this.overlayName.textContent
                    : "Alarm",

                enabled: true,

                repeat: []

            };

        }

        this.snoozeAlarm = {

            ...alarm,

            repeat: Array.isArray(alarm.repeat)
                ? [...alarm.repeat]
                : []

        };

        this.snoozeUntil = Date.now() + 5 * 60 * 1000;

        this.stopAudio();

        if (this.overlay) {

            this.overlay.classList.add("hidden");

        }

        this.activeAlarmId = null;

    }


    stopAudio() {

        if (!this.audio) {
            return;
        }

        this.audio.pause();
        this.audio.currentTime = 0;

    }

}


const alarmManager = new AlarmManager();


document.addEventListener("DOMContentLoaded", () => {

    alarmManager.init();

});