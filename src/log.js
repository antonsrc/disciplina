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






function cancelDataChange() {
    const modalChangeEventsOfDay = document.getElementById("modalChangeEventsOfDay");
    modalChangeEventsOfDay.close();
}




function openDataChanger(e) {
    const modalChangeEventsOfDay = document.getElementById("modalChangeEventsOfDay");
    modalChangeEventsOfDay.showModal();
    const locStor = window.localStorage;
    let dayEvents = JSON.parse(locStor.getItem(e));

    // modalChangeEventsOfDay.innerHTML = "";
    modalChangeEventsOfDay.innerHTML = `<span>${dayEvents["localDate"]}</span><br><br>`;
    
    modalChangeEventsOfDay.innerHTML = `<div id="${e}modal"></div>`;
    const modId2 = document.getElementById(e + 'modal');
    let colorsEvents = JSON.parse(locStor.getItem("allEvents"))
    for (let ev in dayEvents) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        
        modId2.innerHTML += `<p id="${ev}mod"></p>`;
        const modId = document.getElementById(ev + 'mod');


        const eventIdName = dayEvents["changeDate"] + ev + "_";
        modId.innerHTML += `<span id='${eventIdName}' class='common3'></span><span class='common4'> ${dayEvents[ev]} мин  <b>${ev}</b></span>`;
        const eventId = document.getElementById(eventIdName);
        eventId.style.backgroundColor = colorsEvents[ev];
        const TO_PROC2 = 80/1440;
        const time = Number(dayEvents[ev])*TO_PROC2;
        eventId.style.width = time + "%";

        modId.innerHTML += `<span class='btnRem2'>
        <a href="#" onclick="removeEvent('${e}', '${ev}')"> X </a></span><br>`;
    }

    modalChangeEventsOfDay.innerHTML += `<span class='btnRem'>
        <a href="#" onclick="removeItemInLocStor('${e}')"> Удалить все события дня </a>
    </span>`;

    modalChangeEventsOfDay.innerHTML += `<br><button type="button" id="btnDataChangerCancel" onclick="cancelDataChange()">Закрыть</button>`;

    // loadLocalStorage();
}

function removeEvent(d, ev) {
    const locStor = window.localStorage;

    let dayEvents = JSON.parse(locStor.getItem(d));
    dayEvents["freeTime"] += dayEvents[ev];
    delete dayEvents[ev];


    const eventIdName = dayEvents["changeDate"] + ev + "_";
    const eventId = document.getElementById(eventIdName);
    eventId.nextSibling.remove();
    eventId.nextSibling.remove();
    eventId.remove();

    locStor.setItem(d, JSON.stringify(dayEvents));
    loadLocalStorage();
    
}






function loadLocalStorage() {
    const locStor = window.localStorage;
    const TO_PROC = 100/1440;
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
        dateId.innerHTML += `<p class='Date'><a href="#" onclick="openDataChanger('${keyDate}')"> ${dayEvents["localDate"]} </a></p>`;
        dateId.innerHTML += `<p id='${keyDate}prog' class='common2'></p>`;
        
        for (let ev in dayEvents) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            mapEvents.set(ev, colorsEvents[ev]);
            const eventIdName = dayEvents["localDate"] + ev;
            const eventsId =  document.getElementById(keyDate + 'prog');

            eventsId.innerHTML += `<span id='${eventIdName}' class='common'></span>`;
            const eventId =  document.getElementById(eventIdName);
            eventId.style.backgroundColor = colorsEvents[ev];
            const time = Number(dayEvents[ev])*TO_PROC;
            eventId.style.width = time + "%";
        }
    }

    const inpEv = document.getElementById("inputEvent");
    const legend = document.getElementById("legend");
    inpEv.innerHTML = '<option value="0" selected>Выберите событие</option>';
    legend.innerHTML = '<p>';

    let eventColors = locStor.getItem("allEvents");
    let updEventColors = {};

    for (let s of mapEvents.keys()) {
        inpEv.innerHTML += `<option value="${s}">${s}</option>`;
        legend.innerHTML += `<span style='background: ${mapEvents.get(s)}; padding: 8px; margin: 3px; border-radius: 15px;'>${s}</span>`;
        updEventColors[s] = mapEvents.get(s);
    
    }
    legend.innerHTML += '</p>';

    locStor.setItem("allEvents", JSON.stringify(updEventColors));
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
    const modalChangeEventsOfDay = document.getElementById("modalChangeEventsOfDay");
    modalChangeEventsOfDay.close();
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
            // inpEvent.innerHTML = `<option value="${inpNewEvent}" selected>${inpNewEvent}</option>`;
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
