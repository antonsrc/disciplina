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
    const txtType = document.getElementById("txtType");
    const txtTimeMin = document.getElementById("txtTimeMin");
    const txtTimeHours = document.getElementById("txtTimeHours");
    if ((txtDate.value) && (txtType.value) && ((txtTimeMin.value) || (txtTimeHours.value))) {
        let dateType = txtDate.value + "_:_" + txtType.value;
        let comTime = 0;

        if (txtTimeMin.value) {
            comTime = Number(txtTimeMin.value);
        }

        if (txtTimeHours.value) {
            comTime += Number(txtTimeHours.value)*60;
        }

        let newTime = Math.round(comTime*(90/1440));
        if (stLocal.getItem(dateType)) {
            console.log(stLocal.getItem(dateType));
            newTime = Number(stLocal.getItem(dateType)) + Math.round(comTime*(90/1440));
        }

        
        stLocal.setItem(dateType, newTime);

        const editPl = document.getElementById("editorPlace");
        editPl.style.display = "none";
        loadLocalStorage();
    //   btnLoad.disabled = false; 
    } 

}


function loadLocalStorage() {
    console.log("CALL function " + arguments.callee.name);

    let stLocal = window.localStorage;

    const progMain = document.getElementById("ProgressMain");
    progMain.innerHTML = "";
    for (let i = 0; i < stLocal.length; i++) {
        const key = localStorage.key(i);
        console.log(key);
        
        if(key.split("_:_")[1] == "red") {
            progMain.innerHTML +=`<div class='Progress'><span class='Date'>` + key.split("_:_")[0] + "</span>" + `<span id="d${i}" class='Red'></span>`+"</div>";
            let idd = "d"+i;
            document.getElementById(idd).style.width = stLocal.getItem(key) + "%";
        }
        else if(key.split("_:_")[1] == "blue") {
            progMain.innerHTML +=`<div class='Progress'><span class='Date'>` + key.split("_:_")[0] + "</span>" + `<span id="d${i}" class='Blue'></span>`+"</div>";
            let idd = "d"+i;
            document.getElementById(idd).style.width = stLocal.getItem(key) + "%";
        }
        else if(key.split("_:_")[1] == "green") {
            progMain.innerHTML +=`<div class='Progress'><span class='Date'>` + key.split("_:_")[0] + "</span>" + `<span id="d${i}" class='Green'></span>`+"</div>";
            let idd = "d"+i;
            document.getElementById(idd).style.width = stLocal.getItem(key) + "%";
        }
        
    }
}


function clearLoc() {
    window.localStorage.clear();
    loadLocalStorage();
}