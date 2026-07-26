// =========================
// Navigation
// =========================

const pages = {

    clock: document.getElementById("page-clock"),

    alarm: document.getElementById("page-alarm"),

    timer: document.getElementById("page-timer"),

    stopwatch: document.getElementById("page-stopwatch"),

    settings: document.getElementById("page-settings")

};

const navButtons = document.querySelectorAll(".nav");
const snoozeSelect = document.getElementById("settingSnooze");

if (
    snoozeSelect &&
    typeof storage.getSnoozeMinutes === "function"
) {

    snoozeSelect.value = storage.getSnoozeMinutes();

    snoozeSelect.addEventListener("change", () => {

        storage.setSnoozeMinutes(
            Number(snoozeSelect.value)
        );

    });

}
function showPage(name){

    Object.values(pages).forEach(page=>{

        page.classList.remove("active");

    });

    pages[name].classList.add("active");

    navButtons.forEach(btn=>{

        btn.classList.remove("active");

        if(btn.dataset.page===name){

            btn.classList.add("active");

        }

    });

}

navButtons.forEach(btn=>{

    btn.onclick=()=>{

        showPage(btn.dataset.page);

    };

});

showPage("clock");


// =========================
// Sidebar
// =========================

const sidebar=document.getElementById("sidebar");

const menuButton=document.getElementById("menuButton");

menuButton.onclick=()=>{

    sidebar.classList.toggle("hide");

};


// =========================
// Night Mode
// =========================

let nightMode=false;

document.getElementById("clock").onclick=()=>{

    if(!nightMode){

        sidebar.classList.add("hide");

        menuButton.style.display="none";

        nightMode=true;

    }else{

        sidebar.classList.remove("hide");

        menuButton.style.display="block";

        nightMode=false;

    }

};