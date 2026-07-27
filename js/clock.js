function updateClock() {

    const now = new Date();

    document.getElementById("time").textContent =
        now.toLocaleTimeString("hr-HR", {
            hour: "2-digit",
            minute: "2-digit"
        });

    const dayDateInfo = document.getElementById("dayDateInfo");

    if (dayDateInfo) {

        const days = [
            "Nedjelja",
            "Ponedjeljak",
            "Utorak",
            "Srijeda",
            "Četvrtak",
            "Petak",
            "Subota"
        ];

        const date =
            String(now.getDate()).padStart(2, "0") + "." +
            String(now.getMonth() + 1).padStart(2, "0") + "." +
            now.getFullYear() + ".";

        dayDateInfo.textContent =
            days[now.getDay()] + ",  " + date;
    }
}

updateClock();
setInterval(updateClock, 1000);