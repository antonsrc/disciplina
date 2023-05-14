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

let btnImportJson = document.getElementById('btnImportJson');
btnImportJson.addEventListener('change', (event) => {
    readFile(event.target.files[0]);
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
        dayDiv.classList.add("Progress");
        dayDiv.id = day;
        progressBarLines.append(dayDiv);

        let dayP = document.createElement('p');
        dayP.classList.add("Date");
        dayDiv.append(dayP);

        let dayA = document.createElement('a');
        dayA.href = '#';
        dayA.textContent = eventsOfDay["localDate"];
        dayA.addEventListener('click', function() {
            openDayEditor(day);
        });
        dayP.append(dayA);

        let eventP = document.createElement('p');
        eventP.classList.add("common2");
        eventP.id = day + 'prog';
        dayDiv.append(eventP);

        for (let ev in eventsOfDay) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            mapEvents.set(ev, allEvents[ev]);
            let eventIdName = eventsOfDay["localDate"] + ev;

            let eventSpan = document.createElement('span');
            eventSpan.classList.add("common");
            eventSpan.id = encodeURI(eventIdName);
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
        pEv.id = encodeURI(ev) + 'mod';
        divEv.append(pEv);

        let spanEv = document.createElement('span');
        spanEv.id = eventsOfDay["localDate"] + encodeURI(ev) + "_";
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
    document.getElementById(encodeURI(ev) + "mod").remove();
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
    let legend = document.getElementById("legendStat");
    legend.innerHTML = '';
    progressBarStat.innerHTML = '';

    let inputDateFrom = document.getElementById("inputDateFrom");
    let inputDateTo = document.getElementById("inputDateTo");

    let btnShowDateRange = document.getElementById("btnShowDateRange");
    btnShowDateRange.addEventListener('click', function() {
        progressBarStat.innerHTML = '';
        legend.innerHTML = '';
        let inpDateFrom = inputDateFrom.value;
        let inpDateTo = inputDateTo.value;
        loadStatData(LOC_STOR, inpDateFrom, inpDateTo);
    });
}

function loadStatData(inpData, dateFrom, dateTo) {
    let arrDates = locStorToArr(inpData);
    arrDates.sort();
    let arrDatesRanged = getRange(dateFrom, dateTo, arrDates);

    let mapEvents = new Map();

    let allEvents = JSON.parse(inpData.getItem("allEvents"));

    let progressBarStat = document.getElementById("progressBarStat");

    for (let day of arrDatesRanged) {
        let eventsOfDay = JSON.parse(inpData.getItem(day));

        let dayDiv = document.createElement('div');
        dayDiv.classList.add("Progress");
        dayDiv.id = day;
        progressBarStat.append(dayDiv);

        let dayP = document.createElement('p');
        dayP.classList.add("Date");
        dayP.textContent = eventsOfDay["localDate"];
        dayDiv.append(dayP);

        let eventP = document.createElement('p');
        eventP.classList.add("common2");
        eventP.id = day + 'prog';
        dayDiv.append(eventP);

        for (let ev in eventsOfDay) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            let eventIdName = eventsOfDay["localDate"] + ev;
            let eventSpan = document.createElement('span');
            eventSpan.classList.add("common");
            eventSpan.id = encodeURI(eventIdName);
            eventSpan.style.backgroundColor = allEvents[ev];
            let time = Number(eventsOfDay[ev]) * (100/1440);
            eventSpan.style.width = time + "%";
            eventP.append(eventSpan);

            if (mapEvents.has(ev)) {
                let sum = Number(mapEvents.get(ev)[1]) + Number(eventsOfDay[ev]);
                mapEvents.set(ev, [allEvents[ev], sum]);
            } else {
                mapEvents.set(ev, [allEvents[ev], Number(eventsOfDay[ev])]);
            }
        }

        let sortedmapEvents = new Map(Array.from(mapEvents).sort((a, b) => b[1][1] - a[1][1]));

        let legend = document.getElementById("legendStat");
        legend.innerHTML = '';
        for (let s of sortedmapEvents.entries()) {
            let divEvLavel = document.createElement('div');
            divEvLavel.classList.add("legendLabel");
            divEvLavel.textContent = s[0] + ' ';
            divEvLavel.style.background = s[1][0];
            divEvLavel.style.width = 'fit-content';
            legend.append(divEvLavel);

            let spanEvLavel = document.createElement('span');
            spanEvLavel.style.background = 'white';
            spanEvLavel.textContent = s[1][1] + ' мин';
            divEvLavel.append(spanEvLavel);
        }
    }
}

function getRange(fromDate, toDate, arr) {
    let inpFrom = new Date(fromDate);
    inpFrom = inpFrom.getTime();
    let inpTo = new Date(toDate);
    inpTo = inpTo.getTime();
    let arrFirst = new Date(arr[0]);
    let arrLast = new Date(arr[arr.length - 1]);
    let indexStart;
    let indexStop;

    if (inpTo < inpFrom ||
        inpFrom > arrLast ||
        inpTo < arrFirst) {
        return [];
    }

    if (inpFrom < arrFirst || fromDate == '') {
        indexStart = 0;
    } else {
        for (let i = 0; i < arr.length; i++) {
            let arrDate = new Date(arr[i]);
            arrDate = arrDate.getTime();
            if (arrDate >= inpFrom) {
                indexStart = i;
                break;
            }
        }
    }

    if (inpTo > arrLast || toDate == '') {
        indexStop = arr.length - 1;
    } else {
        for (let i = indexStart; i < arr.length; i++) {
            let arrDate = new Date(arr[i]);
            arrDate = arrDate.getTime();
            if (inpTo < arrDate) {
                indexStop = i - 1;
                break;
            } else if (inpTo == arrDate) {
                indexStop = i;
                break;
            }
        }
    }
    return arr.slice(indexStart,indexStop + 1);
}

function exportToJsonFile() {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    let filename = `log_backup_${year}_${month}_${day}.json`;
    let jsonStr = JSON.stringify(LOC_STOR);

    let exportJson = document.getElementById('exportJson');
    exportJson.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr));
    exportJson.setAttribute('download', filename);
}

function readFile(input) {
    if (input.type && !input.type.startsWith('application/json')) { // Check if the file is an JSON
        return;
    }

    let reader = new FileReader();
    reader.readAsText(input);
  
    reader.onload = function() {
        let jsonFileStr = reader.result;
        let jsonFile = JSON.parse(jsonFileStr);
        let allEventsFile = JSON.parse(jsonFile['allEvents']);
        let allEventsLoc = JSON.parse(LOC_STOR.getItem("allEvents"));
        for (let day in jsonFile) {
            if (!LOC_STOR.getItem(day)) {
                LOC_STOR.setItem(day, `${jsonFile[day]}`);
               
                let dayEvents = JSON.parse(jsonFile[day]);
                for (let ev in dayEvents) {
                    if (ev == 'freeTime' || ev == 'localDate') {
                        continue;
                    } else if (!allEventsLoc[ev]) {
                        allEventsLoc[ev] = allEventsFile[ev];
                        LOC_STOR.setItem("allEvents", JSON.stringify(allEventsLoc));
                    }
                }
            }
        }
        loadData(LOC_STOR);
        document.getElementById('btnImportJson').value = null;
    };
    reader.onerror = function() {
        console.log(reader.error);
    };
}

function themeToggler() {
    let main = document.getElementById('main');
    let date = document.getElementsByClassName('Date');
    let aText = document.querySelectorAll('.Date > a');
    if (main.classList.contains('mainDay')) {
        main.classList.add("mainNight");
        main.classList.remove("mainDay");
        for (let elem of date) {
            elem.style.backgroundColor = "#444d68";
        }
        for (let elem of aText) {
            elem.style.color = "white";
        }
    } else {
        main.classList.add("mainDay");
        main.classList.remove("mainNight");
        document.getElementsByClassName('Date')[0].style.backgroundColor = "#d6ebc6";
        for (let elem of date) {
            elem.style.backgroundColor = "#d6ebc6";
        }
        for (let elem of aText) {
            elem.style.color = "inherit";
        }
    }
}