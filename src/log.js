"use strict"

const LOC_STOR = window.localStorage;

window.addEventListener('load', () => {
    loadData(LOC_STOR);
});

let openEventAdder = document.getElementById("openEventAdder");
let dialogEventAdder = document.getElementById("dialogEventAdder");
let dialogEventCreater = document.getElementById("dialogEventCreater");
let dialogLabelEditor = document.getElementById("dialogLabelEditor");
let inputDate = document.getElementById("inputDate");
let addEvent = document.getElementById("addEvent");
let addNewEvent = document.getElementById("addNewEvent");
let openNewEventCreater = document.getElementById("openNewEventCreater");
let changeLabel = document.getElementById("changeLabel");
let clearLocStor = document.getElementById("clearLocStor");
let foldLabelsWrapper = document.getElementById("foldLabelsWrapper");
let legend = document.getElementById("legend");
let showTogglerWrapper = document.getElementById("showTogglerWrapper");
let labels = document.getElementById("labels");
let foldSVG = document.getElementById("foldSVG");

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
    if(saveToLocStor()) {
        dialogEventAdder.close();
    }
});

openNewEventCreater.addEventListener('click', () => {
    dialogEventCreater.showModal();
});

addNewEvent.addEventListener('click', () => {
    newEvent();
});

changeLabel.addEventListener('click', () => {
    if(changeLocStor()) { // здесь можно использовать промисы
        dialogLabelEditor.close();
        loadData(LOC_STOR);
    }
});

clearLocStor.addEventListener('click', () => {
    clearLoc();
});


foldLabelsWrapper.addEventListener('click', function() {
    if (labels.style.height == "fit-content") {
        labels.style.height = "2rem";
        legend.style.height = "2rem";
        foldSVG.href.baseVal = "./dots.svg";
        foldLabelsWrapper.style.justifyContent = 'center';
        showTogglerWrapper.style.justifyContent = 'center';
    } else {
        labels.style.height = "fit-content";
        legend.style.height = "fit-content";
        foldSVG.href.baseVal = "./cross45.svg";
        foldLabelsWrapper.style.justifyContent = 'end';
        showTogglerWrapper.style.justifyContent = 'end';
    }
});

let foldLabels = document.getElementById("foldLabels");
foldLabels.addEventListener('mouseover', function() {
    foldLabels.style.background = 'rgba(255, 255, 255, 1)';
});
foldLabels.addEventListener('mouseout', function() {
    foldLabels.style.background = 'rgba(0, 0, 0, 0)';
});

openEventAdder.addEventListener('mouseover', function() {
    openEventAdder.style.background = 'rgba(50, 233, 120)';
});
openEventAdder.addEventListener('mouseout', function() {
    openEventAdder.style.background = 'rgba(124, 233, 157)';
});

let togglerCloseBeforeBtn = document.getElementById("togglerCloseBeforeBtn");
togglerCloseBeforeBtn.addEventListener('click', function() {
    toggler.style.display = 'none';
    let legend = document.getElementById("legend");
    legend.style.display = 'flex';
});

showTogglerWrapper.addEventListener('click', function() {
    let showToggler = document.getElementById("showToggler");
    let toggler = document.getElementById("toggler");
    let legend = document.getElementById("legend");
        toggler.style.display = 'flex';
        legend.style.display = 'none';
});

let showToggler = document.getElementById("showToggler");
showToggler.addEventListener('mouseover', function() {
    showToggler.style.background = 'rgba(255, 255, 255, 1)';
});
showToggler.addEventListener('mouseout', function() {
    showToggler.style.background = 'rgba(0, 0, 0, 0)';
});

let importJsonInput = document.getElementById('importJsonInput');
importJsonInput.addEventListener('change', (event) => {
    readFile(event.target.files[0]);
});

function loadData(inpData) {
    let arrDates = locStorToArr(inpData);
    arrDates.sort().reverse();

    let progressBarLines = document.getElementById("progressBarLines");
    progressBarLines.innerHTML = '';
    let mapEvents = new Map();
    let allEvents = JSON.parse(inpData.getItem("allEvents"));
    let tempBarWidth = 0;

    for (let day of arrDates) {
        let eventsOfDay = JSON.parse(inpData.getItem(day));

        let dayDiv = document.createElement('div');
        dayDiv.classList.add("Progress");
        dayDiv.id = day;
        progressBarLines.append(dayDiv);

        let dayP = document.createElement('p');
        dayP.classList.add("Date");
        dayP.textContent = eventsOfDay["localDate"];
        let weekDay = new Date(day).getDay();
        if (weekDay == 0 || weekDay == 6) {
            dayP.style.color = 'rgb(45, 170, 13)';
        }

        dayP.addEventListener('click', function() {
            openDayEditor(day);
        });
        dayDiv.append(dayP);

        let eventP = document.createElement('p');
        eventP.classList.add("common2");
        eventP.id = day + 'prog';
        dayDiv.append(eventP);

        let comTime = 0;

        for (let ev in eventsOfDay) {
            if (ev == "freeTime" || ev == "localDate") {
                continue;
            }
            mapEvents.set(ev, allEvents[ev]);
            let eventIdName = eventsOfDay["localDate"] + ev;

            let eventSpan = document.createElement('span');
            eventSpan.classList.add("common");
            eventSpan.id = encodeURI(eventIdName);
            eventSpan.style.backgroundColor = allEvents[ev].color;

            let time = Number(eventsOfDay[ev]) * (100/1440);
            eventSpan.style.width = time + "%";
            eventP.append(eventSpan);
            comTime += time;
        }
        
        if (comTime >= tempBarWidth) {
            tempBarWidth = comTime;
        }
    }

    for (let i of document.getElementsByClassName("common")) {
        i.style.width = parseFloat(i.style.width)*(100/tempBarWidth) + '%';
    }

    let inpEv = document.getElementById("inputEvent");
    inpEv.innerHTML = '';   // чистка
    let optionEv = document.createElement('option');
    optionEv.value = '0';
    optionEv.textContent = 'Выберите событие';
    inpEv.append(optionEv);

    let legend = document.getElementById("labels");
    let eventColors = {};
    legend.innerHTML = '';
    for (let s of mapEvents.keys()) {

        let optionEv = document.createElement('option');
        optionEv.value = s;
        optionEv.textContent = allEvents[s].name;
        inpEv.append(optionEv);

        let divEvLavel = document.createElement('div');
        divEvLavel.classList.add("legendLabel");
        divEvLavel.style.background = mapEvents.get(s).color;
        divEvLavel.textContent = allEvents[s].name;
        divEvLavel.id = 'legend_'+s;
        legend.append(divEvLavel);
        
        divEvLavel.addEventListener('click', function() {
            openLabelEditor(s);
        });

        eventColors[s] = mapEvents.get(s);
    }

    inpData.setItem("allEvents", JSON.stringify(eventColors));
}

function loadDayData(data, day) {
    return JSON.parse(data.getItem(day));
}

function openLabelEditor(label) {
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))
    let nameLabel = document.getElementsByClassName("nameLabel")[0];
    nameLabel.id = label+'_label';
    document.getElementById("inputNewLabel").value = allEvents[label].name;
    document.getElementById("inputNewColor").value = allEvents[label].color;
    dialogLabelEditor.showModal();
}

function changeLocStor() {
    let inpNewLabel = document.getElementById("inputNewLabel").value;
    let inpNewColor = document.getElementById("inputNewColor").value;
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))
    let changeId = document.getElementsByClassName("nameLabel")[0].id;
    changeId = changeId.split('_')[0];
    
    if (inpNewLabel == "") {
        return true;
    }

    allEvents[changeId] = {
        color: inpNewColor,
        name: inpNewLabel,
    }
    LOC_STOR.setItem("allEvents", JSON.stringify(allEvents));
    return true;
}

function openDayEditor(day) {
    let barsOfDay = document.getElementById("barsOfDay");
    let dialogDayEditor = document.getElementById("dialogDayEditor");
    let headDay = document.getElementById("headDay");
    let clDayA = document.getElementById("clDayA");


    dialogDayEditor.showModal();
    barsOfDay.innerHTML = '';

    let eventsOfDay = loadDayData(LOC_STOR, day);
    let allEvents = JSON.parse(LOC_STOR.getItem("allEvents"))

    headDay.textContent = eventsOfDay["localDate"];

    for (let ev in eventsOfDay) {
        if (ev == "freeTime" || ev == "localDate") {
            continue;
        }
        
        let pEv = document.createElement('p');
        pEv.id = encodeURI(ev) + 'mod';
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
            removeEvent(day, ev);
        });
        spanEv3.append(aEv);
    }
    
    clDayA.addEventListener('click', function() {
        removeItemFromLocStor(day);
    });
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
    let answer = confirm('Удалить все данные?');
    if (answer) {
        LOC_STOR.clear();
        loadData(LOC_STOR);
    }
}

function removeItemFromLocStor(day) {
    localStorage.removeItem(day);
    document.getElementById("dialogDayEditor").close();
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
            newId = 'id' + String(Object.keys(allEvents).length); //////////////
        }
        if(allEvents[inpNewEvent]) {
            inpEvent.textContent = inpNewEvent;
        } else {
            let optionEv = document.createElement('option');
            optionEv.value = newId;  ////////////
            optionEv.textContent = inpNewEvent;
            optionEv.selected = true;
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
    let dialogStat = document.getElementById("dialogStat");
    dialogStat.style.height = 'fit-content';
    let divWithScroll = document.getElementById("divWithScroll");
    divWithScroll.style.height = '0vh';
    dialogStat.showModal();

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

        divWithScroll.style.height = '50vh';

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
    // legendStat.style.paddingBottom = '1.5rem';
    for (let day of arrDatesRanged) {
        let eventsOfDay = JSON.parse(inpData.getItem(day));

        let dayDiv = document.createElement('div');
        dayDiv.classList.add("Progress");
        dayDiv.id = day;
        progressBarStat.append(dayDiv);

        let dayP = document.createElement('p');
        dayP.classList.add("DateStat");
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
            eventSpan.style.backgroundColor = allEvents[ev].color;
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

    let exportJsonLink = document.getElementById('exportJsonLink');
    exportJsonLink.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr));
    exportJsonLink.setAttribute('download', filename);
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
        document.getElementById('importJsonInput').value = null;
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
