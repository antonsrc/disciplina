window.onload = function() {
    loadLocalStorage();
}


function openAdderOfNewEvent() {
    console.log("CALL function " + arguments.callee.name);
    const editPl = document.getElementById("editorPlace");

    if (editPl.style.display == "block"){
        editPl.style.display = "none";
    }
    else {
        editPl.style.display = "block";
    } 
}


function btnSaveLoc() { 
    console.log("CALL function " + arguments.callee.name);
    let stLocal = window.localStorage;
    const txtDate = document.getElementById("txtDate");
    const selectEvent = document.getElementById("selectEvent");
    const obj = selectEvent.selectedOptions;
    let selEv = "";
    for (let i = 0; i < obj.length; i++) {
        selEv += obj[i].value;
    }


    const txtTimeMin = document.getElementById("txtTimeMin");
    const txtTimeHours = document.getElementById("txtTimeHours");
    if ((txtDate.value) && (selEv) && ((txtTimeMin.value) || (txtTimeHours.value))) {
        let dateType = txtDate.value + "_:_" + selEv;
        let comTime = 0;

        if (txtTimeMin.value) {
            comTime = Number(txtTimeMin.value);
        }

        if (txtTimeHours.value) {
            comTime += Number(txtTimeHours.value)*60;
        }

        const toProc = 70/1440;
        let newTime = Math.round(comTime*toProc);
        if (stLocal.getItem(dateType)) {
            console.log(stLocal.getItem(dateType));
            newTime = Number(stLocal.getItem(dateType)) + Math.round(comTime*toProc);
        }

        stLocal.setItem(dateType, newTime);

        const editPl = document.getElementById("editorPlace");
        editPl.style.display = "none";
        loadLocalStorage();
    } 

}


function loadLocalStorage() {
    console.log("CALL function " + arguments.callee.name);

    let stLocal = window.localStorage;

    const progMain = document.getElementById("ProgressMain");
    progMain.innerHTML = "";

    let arrSort = [];
    for (let i = 0; i < stLocal.length; i++) {
        const key = localStorage.key(i);
        arrSort.push(key);
    }
    arrSort.sort();

    for (let i = 0; i < stLocal.length; i++) {
        const key = arrSort[i];
        console.log(key);
        
        const keyDate = key.split("_:_")[0];
        const keyAction = key.split("_:_")[1];
        if (document.getElementById(keyDate)){
            const keyDateDiv = document.getElementById(keyDate);
            keyDateDiv.innerHTML += `<span id='${key}' class='${keyAction}'></span>`;
            document.getElementById(key).style.width = stLocal.getItem(key) + "%";
        }
        else{
            progMain.innerHTML +=`<div id='${keyDate}' class='Progress'><span class='Date'>${keyDate}</span><span id='${key}' class='${keyAction}'></span></div>`;
            document.getElementById(key).style.width = stLocal.getItem(key) + "%";
        }  
    }
}


function clearLoc() {
    window.localStorage.clear();
    loadLocalStorage();
}


