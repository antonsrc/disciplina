"use strict"

window.addEventListener('load', function() {
    loadLocalStorage();
});

const btnAddEvent = document.getElementById("btnAddEvent");
btnAddEvent.addEventListener('click', function() {
    addEvent();
});

const btnSave = document.getElementById("btnSave");
btnSave.addEventListener('click', function() {
    saveToLocStor();
    document.getElementById("modalSetEvent").close();
});

const btnCancel = document.getElementById("btnCancel");
btnCancel.addEventListener('click', function() {
    document.getElementById("modalSetEvent").close();
});





function ff2(ee) {
    localStorage.removeItem(ee);
    loadLocalStorage();
}

const btnNewEv = document.getElementById("btnNewEv");
btnNewEv.addEventListener('click', function() {
    const modalNewEvent = document.getElementById("modalNewEvent");
    modalNewEvent.showModal();

});


const btnNewEvCancel = document.getElementById("btnNewEvCancel");
btnNewEvCancel.addEventListener('click', function() {
    const modalNewEvent = document.getElementById("modalNewEvent");
    modalNewEvent.close();
});



const btnNewEvOk = document.getElementById("btnNewEvOk");
btnNewEvOk.addEventListener('click', function() {
    const inputNewEvent = document.getElementById("inputNewEvent");
    const inputColor = document.getElementById("inputcolor");
    const inpEvent = inputNewEvent.value;
    const inpColor = inputColor.value;


    if (inpEvent != "") {
        let evColorValues;
        const storLocal = window.localStorage;
        if (storLocal.getItem("eventColors")) {
            evColorValues = JSON.parse(storLocal.getItem("eventColors"));
            evColorValues[inpEvent] = inpColor;
        } else {
            evColorValues = {};
            evColorValues[inpEvent] = inpColor;
        }
        storLocal.setItem("eventColors", JSON.stringify(evColorValues));
    } 

    const inpEv = document.getElementById("inputEvent");
    inpEv.innerHTML += `<option value="${inpEvent}" selected>${inpEvent}</option>`;

    document.getElementById("modalNewEvent").close();
});







const btnClLoc = document.getElementById("btnclloc");
btnClLoc.addEventListener('click', function() {
    clearLoc();
});

function clearLoc() {
    window.localStorage.clear();
    loadLocalStorage();
}

function addEvent() {
    const editPl = document.getElementById("modalSetEvent");
    editPl.showModal();
}







function closeElem(elemId) {
    const elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function saveToLocStor() { 
    const storLocal = window.localStorage;

    const inputDate = document.getElementById("inputDate");
    const inputEvent = document.getElementById("inputEvent");
    const inpDate = inputDate.value;
    const inpEvent = inputEvent.options[inputEvent.selectedIndex].value;
    const inpTime = document.getElementById("inputTime").value.split(":");

    if (!inpTime[0]) {
        inpTime[0] = 0;
    }
    if (!inpTime[1]) {
        inpTime[1] = 0;
    }


    const inpTimeHours = +inpTime[0];
    const inpTimeMin = +inpTime[1];



    let showWrong = false;
    const wrongPlace = document.getElementById("wrongPlace");
    wrongPlace.innerHTML = "";

    if (inpDate == "") {
        wrongPlace.innerHTML += "Выберите дату";
        showWrong = true;
    }

    if ( (inpEvent == "") || (inpEvent == "0") ) {
        wrongPlace.innerHTML += "<br>Выберите или введите событие";
        showWrong = true;
    } 



    let totalTime = 0;
    if ((inpTimeMin == 0) && (inpTimeHours == 0) ) {
        wrongPlace.innerHTML += "<br>Введите время";
        showWrong = true;
    } else {
        if (inpTimeMin) {
            totalTime += Number(inpTimeMin);
        }
        if (inpTimeHours) {
            totalTime += Number(inpTimeHours)*60;
        }

        if ( (storLocal.getItem(inpDate) === null) && (totalTime >= 1440) ) {
            wrongPlace.innerHTML += "<br>Введите время меньшее чем 24 ч";
            showWrong = true;
        } else if (storLocal.getItem(inpDate)) {
            let storLocValues = JSON.parse(storLocal.getItem(inpDate));
            if (Number(storLocValues["freeTime"]) - totalTime < 0) {
                wrongPlace.innerHTML += `<br>Свободного времени осталось ${storLocValues["freeTime"]} мин`;
                showWrong = true;
            }
        }
    }

    
    if (showWrong){
        wrongPlace.style.display = "block";
    } else {
        let storLocValues;
        if (storLocal.getItem(inpDate)) {
            storLocValues = JSON.parse(storLocal.getItem(inpDate));
    


            if (inpEvent in storLocValues) {
                storLocValues[inpEvent] += totalTime;
            }
            else{
                storLocValues[inpEvent] = totalTime;
            }
            storLocValues["freeTime"] -= totalTime;
        } else {
            storLocValues = {};
            storLocValues[inpEvent] = totalTime;
            storLocValues["freeTime"] = 1440 - totalTime;
        }

        storLocal.setItem(inpDate, JSON.stringify(storLocValues));
        closeElem("wrongPlace");
        loadLocalStorage();
    } 
}

function locStorToArr(locStor) {
    let arr = [];
    for (let i = 0; i < locStor.length; i++) {
        const locKey = localStorage.key(i);
        if (locKey == "eventColors") continue;
        arr.push(locKey);
    }
    return arr;
}

function loadLocalStorage() {
    let storLocal = window.localStorage;

    const progMain = document.getElementById("progress_bar_lines");
    progMain.innerHTML = "";

    let arr = locStorToArr(storLocal);
    arr.sort();

    const toProc = 70/1440;






    let mapEv = new Map();


    for (let i = 0; i < arr.length; i++) {
        const keyDate = arr[i];
        progMain.innerHTML +=`<div id='${keyDate}' class='Progress'></div>`;

        const dateId = document.getElementById(`${keyDate}`);
        dateId.innerHTML += `<span class='Date'>${keyDate}</span><p class='btnRem'><a href="#" id="btnRemove${keyDate}" onclick="ff2('${keyDate}')"> x </a></p>`;

        let eventsValues = JSON.parse(storLocal.getItem(keyDate));
        let colorsValues = JSON.parse(storLocal.getItem("eventColors"))
        for (let ev in eventsValues) {
            if (ev == "freeTime"){
                continue;
            }
            mapEv.set(ev, colorsValues[ev]);
            const keyDateDiv = document.getElementById(keyDate);
            let eventId = keyDate + ev + "";
            keyDateDiv.innerHTML += `<span id='${eventId}' class='common'></span>`;
            document.getElementById(eventId).style.backgroundColor = colorsValues[ev];
            const time = Math.round(Number(eventsValues[ev])*toProc)
            document.getElementById(eventId).style.width = time + "%";
        }
    }

    const inpEv = document.getElementById("inputEvent");
    const legend = document.getElementById("legend");
    inpEv.innerHTML = `<option value="0" selected>Выберите действие</option>`;
    legend.innerHTML = `<p>`;
    for (let s of mapEv.keys()) {
        inpEv.innerHTML += `<option value="${s}">${s}</option>`;
        legend.innerHTML += `<span style='background: ${mapEv.get(s)}; font-size: 20pt;'>${s}</span><br>`;
    }
    legend.innerHTML += `</p>`;

}


