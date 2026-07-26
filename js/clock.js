function updateClock(){

    const now = new Date();

    document.getElementById("time").textContent =
        now.toLocaleTimeString("hr-HR",{

            hour:"2-digit",
            minute:"2-digit"

        });

    document.getElementById("date").textContent =
        now.toLocaleDateString("hr-HR",{

            weekday:"long",
            day:"numeric",
            month:"long",
            year:"numeric"

        });

}

updateClock();

setInterval(updateClock,1000);