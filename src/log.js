window.onload = function() {
    loadLocalStorage();
}

const btnOpenAdd = document.getElementById("btnopenadd");
btnOpenAdd.onclick = addEvent;

const btnSave = document.getElementById("btnSave");
btnSave.onclick = saveToLocStor;

const btnClLoc = document.getElementById("btnclloc");
btnClLoc.onclick = clearLoc;

function clearLoc() {
    window.localStorage.clear();
    loadLocalStorage();
}

function addEvent() {
    const editPl = document.getElementById("editorPlace");
    if (editPl.style.display == "block") {
        editPl.style.display = "none";
    }
    else {
        editPl.style.display = "block";
    } 
}

function closeElem(elemId) {
    const elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function saveToLocStor() { 
    const storLocal = window.localStorage;

    const inputDate = document.getElementById("inputdate");
    const inputEvent = document.getElementById("inputevent");
    const inputTimeMin = document.getElementById("inputtimemin");
    const inputTimeHours = document.getElementById("inputtimehours");

    const inpDate = inputDate.value;
    const inpEvent = inputEvent.options[inputEvent.selectedIndex].value;
    const inpTimeMin = inputTimeMin.value;
    const inpTimeHours = inputTimeHours.value;

    const inpTime = (inpTimeMin || inpTimeHours);

    if (inpDate && inpEvent && inpTime) {
        let totalTime = 0;
        if (inpTimeMin) {
            totalTime += Number(inpTimeMin);
        }
        if (inpTimeHours) {
            totalTime += Number(inpTimeHours)*60;
        }
        const toProc = 70/1440; // разобраться потом и с процентами
        let newTime = Math.round(totalTime*toProc); // разобраться потом и с процентами

        let storLocValues;
        if (storLocal.getItem(inpDate)) {
            storLocValues = JSON.parse(storLocal.getItem(inpDate));
            if (inpEvent in storLocValues) {
                storLocValues[inpEvent] += newTime;
            }
            else{
                storLocValues[inpEvent] = newTime;
            }  
        }
        else{
            storLocValues = {};
            storLocValues[inpEvent] = newTime;
        }
        
        storLocal.setItem(inpDate, JSON.stringify(storLocValues));
        closeElem("editorPlace");
        loadLocalStorage();
    } 
}

function locStorToArr(locStor) {
    let arr = [];
    for (let i = 0; i < locStor.length; i++) {
        const locKey = localStorage.key(i);
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

    for (let i = 0; i < storLocal.length; i++) {
        const keyDate = arr[i];
        progMain.innerHTML +=`<div id='${keyDate}' class='Progress'></div>`;

        const dateId = document.getElementById(`${keyDate}`);
        dateId.innerHTML += `<span class='Date'>${keyDate}</span>`;

        let eventsValues = JSON.parse(storLocal.getItem(keyDate));
        for (ev in eventsValues) {
            const keyDateDiv = document.getElementById(keyDate);
            let eventId = keyDate + ev + "";
            keyDateDiv.innerHTML += `<span id='${eventId}' class='${ev}'></span>`;
            document.getElementById(eventId).style.width = eventsValues[ev] + "%";
        }
    }
}


