"use strict"

window.addEventListener('load', function() {
    loadLocalStorage();
});

const modalSetEvent = document.getElementById("modalSetEvent");
const btnAddEvent = document.getElementById("btnAddEvent");
btnAddEvent.addEventListener('click', function() {
    modalSetEvent.showModal();
});

const btnSave = document.getElementById("btnSave");
btnSave.addEventListener('click', function() {
    if(saveToLocStor()) {
        modalSetEvent.close();
    }
});

const btnCancel = document.getElementById("btnCancel");
btnCancel.addEventListener('click', function() {
    modalSetEvent.close();
});

const modalNewEvent = document.getElementById("modalNewEvent");
const btnNewEvent = document.getElementById("btnNewEvent");
btnNewEvent.addEventListener('click', function() {
    modalNewEvent.showModal();
});

const btnNewEventCancel = document.getElementById("btnNewEventCancel");
btnNewEventCancel.addEventListener('click', function() {
    modalNewEvent.close();
});

const btnNewEventOk = document.getElementById("btnNewEventOk");
btnNewEventOk.addEventListener('click', function() {
    if(addNewEvent()) {
        modalNewEvent.close();
    }
});

const btnClearLocStor = document.getElementById("btnClearLocStor");
btnClearLocStor.addEventListener('click', function() {
    clearLoc();
});

function loadLocalStorage() {
    const locStor = window.localStorage;
    const TO_PROC = 70/1440;
    const progMain = document.getElementById("progressBarLines");
    progMain.innerHTML = "";

    let arrDates = locStorToArr(locStor);
    arrDates.sort();

    let mapEvents = new Map();

    let colorsEvents = JSON.parse(locStor.getItem("allEvents"))
    for (let keyDate of arrDates) {
        let dayEvents = JSON.parse(locStor.getItem(keyDate));
        progMain.innerHTML +=`<div id='${keyDate}' class='Progress'></div>`;
        const dateId = document.getElementById(keyDate);
        dateId.innerHTML += `<span class='Date'>${dayEvents["localDate"]}</span>
                            <span class='btnRem'>
                                <a href="#" onclick="removeItemInLocStor('${keyDate}')"> X </a>
                            </span>`;
        for (let ev in dayEvents) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            mapEvents.set(ev, colorsEvents[ev]);
            const eventIdName = dayEvents["localDate"] + ev;
            dateId.innerHTML += `<span id='${eventIdName}' class='common'></span>`;
            const eventId =  document.getElementById(eventIdName);
            eventId.style.backgroundColor = colorsEvents[ev];
            const time = Math.round(Number(dayEvents[ev])*TO_PROC)
            eventId.style.width = time + "%";
        }
    }

    const inpEv = document.getElementById("inputEvent");
    const legend = document.getElementById("legend");
    inpEv.innerHTML = '<option value="0" selected>Выберите событие</option>';
    legend.innerHTML = '<p>';
    for (let s of mapEvents.keys()) {
        inpEv.innerHTML += `<option value="${s}">${s}</option>`;
        legend.innerHTML += `<span style='background: ${mapEvents.get(s)}; padding: 8px; margin: 3px; border-radius: 15px;'>${s}</span>`;
    }
    legend.innerHTML += '</p>';
}

function validTimeValues(time) {
    let hours = time[0];
    let mins = time[1];
    if (!hours) {
        hours = 0;
    }
    if (!mins) {
        mins = 0;
    }
    return [hours, mins];
}

function clearLoc() {
    window.localStorage.clear();
    loadLocalStorage();
}

function removeItemInLocStor(e) {
    localStorage.removeItem(e);
    loadLocalStorage();
}

function hideElement(elemId) {
    const elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function addNewEvent() {
    const locStor = window.localStorage;
    const inpEvent = document.getElementById("inputEvent");
    const inpColor = document.getElementById("inputColor").value;
    const inpNewEvent = document.getElementById("inputNewEvent").value;

    if (inpNewEvent != "") {
        let eventColors = (locStor.getItem("allEvents")) ? JSON.parse(locStor.getItem("allEvents")) : {};
        if(eventColors[inpNewEvent]) {
            document.getElementById('inputEvent').value = inpNewEvent;
        } else {
            inpEvent.innerHTML += `<option value="${inpNewEvent}" selected>${inpNewEvent}</option>`;
        }
        eventColors[inpNewEvent] = inpColor;
        locStor.setItem("allEvents", JSON.stringify(eventColors));
        return true;
    } 
    else{
        return false;
    }
}

function getErrorsArray(date, events, mins) {
    const locStor = window.localStorage;
    let errorsArr = [];
    if (date == "") {
        errorsArr.push("Выберите дату");
    }
    if ( (events == "") || (events == "0") ) {
        errorsArr.push("Выберите или введите событие");
    } 
    if (mins == 0) {
        errorsArr.push("Введите время");
    } else if (locStor.getItem(date)) {
        const freeTime = JSON.parse(locStor.getItem(date))["freeTime"];
        if (Number(freeTime) - mins < 0) {
            errorsArr.push(`Свободного времени осталось ${freeTime} мин`);
        }
    }
    return errorsArr;
}

function saveToLocStor() { 
    const locStor = window.localStorage;
    const inputEvent = document.getElementById("inputEvent");
    const inpDate = document.getElementById("inputDate").value;
    const inpDateLocal = document.getElementById("inputDate").valueAsDate.toLocaleDateString();
    // inpDate = inpDate.getDay() + "." + inpDate.getMonth() + "." + inpDate.getYear();
    const inpEvent = inputEvent.options[inputEvent.selectedIndex].value;
    let inpTime = document.getElementById("inputTime").value.split(":");
    inpTime = validTimeValues(inpTime);

    const inpHours = Number(inpTime[0]);
    const inpMins = Number(inpTime[1]);
    let totalMins = inpMins + inpHours * 60;

    const errorsArr = getErrorsArray(inpDate, inpEvent, totalMins);

    if (errorsArr.length == 0) {
        let dayEvents;
        if (locStor.getItem(inpDate)) {
            dayEvents = JSON.parse(locStor.getItem(inpDate));
            if (inpEvent in dayEvents) {
                dayEvents[inpEvent] += totalMins;
            } else {
                dayEvents[inpEvent] = totalMins;
            }
            dayEvents["freeTime"] -= totalMins;
        } else {
            dayEvents = {};
            dayEvents[inpEvent] = totalMins;
            dayEvents["freeTime"] = 1440 - totalMins;
        }
        dayEvents["localDate"] = inpDateLocal;
        locStor.setItem(inpDate, JSON.stringify(dayEvents));
        hideElement("errorMessage");
        loadLocalStorage();
        return true;
    } else {
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "";
        for (let i = 0; i < errorsArr.length; i++) {
            errorMessage.innerHTML += `${errorsArr[i]}<br>`;
        }
        return false;
    } 
}

function locStorToArr(locSt) {
    let arr = [];
    for (let i = 0; i < locSt.length; i++) {
        const locKey = localStorage.key(i);
        if (locKey == "allEvents") {
            continue;
        }
        arr.push(locKey);
    }
    return arr;
}
