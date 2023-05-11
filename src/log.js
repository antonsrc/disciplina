"use strict"

const LOC_STOR = window.localStorage;

window.addEventListener('load', function() {
    loadData(LOC_STOR);
});

let btnAddEvent = document.getElementById("btnAddEvent");
btnAddEvent.addEventListener('click', function() {
    document.getElementById("modalAddEvent").showModal();
});

let btnSave = document.getElementById("btnSave");
btnSave.addEventListener('click', function() {
    if(saveToLocStor()) {
        document.getElementById("modalAddEvent").close();
    }
});

let btnCancel = document.getElementById("btnCancel");
btnCancel.addEventListener('click', function() {
    document.getElementById("modalAddEvent").close();
});

let btnCreateEvent = document.getElementById("btnCreateEvent");
btnCreateEvent.addEventListener('click', function() {
    document.getElementById("modalCreateEvent").showModal();
});

let btnCreateEventCancel = document.getElementById("btnCreateEventCancel");
btnCreateEventCancel.addEventListener('click', function() {
    document.getElementById("modalCreateEvent").close();
});

let btnCreateEventOk = document.getElementById("btnCreateEventOk");
btnCreateEventOk.addEventListener('click', function() {
    if(addNewEvent()) {
        document.getElementById("modalCreateEvent").close();
    }
});

let btnClearLocStor = document.getElementById("btnClearLocStor");
btnClearLocStor.addEventListener('click', function() {
    clearLoc();
});

let btnLegend = document.getElementById("btnLegend");
btnLegend.addEventListener('click', function() {
    let legendMain = document.getElementById("legendMain");
    if (legendMain.style.height == "fit-content") {
        legendMain.style.height = "25px";
        btnLegend.innerHTML = "...";
    } else {
        legendMain.style.height = "fit-content";
        btnLegend.innerHTML = "x";
    }
});

let btnToggler = document.getElementById("btnToggler");
btnToggler.addEventListener('click', function() {
    let toggler = document.getElementById("toggler");
    if (toggler.style.display == "flex") {
        toggler.style.display = 'none';
        btnToggler.innerHTML = "///";
    } else {
        toggler.style.width = "auto";
        toggler.style.display = 'flex';
        btnToggler.innerHTML = "x";
    }
});

let btnCloseStat = document.getElementById("btnCloseStat");
btnCloseStat.addEventListener('click', function() {
    document.getElementById("modalStat").close();
});

function loadData(inpData) {
    let arrDates = locStorToArr(inpData);
    arrDates.sort();

    let progressBarLines = document.getElementById("progressBarLines");
    progressBarLines.innerHTML = '';

    let mapEvents = new Map();

    let allEvents = JSON.parse(inpData.getItem("allEvents"));

    for (let day of arrDates) {
        let eventsOfDay = JSON.parse(inpData.getItem(day));

        let dayDiv = document.createElement('div');
        dayDiv.className = 'Progress';
        dayDiv.id = day;
        progressBarLines.append(dayDiv);

        let dayP = document.createElement('p');
        dayP.className = 'Date';
        dayDiv.append(dayP);

        let dayA = document.createElement('a');
        dayA.href = '#';
        dayA.textContent = eventsOfDay["localDate"];
        dayA.addEventListener('click', function() {
            openDayEditor(day);
        });
        dayP.append(dayA);

        let eventP = document.createElement('p');
        eventP.className = 'common2';
        eventP.id = day + 'prog';
        dayDiv.append(eventP);

        for (let ev in eventsOfDay) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            mapEvents.set(ev, allEvents[ev]);
            let eventIdName = eventsOfDay["localDate"] + ev;

            let eventSpan = document.createElement('span');
            eventSpan.className = 'common';
            eventSpan.id = eventIdName;
            eventSpan.style.backgroundColor = allEvents[ev];
            let time = Number(eventsOfDay[ev]) * (100/1440);
            eventSpan.style.width = time + "%";
            eventP.append(eventSpan);
        }
    }

    let inpEv = document.getElementById("inputEvent");
    inpEv.innerHTML = '';   // чистка
    let optionEv = document.createElement('option');
    optionEv.value = '0';
    optionEv.textContent = 'Выберите событие';
    inpEv.append(optionEv);

    let legend = document.getElementById("legendMain");
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

function openDayEditor(day) {
    let modalDayEditor = document.getElementById("modalDayEditor");
    
    modalDayEditor.showModal();
    modalDayEditor.innerHTML = '';

    let eventsOfDay = loadDayData(LOC_STOR, day);
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))

    let divD = document.createElement('div');
    divD.textContent = eventsOfDay["localDate"];
    divD.id = 'modalDay' + day;
    modalDayEditor.append(divD);

    let divEv = document.createElement('div');
    divEv.id = day + 'modal';
    modalDayEditor.append(divEv);

    for (let ev in eventsOfDay) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        
        let pEv = document.createElement('p');
        pEv.id = ev + 'mod';
        divEv.append(pEv);

        let spanEv = document.createElement('span');
        spanEv.id = eventsOfDay["localDate"] + ev + "_";
        spanEv.classList.add('common');
        spanEv.style.backgroundColor = allEvents[ev];
        let time = Number(eventsOfDay[ev]) * (80/1440);
        spanEv.style.width = time + "%";
        pEv.append(spanEv);

        let spanEv2 = document.createElement('span');
        spanEv2.classList.add('common');
        spanEv2.textContent = eventsOfDay[ev] + ' мин ' + ev;
        pEv.append(spanEv2);

        let spanEv3 = document.createElement('span');
        spanEv3.classList.add('btnRem2');
        pEv.append(spanEv3);

        let aEv = document.createElement('a');
        aEv.href = '#';
        aEv.textContent = 'x';
        aEv.addEventListener('click', function() {
            removeEvent(day, ev);
        });
        spanEv3.append(aEv);
    }

    let spanBtnRem = document.createElement('span');
    spanBtnRem.classList.add('btnRem');
    modalDayEditor.append(spanBtnRem);

    let aBtnRem = document.createElement('a');
    aBtnRem.href = '#';
    aBtnRem.textContent = 'Удалить все события дня';
    aBtnRem.addEventListener('click', function() {
        removeItemFromLocStor(day);
    });
    spanBtnRem.append(aBtnRem);

    let buttonClose = document.createElement('button');
    buttonClose.type = "button";
    buttonClose.textContent = 'Закрыть';
    buttonClose.addEventListener('click', function() {
        closeDayEditor();
    });
    modalDayEditor.append(buttonClose);
}

function closeDayEditor() {
    modalDayEditor.close();
}

function removeEvent(day, ev) {
    let eventsOfDay = JSON.parse(LOC_STOR.getItem(day));
    eventsOfDay["freeTime"] += eventsOfDay[ev];
    delete eventsOfDay[ev];
    document.getElementById(ev + "mod").remove();
    LOC_STOR.setItem(day, JSON.stringify(eventsOfDay));
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

function removeItemFromLocStor(day) {
    localStorage.removeItem(day);
    document.getElementById("modalDayEditor").close();
    loadData(LOC_STOR);
}

function hideElement(elemId) {
    let elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function locStorToArr(inpData) {
    let arr = [];
    for (let i = 0; i < inpData.length; i++) {
        let locKey = localStorage.key(i);
        if (locKey == "allEvents") {
            continue;
        }
        arr.push(locKey);
    }
    return arr;
}

function addNewEvent() {
    let inpNewEvent = document.getElementById("inputNewEvent").value;
    if (inpNewEvent == "") {
        return false;
    } else {
        let inpEvent = document.getElementById("inputEvent");
        let inpColor = document.getElementById("inputColor").value;
        let eventColors = (LOC_STOR.getItem("allEvents")) ? JSON.parse(LOC_STOR.getItem("allEvents")) : {};
        if(eventColors[inpNewEvent]) {
            inpEvent.value = inpNewEvent;
        } else {
            let optionEv = document.createElement('option');
            optionEv.value = inpNewEvent;
            optionEv.textContent = inpNewEvent;
            optionEv.selected = true;
            inpEvent.append(optionEv);
        }
        eventColors[inpNewEvent] = inpColor;
        LOC_STOR.setItem("allEvents", JSON.stringify(eventColors));
        return true;
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
        let freeTime = JSON.parse(LOC_STOR.getItem(date))["freeTime"];
        if (Number(freeTime) - mins < 0) {
            errorsArr.push(`Свободного времени осталось ${freeTime} мин`);
        }
    }
    return errorsArr;
}

function saveToLocStor() { 
    let inputEvent = document.getElementById("inputEvent");
    let inpDate = document.getElementById("inputDate");
    let inpEvent = inputEvent.options[inputEvent.selectedIndex].value;
    let inpTime = document.getElementById("inputTime").value.split(":");
    inpTime = validTimeValues(inpTime);

    let inpHours = Number(inpTime[0]);
    let inpMins = Number(inpTime[1]);
    let totalMins = inpMins + inpHours * 60;
    let errorsArr = getErrorsArray(inpDate.value, inpEvent, totalMins);

    if (errorsArr.length == 0) {
        let eventsOfDay;
        let inpDateLocal = document.getElementById("inputDate").valueAsDate.toLocaleDateString();
        if (LOC_STOR.getItem(inpDate.value)) {
            eventsOfDay = JSON.parse(LOC_STOR.getItem(inpDate.value));
            if (inpEvent in eventsOfDay) {
                eventsOfDay[inpEvent] += totalMins;
            } else {
                eventsOfDay[inpEvent] = totalMins;
            }
            eventsOfDay["freeTime"] -= totalMins;
        } else {
            eventsOfDay = {};
            eventsOfDay[inpEvent] = totalMins;
            eventsOfDay["freeTime"] = 1440 - totalMins;
        }
        eventsOfDay["localDate"] = inpDateLocal;
        LOC_STOR.setItem(inpDate.value, JSON.stringify(eventsOfDay));
        hideElement("errorMessage");
        loadData(LOC_STOR);
        return true;
    } else {
        let errorMessage = document.getElementById("errorMessage");
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "";
        for (let i = 0; i < errorsArr.length; i++) {
            errorMessage.innerHTML += `${errorsArr[i]}<br>`;
        }
        return false;
    } 
}

function openStat() {
    let modalStat = document.getElementById("modalStat");
    modalStat.showModal();

    let progressBarStat = document.getElementById("progressBarStat");
    progressBarStat.innerHTML = '';

    let inputDateFrom = document.getElementById("inputDateFrom");
    let inputDateTo = document.getElementById("inputDateTo");

    let btnShowDateRange = document.getElementById("btnShowDateRange");
    btnShowDateRange.addEventListener('click', function() {
        let inpDateFrom = inputDateFrom.value;
        let inpDateTo = inputDateTo.value;
        loadStatData(LOC_STOR, inpDateFrom, inpDateTo);
    });
}

function loadStatData(inpData, dateFrom, dateTo) {
    console.log(dateFrom, dateTo);
    let arrDates = locStorToArr(inpData);
    arrDates.sort();

    let allEvents = JSON.parse(inpData.getItem("allEvents"));

    let progressBarStat = document.getElementById("progressBarStat");
    
    progressBarStat.innerHTML = dateFrom;
    progressBarStat.innerHTML += dateTo;
    // получить даты


    
}