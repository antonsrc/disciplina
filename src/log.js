"use strict"

const LOC_STOR = window.localStorage;

window.addEventListener('load', function() {
    loadData(LOC_STOR);
});

const btnAddEvent = document.getElementById("btnAddEvent");
btnAddEvent.addEventListener('click', function() {
    document.getElementById("modalSetEvent").showModal();
});

const btnSave = document.getElementById("btnSave");
btnSave.addEventListener('click', function() {
    if(saveToLocStor()) {
        document.getElementById("modalSetEvent").close();
    }
});

const btnCancel = document.getElementById("btnCancel");
btnCancel.addEventListener('click', function() {
    document.getElementById("modalSetEvent").close();
});

const btnCreateEvent = document.getElementById("btnCreateEvent");
btnCreateEvent.addEventListener('click', function() {
    document.getElementById("modalCreateEvent").showModal();
});

const btnCreateEventCancel = document.getElementById("btnCreateEventCancel");
btnCreateEventCancel.addEventListener('click', function() {
    document.getElementById("modalCreateEvent").close();
});

const btnCreateEventOk = document.getElementById("btnCreateEventOk");
btnCreateEventOk.addEventListener('click', function() {
    if(addNewEvent()) {
        document.getElementById("modalCreateEvent").close();
    }
});

const btnClearLocStor = document.getElementById("btnClearLocStor");
btnClearLocStor.addEventListener('click', function() {
    clearLoc();
});

const btnLegend = document.getElementById("btnLegend");
btnLegend.addEventListener('click', function() {
    const legendMain = document.getElementById("legendMain");
    if (legendMain.style.height == "fit-content") {
        legendMain.style.height = "25px";
        btnLegend.innerHTML = "...";
    } else {
        legendMain.style.height = "fit-content";
        btnLegend.innerHTML = "x";
    }
});

const btnToggler = document.getElementById("btnToggler");
btnToggler.addEventListener('click', function() {
    const toggler = document.getElementById("toggler");
    if (toggler.style.display == "flex") {
        toggler.style.display = 'none';
        btnToggler.innerHTML = "///";
    } else {
        toggler.style.width = "auto";
        toggler.style.display = 'flex';
        btnToggler.innerHTML = "x";
    }
});

function loadData(inpData) {
    let arrDates = locStorToArr(inpData);
    arrDates.sort();

    let progressBarLines = document.getElementById("progressBarLines");
    progressBarLines.innerHTML = "";

    let mapEvents = new Map();

    let allEvents = JSON.parse(inpData.getItem("allEvents"));

    for (let day of arrDates) {
        let dayEvents = JSON.parse(inpData.getItem(day));

        let dayDiv = document.createElement('div');
        dayDiv.className = 'Progress';
        dayDiv.id = day;
        progressBarLines.append(dayDiv);

        let dayP = document.createElement('p');
        dayP.className = 'Date';
        dayDiv.append(dayP);

        let dayA = document.createElement('a');
        dayA.href = '#';
        dayA.setAttribute('onclick', `openDayEditor("${day}")`);
        dayA.textContent = dayEvents["localDate"];
        dayP.append(dayA);

        let eventP = document.createElement('p');
        eventP.className = 'common2';
        eventP.id = day + 'prog';
        dayDiv.append(eventP);

        for (let ev in dayEvents) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            mapEvents.set(ev, allEvents[ev]);
            const eventIdName = dayEvents["localDate"] + ev;

            let eventSpan = document.createElement('span');
            eventSpan.className = 'common';
            eventSpan.id = eventIdName;
            eventSpan.style.backgroundColor = allEvents[ev];
            const time = Number(dayEvents[ev]) * (100/1440);
            eventSpan.style.width = time + "%";
            eventP.append(eventSpan);
        }
    }

    const inpEv = document.getElementById("inputEvent");
    let optionEv = document.createElement('option');
    optionEv.value = '0';
    optionEv.textContent = 'Выберите событие';
    inpEv.append(optionEv);

    const legend = document.getElementById("legendMain");
    let eventColors = {};
    legend.innerHTML = '';
    for (let s of mapEvents.keys()) {
        let optionEv = document.createElement('option');
        optionEv.value = s;
        optionEv.textContent = s;
        inpEv.append(optionEv);

        let divEvLavel = document.createElement('div');
        divEvLavel.classList.add("legendLabel");
        divEvLavel.style.background = mapEvents.get(s);
        divEvLavel.textContent = s;
        legend.append(divEvLavel);
        
        eventColors[s] = mapEvents.get(s);
    }

    inpData.setItem("allEvents", JSON.stringify(eventColors));
}

function loadDayData(data, day) {
    return JSON.parse(data.getItem(day));
}

function openDayEditor(e) {
    const modalDayEditor = document.getElementById("modalDayEditor");
    
    modalDayEditor.showModal();
    modalDayEditor.innerHTML = '';

    let dayEvents = loadDayData(LOC_STOR, e);
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))

    let divD = document.createElement('div');
    divD.textContent = dayEvents["localDate"];
    divD.id = 'modalDay' + e;
    modalDayEditor.append(divD);

    let divEv = document.createElement('div');
    divEv.id = e + 'modal';
    modalDayEditor.append(divEv);

    for (let ev in dayEvents) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        
        let pEv = document.createElement('p');
        pEv.id = ev + 'mod';
        divEv.append(pEv);

        let spanEv = document.createElement('span');
        spanEv.id = dayEvents["localDate"] + ev + "_";
        spanEv.classList.add('common');
        spanEv.style.backgroundColor = allEvents[ev];
        const time = Number(dayEvents[ev]) * (80/1440);
        spanEv.style.width = time + "%";
        pEv.append(spanEv);

        let spanEv2 = document.createElement('span');
        spanEv2.classList.add('common');
        spanEv2.textContent = dayEvents[ev] + ' мин ' + ev;
        pEv.append(spanEv2);

        let spanEv3 = document.createElement('span');
        spanEv3.classList.add('btnRem2');
        pEv.append(spanEv3);

        let aEv = document.createElement('a');
        aEv.href = '#';
        aEv.setAttribute('onclick', `removeEvent('${e}', '${ev}')`);
        aEv.textContent = 'x';
        spanEv3.append(aEv);
    }

    let spanBtnRem = document.createElement('span');
    spanBtnRem.classList.add('btnRem');
    modalDayEditor.append(spanBtnRem);

    let aBtnRem = document.createElement('a');
    aBtnRem.href = '#';
    aBtnRem.setAttribute('onclick', `removeItemInLocStor('${e}')`);
    aBtnRem.textContent = 'Удалить все события дня';
    spanBtnRem.append(aBtnRem);

    let buttonClose = document.createElement('button');
    buttonClose.type = "button";
    buttonClose.setAttribute('onclick', `closeDayEditor()`);
    buttonClose.textContent = 'Закрыть';
    modalDayEditor.append(buttonClose);
}

function closeDayEditor() {
    modalDayEditor.close();
}

// TODO
function removeEvent(d, ev) {
    let dayEvents = JSON.parse(LOC_STOR.getItem(d));
    dayEvents["freeTime"] += dayEvents[ev];
    delete dayEvents[ev];

    const eventIdName = dayEvents["localDate"] + ev + "_";
    const eventId = document.getElementById(eventIdName);
    eventId.nextSibling.remove();
    eventId.nextSibling.remove();
    eventId.remove();

    LOC_STOR.setItem(d, JSON.stringify(dayEvents));

    loadData(LOC_STOR);
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
    LOC_STOR.clear();
    loadData(LOC_STOR);
}


function removeItemInLocStor(e) {
    localStorage.removeItem(e);
    const modalDayEditor = document.getElementById("modalDayEditor");
    modalDayEditor.close();
    loadData(LOC_STOR);
}

function hideElement(elemId) {
    const elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function addNewEvent() {
    const inpEvent = document.getElementById("inputEvent");
    const inpColor = document.getElementById("inputColor").value;
    const inpNewEvent = document.getElementById("inputNewEvent").value;

    if (inpNewEvent != "") {
        let eventColors = (LOC_STOR.getItem("allEvents")) ? JSON.parse(LOC_STOR.getItem("allEvents")) : {};
        if(eventColors[inpNewEvent]) {
            document.getElementById('inputEvent').value = inpNewEvent;
            // inpEvent.innerHTML = `<option value="${inpNewEvent}" selected>${inpNewEvent}</option>`;
        } else {
            inpEvent.innerHTML += `<option value="${inpNewEvent}" selected>${inpNewEvent}</option>`;
        }
        eventColors[inpNewEvent] = inpColor;
        LOC_STOR.setItem("allEvents", JSON.stringify(eventColors));
        return true;
    } 
    else{
        return false;
    }
}

function getErrorsArray(date, events, mins) {
    let errorsArr = [];
    if (date == "") {
        errorsArr.push("Выберите дату");
    }
    if ( (events == "") || (events == "0") ) {
        errorsArr.push("Выберите или введите событие");
    } 
    if (mins == 0) {
        errorsArr.push("Введите время");
    } else if (LOC_STOR.getItem(date)) {
        const freeTime = JSON.parse(LOC_STOR.getItem(date))["freeTime"];
        if (Number(freeTime) - mins < 0) {
            errorsArr.push(`Свободного времени осталось ${freeTime} мин`);
        }
    }
    return errorsArr;
}

function saveToLocStor() { 
    const inputEvent = document.getElementById("inputEvent");
    const inpDate = document.getElementById("inputDate").value;
    const inpDateLocal = document.getElementById("inputDate").valueAsDate.toLocaleDateString();
    const inpEvent = inputEvent.options[inputEvent.selectedIndex].value;
    let inpTime = document.getElementById("inputTime").value.split(":");
    inpTime = validTimeValues(inpTime);

    const inpHours = Number(inpTime[0]);
    const inpMins = Number(inpTime[1]);
    let totalMins = inpMins + inpHours * 60;

    const errorsArr = getErrorsArray(inpDate, inpEvent, totalMins);

    if (errorsArr.length == 0) {
        let dayEvents;
        if (LOC_STOR.getItem(inpDate)) {
            dayEvents = JSON.parse(LOC_STOR.getItem(inpDate));
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
        LOC_STOR.setItem(inpDate, JSON.stringify(dayEvents));
        hideElement("errorMessage");
        loadData(LOC_STOR);
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
