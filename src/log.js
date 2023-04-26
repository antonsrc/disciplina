"use strict"

window.addEventListener('load', function(){
    loadLocalStorage();
});

const modalSetEvent = document.getElementById("modalSetEvent");
const btnAddEvent = document.getElementById("btnAddEvent");
btnAddEvent.addEventListener('click', function(){
    modalSetEvent.showModal();
});

const btnSave = document.getElementById("btnSave");
btnSave.addEventListener('click', function(){
    if(saveToLocStor()){
        modalSetEvent.close();
    }
    else{
        // вызов функции с предупреждением
    }
});

const btnCancel = document.getElementById("btnCancel");
btnCancel.addEventListener('click', function(){
    modalSetEvent.close();
});

const modalNewEvent = document.getElementById("modalNewEvent");
const btnNewEvent = document.getElementById("btnNewEvent");
btnNewEvent.addEventListener('click', function(){
    modalNewEvent.showModal();
});

const btnNewEventCancel = document.getElementById("btnNewEventCancel");
btnNewEventCancel.addEventListener('click', function(){
    modalNewEvent.close();
});

const btnNewEventOk = document.getElementById("btnNewEventOk");
btnNewEventOk.addEventListener('click', function(){
    if(addNewEvent()){
        modalNewEvent.close();
    }
    else{
        // вызов функции с предупреждением
    }
});

const btnClearLocStor = document.getElementById("btnClearLocStor");
btnClearLocStor.addEventListener('click', function(){
    clearLoc();
});

























function saveToLocStor(){ 
    const locStor = window.localStorage;
    const inputEvent = document.getElementById("inputEvent");
    const inpDate = document.getElementById("inputDate").value;
    const inpEvent = inputEvent.options[inputEvent.selectedIndex].value;
    let inpTime = document.getElementById("inputTime").value.split(":");
    
    inpTime = validTimeValues(inpTime);
    const inpHours = +inpTime[0];
    const inpMins = +inpTime[1];



    let inputError = false;
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.innerHTML = "";

    if (inpDate == ""){
        errorMessage.innerHTML += "Выберите дату";
        inputError = true;
    }

    if ( (inpEvent == "") || (inpEvent == "0") ){
        errorMessage.innerHTML += "<br>Выберите или введите событие";
        inputError = true;
    } 



    let totalTime = 0;
    if ((inpMins == 0) && (inpHours == 0) ){
        errorMessage.innerHTML += "<br>Введите время";
        inputError = true;
    } else {
        if (inpMins){
            totalTime += Number(inpMins);
        }
        if (inpHours){
            totalTime += Number(inpHours)*60;
        }

        if ( (locStor.getItem(inpDate) === null) && (totalTime >= 1440) ){
            errorMessage.innerHTML += "<br>Введите время меньшее чем 24 ч";
            inputError = true;
        } else if (locStor.getItem(inpDate)){
            let storLocValues = JSON.parse(locStor.getItem(inpDate));
            if (Number(storLocValues["freeTime"]) - totalTime < 0){
                errorMessage.innerHTML += `<br>Свободного времени осталось ${storLocValues["freeTime"]} мин`;
                inputError = true;
            }
        }
    }

    
    if (inputError){
        errorMessage.style.display = "block";
        return false;
    } else {
        let storLocValues;
        if (locStor.getItem(inpDate)){
            storLocValues = JSON.parse(locStor.getItem(inpDate));
    


            if (inpEvent in storLocValues){
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

        locStor.setItem(inpDate, JSON.stringify(storLocValues));
        hideElement("errorMessage");
        loadLocalStorage();
        return true;
    } 
}





function locStorToArr(locSt){
    let arr = [];
    for (let i = 0; i < locSt.length; i++){
        const locKey = localStorage.key(i);
        if (locKey == "allEvents") continue;
        arr.push(locKey);
    }
    return arr;
}





function loadLocalStorage(){
    let locStor = window.localStorage;

    const progMain = document.getElementById("progressBarLines");
    progMain.innerHTML = "";

    let arr = locStorToArr(locStor);
    arr.sort();

    const toProc = 70/1440;






    let mapEv = new Map();


    for (let i = 0; i < arr.length; i++){
        const keyDate = arr[i];
        progMain.innerHTML +=`<div id='${keyDate}' class='Progress'></div>`;

        const dateId = document.getElementById(`${keyDate}`);
        dateId.innerHTML += `<span class='Date'>${keyDate}</span>`
        dateId.innerHTML += `<span class='btnRem'><a href="#" onclick="removeItemInLocStor('${keyDate}')"> x </a></span>`;

        let eventsValues = JSON.parse(locStor.getItem(keyDate));
        let colorsValues = JSON.parse(locStor.getItem("allEvents"))
        for (let ev in eventsValues){
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
    for (let s of mapEv.keys()){
        inpEv.innerHTML += `<option value="${s}">${s}</option>`;
        legend.innerHTML += `<span style='background: ${mapEv.get(s)}; padding: 8px; margin: 3px; border-radius: 15px;'>${s}</span>`;
    }
    legend.innerHTML += `</p>`;

}






function validTimeValues(time){
    let hours = time[0];
    let mins = time[1];
    if (!hours){
        hours = 0;
    }
    if (!mins){
        mins = 0;
    }
    return [hours, mins];
}

function clearLoc(){
    window.localStorage.clear();
    loadLocalStorage();
}

function removeItemInLocStor(e){
    localStorage.removeItem(e);
    loadLocalStorage();
}

function hideElement(elemId){
    const elem = document.getElementById(elemId);
    elem.style.display = "none";
}

function addNewEvent(){
    const locStor = window.localStorage;
    const inpEvent = document.getElementById("inputEvent");
    const inpColor = document.getElementById("inputColor").value;
    const inpNewEvent = document.getElementById("inputNewEvent").value;

    if (inpNewEvent != ""){
        let eventColors = (locStor.getItem("allEvents")) ? JSON.parse(locStor.getItem("allEvents")) : {};
        if(eventColors[inpNewEvent]){
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