"use strict"

const VERSION = '0.7.16';
const LOC_STOR = window.localStorage;

let openEventAdder = document.getElementById("openEventAdder");
let dialogEventAdder = document.getElementById("dialogEventAdder");
let dialogEventCreater = document.getElementById("dialogEventCreater");
let dialogLabelEditor = document.getElementById("dialogLabelEditor");
let dialogDayEditor = document.getElementById("dialogDayEditor");
let addEvent = document.getElementById("addEvent");
let addNewEvent = document.getElementById("addNewEvent");
let openNewEventCreater = document.getElementById("openNewEventCreater");
let changeLabel = document.getElementById("changeLabel");
let clearLocStorage = document.getElementById("clearLocStorage");
let foldLabels = document.getElementById("foldLabels");
let legend = document.getElementById("legend");
let showToggler = document.getElementById("showToggler");
let labels = document.getElementById("labels");
let foldSVG = document.getElementById("foldSVG");
let toggler = document.getElementById("toggler");
let closeTogglerWrapper = document.getElementById("closeTogglerWrapper");
let importJson = document.getElementById('importJson');
let inputNewLabelName = document.getElementById("inputNewLabelName");
let inputNewLabelColor = document.getElementById("inputNewLabelColor");
let removeDay = document.getElementById("removeDay");
let headDay = document.getElementById("headDay");
let exportJson = document.getElementById("exportJson");
let stat = document.getElementById("stat");
let inputDate = document.getElementById("inputDate");
let inputEvent = document.getElementById("inputEvent");
let inputTime = document.getElementById("inputTime");
let errorMessage = document.getElementById("errorMessage");
let progressLines = document.getElementById("progressLines");
let progressLinesStat = document.getElementById("progressLinesStat");
let legendStat = document.getElementById("legendStat");
let eventsDay = document.getElementById("eventsDay");
let dialogStat = document.getElementById("dialogStat");
let inputNewEvent = document.getElementById("inputNewEvent");
let inputColor = document.getElementById("inputColor");
let divWithScroll = document.getElementById("divWithScroll");
let inputDateFrom = document.getElementById("inputDateFrom");
let inputDateTo = document.getElementById("inputDateTo");
let btnShowDateRange = document.getElementById("btnShowDateRange");
let exampleDiv = document.getElementById("exampleDiv");

window.addEventListener('load', () => {
    header.textContent = `disciplina v.${VERSION}`;
    if (LOC_STOR.length == 0) {
        loadExampleIfEmpty(LOC_STOR);
        LOC_STOR.setItem("example", JSON.stringify(0));
    } else {
        loadData(LOC_STOR)
            .then(() => setEventListenersForLabels())
            .then(() => setEventListenersForDays());
    }
    if (LOC_STOR.getItem("example")) {
        setExampleEnvironment();
    }

});

document.querySelectorAll('.closeDialog').forEach(item => {
    item.addEventListener('click', e => {
        let parentDialog = e.target.closest('dialog');
        if (parentDialog) {
            document.getElementById(parentDialog.id).close();
        }
    });
});

openEventAdder.addEventListener('click', () => {
    inputDate.valueAsDate = new Date();
    hideElement("errorMessage");
    dialogEventAdder.showModal();
});

addEvent.addEventListener('click', () => {
    Promise.allSettled([
        checkDate(inputDate),
        checkEvent(inputEvent),
        checkTime(inputTime, inputDate)
    ])
        .then(res => {
            let errorChecking = res.find(item => item.status == 'rejected');
            if (errorChecking) {
                showErrors(res);
            } else {
                saveToLocalSorage(res)
                    .then(() => loadData(LOC_STOR))
                    .then(() => setEventListenersForLabels())
                    .then(() => setEventListenersForDays());
                hideElement("errorMessage");
                dialogEventAdder.close();
            }
        });
});

openNewEventCreater.addEventListener('click', () => dialogEventCreater.showModal());

addNewEvent.addEventListener('click', () => newEvent());

clearLocStorage.addEventListener('click', () => clearLocStor());

exportJson.addEventListener('click', () => exportToJsonFile(LOC_STOR));

stat.addEventListener('click', () => openStat());

removeDay.addEventListener('click', () => {
    removeDayFromLocStor(dialogDayEditor.dataset.day)
        .then(() => loadData(LOC_STOR))
        .then(() => setEventListenersForLabels())
        .then(() => setEventListenersForDays());
});

changeLabel.addEventListener('click', () => {
    changeLabelInLocStor()
        .then(() => dialogLabelEditor.close())
        .then(() => loadData(LOC_STOR))
        .then(() => setEventListenersForLabels())
        .then(() => setEventListenersForDays());
});

foldLabels.addEventListener('click', () => {
    if (foldSVG.href.baseVal == "./data/dots.svg") {
        labels.style.height = "fit-content";
        legend.style.height = "fit-content";
        foldSVG.href.baseVal = "./data/cross45.svg";
    } else {
        labels.style.height = "2rem";
        legend.style.height = "var(--legend-height)";
        foldSVG.href.baseVal = "./data/dots.svg";
    }
});

showToggler.addEventListener('click', () => {
    toggler.style.display = 'flex';
});

closeTogglerWrapper.addEventListener('click', () => {
    toggler.style.display = 'none';
});

importJson.addEventListener('change', (e) => {
    readFile(e.target.files[0]);
});

exampleDiv.addEventListener('click', () => {
    header.style.background = '';
    exampleDiv.style.display = '';
    header.textContent = `disciplina v.${VERSION}`;;
    header.style.animationName = '';
    header.style.animationDuration = '';
    header.style.animationTimingFunction = '';
    header.style.animationIterationCount = '';
    LOC_STOR.clear();
    loadData(LOC_STOR)
        .then(() => setEventListenersForLabels())
        .then(() => setEventListenersForDays());
});

function loadExampleIfEmpty(inpData) {
    return fetch("./data/example.json")
        .then(res => res.json())
        .then(json => {
            let allEvents = (inpData.getItem("allEvents")) ? JSON.parse(inpData.getItem("allEvents")) : {};
            addJsonFileToLocStor(json, allEvents);
            loadData(inpData)
                .then(() => setEventListenersForLabels())
                .then(() => setEventListenersForDays());
            return json;
        });
}

function setExampleEnvironment() {
    header.innerHTML = '<b>DEMO!</b> disciplina';
    header.style.animationName = 'headerBlink';
    header.style.animationDuration = '4s';
    header.style.animationTimingFunction = 'linear';
    header.style.animationIterationCount = 'infinite';
    exampleDiv.style.display = 'block';
}

function loadDayData(data, day) {
    return JSON.parse(data.getItem(day));
}

function clearLocStor() {
    let answer = confirm('Удалить все данные?');
    if (answer) {
        LOC_STOR.clear();
        loadData(LOC_STOR)
            .then(() => setEventListenersForLabels())
            .then(() => setEventListenersForDays());
    }
}

function hideElement(elemId) {
    let elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function setEventListenersForLabels() {
    document.querySelectorAll('.EventLabelLink').forEach(item => {
        item.addEventListener('click', e => {
            let idLabel = e.target.id.split('_')[1];
            openLabelEditor(idLabel);
        });
    });
}

function setEventListenersForEventRemove() {
    document.querySelectorAll('.DayEventRemoveA').forEach(item => {
        item.addEventListener('click', e => {
            let idLabel = e.target.parentNode.parentNode.id.split('_')[0];
            let parentDialog = e.target.closest('dialog').dataset.day;
            removeEventFromDay(parentDialog, idLabel)
                .then(() => loadData(LOC_STOR))
                .then(() => setEventListenersForLabels())
                .then(() => setEventListenersForDays());
        });
    });
}

function openLabelEditor(idLabel) {
        let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))
        dialogLabelEditor.dataset.id = idLabel;
        inputNewLabelName.value = decodeURIComponent(allEvents[idLabel].name);
        inputNewLabelColor.value = allEvents[idLabel].color;
        dialogLabelEditor.showModal();
}

function changeLabelInLocStor() {
    return new Promise((resolve, reject) => {
        let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"));
        let eventId = dialogLabelEditor.dataset.id;
        allEvents[eventId] = {
            color: inputNewLabelColor.value,
            name: encodeURIComponent(inputNewLabelName.value),
        }
        LOC_STOR.setItem("allEvents", JSON.stringify(allEvents));
        resolve(0);
    });
}

function removeEventFromDay(day, e) {
    return new Promise((resolve, reject) => {
        let eventsOfDay = loadDayData(LOC_STOR, day);
        eventsOfDay["freeTime"] += eventsOfDay[e];
        delete eventsOfDay[e];
        document.getElementById(e + '_day').remove();
        LOC_STOR.setItem(day, JSON.stringify(eventsOfDay));
        resolve(0);
    });
}

function removeDayFromLocStor(day) {
    return new Promise((resolve, reject) => {
        LOC_STOR.removeItem(day);
        dialogDayEditor.close();
        resolve(0);
    });
}

function exportToJsonFile(inpData) {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    let filename = `log_backup_${year}_${month}_${day}.json`;
    let jsonStr = JSON.stringify(inpData);

    exportJson.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr)
    );
    exportJson.setAttribute('download', filename);
}

function validTimeValues(time) {
    let [hours, mins] = time;
    if (!hours) hours = 0;
    if (!mins) mins = 0;
    return [+hours, +mins];
}

function getArrayOfKeys(inpData) {
    let arr = Object.keys(inpData)
                .filter(item => (item != 'allEvents') && (item != 'idLength') && (item != 'example'));
    return arr;
}

function checkDate(inpDate) {
    let date = inpDate.value;
    return new Promise((resolve, reject) => {
        if (date == "") {
            reject('inputDateReject');
        }
        else
        {
            resolve(date);
        }
    });
}

function checkEvent(inpEvent) {
    let ev = inpEvent.options[inpEvent.selectedIndex].value;
    return new Promise((resolve, reject) => {
        if ( (ev == "") || (ev == "0") ) {
            reject('inputEventReject');
        }
        else {
            resolve(ev);
        }
    });
}

function checkTime(inpTime, inpDate) {
    let [inpHours, inpMins]  = validTimeValues(inpTime.value.split(":"));
    let totalMins = inpMins + inpHours * 60;
    return new Promise((resolve, reject) => {
        if (totalMins == 0) {
            reject('totalMinsZero');
        } else if (LOC_STOR.getItem(inpDate.value)) {
            let freeTime = JSON.parse(LOC_STOR.getItem(inpDate.value))["freeTime"];
            if (Number(freeTime) - totalMins < 0) {
                reject('totalMinsOverflow');
            } else {
                resolve(totalMins);
            }
        } else {
            resolve(totalMins);
        }
    });
}

function showErrors(arr) {
    errorMessage.style.display = "block";
    errorMessage.innerHTML = "";
    let arrFilter = arr.filter(item => item.reason);
    arrFilter.forEach(errorType => {
        switch(errorType.reason) {
            case 'inputDateReject':
                errorMessage.innerHTML += 'Выберите дату<br>';
                break;
            case 'inputEventReject':
                errorMessage.innerHTML += 'Выберите или введите событие<br>';
                break;
            case 'totalMinsZero':
                errorMessage.innerHTML += 'Введите время<br>';
                break;
            case 'totalMinsOverflow':
                let freeTime = JSON.parse(LOC_STOR.getItem(arr[0].value))["freeTime"];
                errorMessage.innerHTML += `Свободного времени осталось ${freeTime} мин<br>`;
                break;
        }
    });
}

function saveToLocalSorage(arr) {
    return new Promise((resolve, reject) => {
        let eventsOfDay;
        let [day, ev, minutes] = arr.map(item => item.value);
        let inputDateLocal = document.getElementById("inputDate").valueAsDate.toLocaleDateString();
        if (LOC_STOR.getItem(day)) {
            eventsOfDay = loadDayData(LOC_STOR, day);
            if (ev in eventsOfDay) {
                eventsOfDay[ev] += minutes;
            } else {
                eventsOfDay[ev] = minutes;
            }
            eventsOfDay["freeTime"] -= minutes;
        } else {
            eventsOfDay = {};
            eventsOfDay[ev] = minutes;
            eventsOfDay["freeTime"] = 1440 - minutes;
        }
        eventsOfDay["localDate"] = inputDateLocal;
        LOC_STOR.setItem(day, JSON.stringify(eventsOfDay));
        resolve(0);
    });
}

function changeTextColorIfWeekend(day, textDay) {
    let weekDay = new Date(day).getDay();
    if (weekDay == 0 || weekDay == 6) {
        textDay.style.color = 'rgb(45, 170, 13)';
    }
}

function setEventListenersForDays() {
    document.querySelectorAll('.Date').forEach(item => {
        item.addEventListener('click', e => {
            let day = e.target.id.split('_')[1];
            openDayEditor(day);
        });
    });
}

function loadLineOfDay(events, appendTo, inpData, dataWidth) {
    let widthOfDay = 0;
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    for (let ev in events) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        let time = Number(events[ev]) * (100/1440);
        widthOfDay += time;

        let eventSpan = document.createElement('div');
        eventSpan.classList.add("line");
        eventSpan.style.backgroundColor = allEvents[ev].color;
        eventSpan.style.width = time + "%";
        appendTo.append(eventSpan);
    }
    if (widthOfDay >= dataWidth) {
        dataWidth = widthOfDay;
    }
    return dataWidth;
}

function updAllEvents(inpData, arrOfDays) {
    if (!arrOfDays.length) {
        return;
    }
    let newAllEvents = {};
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    arrOfDays.forEach(day => {
        let eventsOfDay = loadDayData(inpData, day);
        for (let ev in eventsOfDay) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            newAllEvents[ev] = allEvents[ev];
        }
    });
    inpData.setItem("allEvents", JSON.stringify(newAllEvents));
}

function resizeAllLines(className, dataWidth, progressLinesTag) {
    for (let i of progressLinesTag.getElementsByClassName(className)) {
        i.style.width = parseFloat(i.style.width)*(100/dataWidth) + '%';
    }
}

function loadProgressLines(inpData, linesTag, arrDates, dateClassStyle) {
    linesTag.innerHTML = '';
    let tempMaxWidth = 0;
    arrDates.forEach(day => {
        let eventsOfDay = loadDayData(inpData, day);
        let dayLine = document.createElement('div');
        dayLine.classList.add("Progress");
        linesTag.append(dayLine);

        let dayP = document.createElement('p');
        dayP.classList.add(dateClassStyle);
        dayP.id = 'date_' + day;
        dayP.textContent = eventsOfDay["localDate"];
        changeTextColorIfWeekend(day, dayP);
        dayLine.append(dayP);

        let eventsP = document.createElement('p');
        eventsP.classList.add("eventsLines");
        dayLine.append(eventsP);
        tempMaxWidth = loadLineOfDay(eventsOfDay, eventsP, inpData, tempMaxWidth);
    });
    resizeAllLines("line", tempMaxWidth, linesTag);
}

function loadSelectionMenu(selectTag, inpData) {
    selectTag.innerHTML = '';   // clean menu
    let mainOptionEv = document.createElement('option');
    mainOptionEv.value = '0';
    mainOptionEv.textContent = 'Выберите событие';
    selectTag.append(mainOptionEv);
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    for (let ev in allEvents) {
        if (ev == 'idLength') {
            continue;
        }
        let optionEv = document.createElement('option');
        optionEv.value = ev;
        optionEv.textContent = decodeURIComponent(allEvents[ev].name);
        selectTag.append(optionEv);
    }
}

function loadLabels(inpData, labelsTag) {
    labelsTag.innerHTML = '';
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    for (let ev in allEvents) {
        if (ev == 'idLength') {
            continue;
        }
        let divEvLavel = document.createElement('div');
        divEvLavel.classList.add("EventLabelLink");
        divEvLavel.style.background = allEvents[ev].color;
        divEvLavel.textContent = decodeURIComponent(allEvents[ev].name);
        divEvLavel.id = 'legend_'+ev;
        labelsTag.append(divEvLavel);
    }
}

function loadData(inpData, dateFrom = '', dateTo = '') {
    return new Promise((resolve, reject) => {
        let dates = getRange(dateFrom, dateTo, inpData);
        dates.sort().reverse();
        updAllEvents(inpData, dates);
        loadProgressLines(inpData, progressLines, dates, "Date");
        loadSelectionMenu(inputEvent, inpData);
        loadLabels(inpData, labels);
        resolve(0);
    });
}

function getMinutesSumOfEvents(days, inpData) {
    let objEvents = {};
    days.forEach(day => {
        let eventsOfDay = loadDayData(inpData, day);   
        for (let ev in eventsOfDay) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            if(ev in objEvents) {
                objEvents[ev] += eventsOfDay[ev];
            } else {
                objEvents[ev] = eventsOfDay[ev];
            }
        }
    });
    return objEvents;
}

function loadLabelsStat(sortedEvents, inpData) {
    legendStat.innerHTML = '';
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    sortedEvents.forEach(ev => {
        let pLabel = document.createElement('div');
        pLabel.classList.add('EventDay');
        legendStat.append(pLabel);

        let eventLabel = document.createElement('div');
        eventLabel.classList.add('EventLabel');
        eventLabel.style.backgroundColor = allEvents[ev[0]].color;
        eventLabel.textContent = decodeURIComponent(allEvents[ev[0]].name);
        pLabel.append(eventLabel);

        let eventMinutes = document.createElement('div');
        eventMinutes.classList.add('MinutesDiv');
        eventMinutes.textContent = ' ' + ev[1] + ' мин ';
        pLabel.append(eventMinutes);
    });
}

function loadStatData(inpData, dateFrom = '', dateTo = '') {
    return new Promise((resolve, reject) => {
        let arrOfDays = getRange(dateFrom, dateTo, inpData);
        loadProgressLines(inpData, progressLinesStat, arrOfDays, "DateStat");
        let objEvents = getMinutesSumOfEvents(arrOfDays, inpData);
        let sortedObjEvents = Object.entries(objEvents).sort((a, b) => b[1] - a[1]);
        loadLabelsStat(sortedObjEvents, inpData); 
        resolve(0);
    });
}

function loadProgressLinesOfDay(eventsOfDay, allEvents) {
    for (let ev in eventsOfDay) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        let pEv = document.createElement('div');
        pEv.classList.add('EventDay');
        pEv.id = ev + '_day';
        eventsDay.append(pEv);

        let eventLabel = document.createElement('div');
        eventLabel.classList.add('EventLabel');
        eventLabel.style.backgroundColor = allEvents[ev].color;
        eventLabel.textContent = decodeURIComponent(allEvents[ev].name);
        pEv.append(eventLabel);

        let eventMinutes = document.createElement('div');
        eventMinutes.classList.add('MinutesDiv');
        eventMinutes.textContent = ' ' + eventsOfDay[ev] + ' мин ';
        pEv.append(eventMinutes);

        let spanEventRemove = document.createElement('div');
        spanEventRemove.classList.add('DayEventRemove');
        pEv.append(spanEventRemove);

        let aEv = document.createElement('a');
        aEv.href = '#';
        aEv.textContent = '[удалить]';
        aEv.classList.add('DayEventRemoveA');
        spanEventRemove.append(aEv);
    }
}

function openDayEditor(day) {
    dialogDayEditor.showModal();
    eventsDay.innerHTML = '';
    let eventsOfDay = loadDayData(LOC_STOR, day);
    headDay.textContent = eventsOfDay["localDate"];
    dialogDayEditor.dataset.day = day;
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"));
    loadProgressLinesOfDay(eventsOfDay, allEvents);
    setEventListenersForEventRemove();
}

function setNewId(allEvents) {
    // в if`е времянка для тех пользователей которые уже используют
    // приложение, когда еще не была была введена idLength  
    if (!LOC_STOR.getItem("idLength")) {
        let tempId = 0;
        for (let ev in allEvents) {
            ev = Number(ev.replace('id',''));
            if (ev >= tempId) {
                tempId = ev;
            }
        }
        LOC_STOR.setItem("idLength", tempId);
    }

    let idNum = Number(LOC_STOR.getItem("idLength")) + 1;
    return idNum;
}

function newEvent() {
    let inpColor = inputColor.value;
    let inpNewEvent = inputNewEvent.value;
    if (inpNewEvent != "") {
        let allEvents = (LOC_STOR.getItem("allEvents")) ? JSON.parse(LOC_STOR.getItem("allEvents")) : {};
        let newIdNum = setNewId(allEvents);
        let newId = 'id' + String(newIdNum);

        if(allEvents[inpNewEvent]) {
            inputEvent.textContent = inpNewEvent;
        } else {
            let optionEv = new Option(inpNewEvent, newId, true, true);
            inputEvent.append(optionEv);
        }

        allEvents[newId] = {
            color: inpColor,
            name: encodeURIComponent(inpNewEvent),
        }

        LOC_STOR.setItem("allEvents", JSON.stringify(allEvents));
        LOC_STOR.setItem("idLength", newIdNum);
        dialogEventCreater.close();
    }
}

function openStat() {
    divWithScroll.style.height = '0vh';
    legendStat.innerHTML = '';
    progressLinesStat.innerHTML = '';
    dialogStat.showModal();

    btnShowDateRange.addEventListener('click', function() {
        let inpDateFrom = inputDateFrom.value;
        let inpDateTo = inputDateTo.value;
        divWithScroll.style.height = '50vh';
        loadStatData(LOC_STOR, inpDateFrom, inpDateTo);
    });
}

function getArrayOfKeysTimeStamp(arr) {
    let arrTS = arr.map((i) => {
        let date = new Date(i);
        return date.getTime();
    });
    return arrTS;
}

function getFirstIndex(inpFrom, arr, indStart) {
    if (inpFrom > arr[indStart]) {
        indStart = arr.findIndex(i => i >= inpFrom);
    }
    return indStart;
}

function getLastIndex(inpTo, arr, indStop) {
    if (inpTo < arr[indStop]) {
        indStop = arr.findLastIndex(i => {
        if(i == inpTo) {
            return i;
        } else if (i < inpTo) {
            return i - 1;
        }
        });
    }
    return indStop;
}

function getRange(fromDate = '', toDate = '', inpData) {
    let arr = getArrayOfKeys(inpData);
    arr.sort();
    let arrTS = getArrayOfKeysTimeStamp(arr);

    let inpFrom = new Date(fromDate);
    inpFrom = inpFrom.getTime();
    let inpTo = new Date(toDate);
    inpTo = inpTo.getTime();

    let indStart = 0;
    let indStop = arrTS.length - 1;

    if (inpTo < inpFrom ||
        inpFrom > arrTS[indStop] ||
        inpTo < arrTS[indStart]) {
        return [];
    }

    indStart = getFirstIndex(inpFrom, arrTS, indStart);
    indStop = getLastIndex(inpTo, arrTS, indStop);
    return arr.slice(indStart, indStop + 1);
}

function addJsonFileToLocStor(jsonData, allEvents) {
    let allEventsFromFile = JSON.parse(jsonData['allEvents']);
    let arr = getArrayOfKeys(jsonData);
    for (let day of arr) {
        if (LOC_STOR.getItem(day)) {
            continue;
        }
        LOC_STOR.setItem(day, jsonData[day]);
    }
    for (let ev in allEventsFromFile) {
        if (allEvents[ev]) {
            continue;
        }
        allEvents[ev] = allEventsFromFile[ev];
    }
    LOC_STOR.setItem("allEvents", JSON.stringify(allEvents));
}

function readFile(input) {
    if (input.type && !input.type.startsWith('application/json')) {
        return;
    }
    if (LOC_STOR.getItem("example")) {
        LOC_STOR.clear();
    }
    let reader = new FileReader();
    reader.readAsText(input);
    reader.addEventListener('load', () => {
        let jsonFileStr = reader.result;
        let jsonData = JSON.parse(jsonFileStr);
        let allEvents = (LOC_STOR.getItem("allEvents")) ? JSON.parse(LOC_STOR.getItem("allEvents")) : {};
        addJsonFileToLocStor(jsonData, allEvents);
        loadData(LOC_STOR)
            .then(() => setEventListenersForLabels())
            .then(() => setEventListenersForDays());
        document.getElementById('importJson').value = null;
    });
}