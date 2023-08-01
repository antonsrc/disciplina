"use strict"

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
let foldLabelsWrapper = document.getElementById("foldLabelsWrapper");
let legend = document.getElementById("legend");
let showTogglerWrapper = document.getElementById("showTogglerWrapper");
let labels = document.getElementById("labels");
let foldSVG = document.getElementById("foldSVG");
let toggler = document.getElementById("toggler");
let closeTogglerWrapper = document.getElementById("closeTogglerWrapper");
let importJson = document.getElementById('importJson');
let inpNewLabelName = document.getElementById("inputNewLabel");
let inpNewLabelColor = document.getElementById("inputNewColor");
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

window.addEventListener('load', () => {
    loadData(LOC_STOR)
        .then(() => setEventListenersForLabels())
        .then(() => setEventListenersForDays());
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

foldLabelsWrapper.addEventListener('click', () => {
    if (foldSVG.href.baseVal == "./data/dots.svg") {
        labels.style.height = "fit-content";
        legend.style.height = "fit-content";
        foldSVG.href.baseVal = "./data/cross45.svg";
    } else {
        labels.style.height = "2rem";
        legend.style.height = "2rem";
        foldSVG.href.baseVal = "./data/dots.svg";
    }
});

showTogglerWrapper.addEventListener('click', () => {
    toggler.style.display = 'flex';
});

closeTogglerWrapper.addEventListener('click', () => {
    toggler.style.display = 'none';
});

importJson.addEventListener('change', (e) => {
    readFile(e.target.files[0]);
});

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
    document.querySelectorAll('.eventLabel').forEach(item => {
        item.addEventListener('click', e => {
            let idLabel = e.target.id.split('_')[1];
            openLabelEditor(idLabel);
        });
    });
}

function openLabelEditor(idLabel) {
        let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))
        dialogLabelEditor.dataset.id = idLabel;
        document.getElementById("inputNewLabel").value = allEvents[idLabel].name;
        document.getElementById("inputNewColor").value = allEvents[idLabel].color;
        dialogLabelEditor.showModal();
}

function changeLabelInLocStor() {
    return new Promise((resolve, reject) => {
        let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))
        let eventId = dialogLabelEditor.dataset.id;
        allEvents[eventId] = {
            color: inpNewLabelColor.value,
            name: inpNewLabelName.value,
        }
        LOC_STOR.setItem("allEvents", JSON.stringify(allEvents));
        resolve(0);
    });
}

function removeEventFromDay(day, e) {
    return new Promise((resolve, reject) => {
        let eventsOfDay = JSON.parse(LOC_STOR.getItem(day));
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
    let arr = Object.keys(inpData).filter(item => item != 'allEvents');
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
    arr = arr.filter(item => item.reason);
    for (let errorType of arr) {
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
    }
}

function saveToLocalSorage(arr) {
    return new Promise((resolve, reject) => {
        let eventsOfDay;
        let [date, ev, minutes] = arr.map(item => item.value);
        let inputDateLocal = document.getElementById("inputDate").valueAsDate.toLocaleDateString();
        if (LOC_STOR.getItem(date)) {
            eventsOfDay = JSON.parse(LOC_STOR.getItem(date));
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
        LOC_STOR.setItem(date, JSON.stringify(eventsOfDay));
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

        let eventSpan = document.createElement('span');
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

function updAllEvents(dates, inpData) {
    let newAllEvents = {};
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    for (let day of dates) {
        let eventsOfDay = JSON.parse(inpData.getItem(day));
        for (let ev in eventsOfDay) {
            newAllEvents[ev] = allEvents[ev];
        }
    }
    inpData.setItem("allEvents", JSON.stringify(newAllEvents));
}

function resizeAllLines(className, dataWidth, progressLinesTag) {
    for (let i of progressLinesTag.getElementsByClassName(className)) {
        i.style.width = parseFloat(i.style.width)*(100/dataWidth) + '%';
    }
}

function loadProgressLines(inpData, linesTag, arrDays) {
    // let arrDates = getArrayOfKeys(inpData);
    // arrDates.sort().reverse();
    linesTag.innerHTML = '';
    let tempMaxWidth = 0;
    for (let day of arrDays) {
        let eventsOfDay = JSON.parse(inpData.getItem(day));
        let dayLine = document.createElement('div');
        dayLine.classList.add("Progress");
        linesTag.append(dayLine);

        let dayP = document.createElement('p');
        dayP.classList.add("Date");
        dayP.id = 'date_' + day;
        dayP.textContent = eventsOfDay["localDate"];
        changeTextColorIfWeekend(day, dayP);
        dayLine.append(dayP);

        let eventsP = document.createElement('p');
        eventsP.classList.add("eventsLines");
        dayLine.append(eventsP);
        tempMaxWidth = loadLineOfDay(eventsOfDay, eventsP, inpData, tempMaxWidth);
    }
    updAllEvents(arrDays, inpData);
    resizeAllLines("line", tempMaxWidth, progressLines);
}

function loadSelectionMenu(selectTag, inpData) {
    selectTag.innerHTML = '';   // clean menu
    let mainOptionEv = document.createElement('option');
    mainOptionEv.value = '0';
    mainOptionEv.textContent = 'Выберите событие';
    selectTag.append(mainOptionEv);
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    for (let ev in allEvents) {
        let optionEv = document.createElement('option');
        optionEv.value = ev;
        optionEv.textContent = allEvents[ev].name;
        selectTag.append(optionEv);
    }
}

function loadLabels(inpData, labelsTag) {
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    labelsTag.innerHTML = '';
    for (let ev in allEvents) {
        let divEvLavel = document.createElement('div');
        divEvLavel.classList.add("eventLabel");
        divEvLavel.style.background = allEvents[ev].color;
        divEvLavel.textContent = allEvents[ev].name;
        divEvLavel.id = 'legend_'+ev;
        labelsTag.append(divEvLavel);
    }
}

function loadData(inpData, dateFrom = '', dateTo = '') {
    return new Promise((resolve, reject) => {
        let arrDates = getArrayOfKeys(inpData);
        arrDates.sort().reverse();
        loadProgressLines(inpData, progressLines, arrDates);
        loadSelectionMenu(inputEvent, inpData);
        loadLabels(inpData, labels);
        resolve(0);
    });
}




function loadStatData(inpData, dateFrom = '', dateTo = '') {
    return new Promise((resolve, reject) => {
        let arrDates = getArrayOfKeys(inpData);
        arrDates.sort();
        let arrDatesRanged = getRange(dateFrom, dateTo, arrDates);

        let mapEvents = new Map();
        let allEvents = JSON.parse(inpData.getItem("allEvents"));
        

        progressLinesStat.innerHTML = '';   ////////
        let tempMaxWidth = 0;
        for (let day of arrDatesRanged) {   /////////
            let eventsOfDay = JSON.parse(inpData.getItem(day));
            let dayLine = document.createElement('div');
            dayLine.classList.add("Progress");
            progressLinesStat.append(dayLine);

            let dayP = document.createElement('p');
            dayP.classList.add("DateStat");     ///////////
            dayP.textContent = eventsOfDay["localDate"];
            changeTextColorIfWeekend(day, dayP);
            dayLine.append(dayP);

            let eventsP = document.createElement('p');
            eventsP.classList.add("eventsLines");
            dayLine.append(eventsP);
            tempMaxWidth = loadLineOfDay(eventsOfDay, eventsP, inpData, tempMaxWidth);
            
            for (let ev in eventsOfDay) {
                if (ev == "freeTime" || ev == "localDate") {
                    continue;
                }
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
                let pEvLavel = document.createElement('p');
                pEvLavel.id = s[0] + 'stat';
                legend.append(pEvLavel);

                let spanEv2 = document.createElement('span');
                spanEv2.classList.add('legendLabelDaySt');
                spanEv2.style.backgroundColor = s[1][0].color;
                spanEv2.textContent = s[1][0].name;
                pEvLavel.append(spanEv2);

                let spanEv = document.createElement('span');
                spanEv.textContent = ' ' + s[1][1] + ' мин ';
                pEvLavel.append(spanEv);

            }
           
        }
        resizeAllLines("line", tempMaxWidth, progressLinesStat);
        resolve(0);
    });
}

function openDayEditor(day) {
    let barsOfDay = document.getElementById("barsOfDay");
    dialogDayEditor.showModal();
    barsOfDay.innerHTML = '';

    let eventsOfDay = loadDayData(LOC_STOR, day);
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))

    headDay.textContent = eventsOfDay["localDate"];
    dialogDayEditor.dataset.day = day;

    for (let ev in eventsOfDay) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        
        let pEv = document.createElement('p');
        pEv.id = ev + '_day';
        pEv.style.marginBottom = '1rem';
        pEv.style.marginTop = '1rem';
        barsOfDay.append(pEv);

        let spanEv2 = document.createElement('span');
        spanEv2.classList.add('legendLabelDay');
        spanEv2.style.backgroundColor = allEvents[ev].color;
        spanEv2.textContent = allEvents[ev].name;
        pEv.append(spanEv2);

        let spanEv = document.createElement('span');
        spanEv.textContent = ' ' + eventsOfDay[ev] + ' мин ';
        pEv.append(spanEv);

        let spanEv3 = document.createElement('span');
        spanEv3.classList.add('clDayEv');
        pEv.append(spanEv3);

        let aEv = document.createElement('a');
        aEv.href = '#';
        aEv.textContent = '[удалить]';
        aEv.classList.add('clDayEvA');
        aEv.addEventListener('click', function() {
            removeEventFromDay(day, ev)
                .then(() => loadData(LOC_STOR))
                .then(() => setEventListenersForLabels())
                .then(() => setEventListenersForDays());
        });
        spanEv3.append(aEv);
    }
}

function newEvent() {
    let inpNewEvent = document.getElementById("inputNewEvent").value;
    if (inpNewEvent != "") {
        let inpColor = document.getElementById("inputColor").value;
        let inpEvent = document.getElementById("inputEvent");
        let allEvents = (LOC_STOR.getItem("allEvents")) ? JSON.parse(LOC_STOR.getItem("allEvents")) : {};

        let newId;
        if (Object.keys(allEvents).length == undefined) {
            newId = 'id0';
        }
        else {
            let idNum = Object.keys(allEvents).length;
            while (allEvents.hasOwnProperty('id' + String(idNum))) {
                console.log('dfd');
                idNum++;
            }
            newId = 'id' + String(idNum);
        }
        if(allEvents[inpNewEvent]) {
            inpEvent.textContent = inpNewEvent;
        } else {
            let optionEv = new Option(inpNewEvent, newId, true, true);
            inpEvent.append(optionEv);
        }

        allEvents[newId] = {
            color: inpColor,
            name: inpNewEvent,
        }
        LOC_STOR.setItem("allEvents", JSON.stringify(allEvents));

        dialogEventCreater.close();
    }
}

function openStat() {
    let dialogStat = document.getElementById("dialogStat");
    dialogStat.style.height = 'fit-content';
    let divWithScroll = document.getElementById("divWithScroll");
    divWithScroll.style.height = '0vh';
    dialogStat.showModal();

    let progressLinesStat = document.getElementById("progressLinesStat");
    let legend = document.getElementById("legendStat");
    legend.innerHTML = '';
    progressLinesStat.innerHTML = '';

    let inputDateFrom = document.getElementById("inputDateFrom");
    let inputDateTo = document.getElementById("inputDateTo");

    let btnShowDateRange = document.getElementById("btnShowDateRange");
    btnShowDateRange.addEventListener('click', function() {
        legend.innerHTML = '';
        let inpDateFrom = inputDateFrom.value;
        let inpDateTo = inputDateTo.value;

        divWithScroll.style.height = '50vh';

        loadStatData(LOC_STOR, inpDateFrom, inpDateTo);
    });
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
        loadData(LOC_STOR)
            .then(() => setEventListenersForLabels())
            .then(() => setEventListenersForDays());
        document.getElementById('importJson').value = null;
    };
    reader.onerror = function() {
        console.log(reader.error);
    };
}