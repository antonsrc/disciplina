window.onload = function() {
    // changeFirstTD();
    loadLocalStorage();
}

// function changeFirstTD() {
//     console.log("CALL function " + arguments.callee.name);
//     const fTD = document.getElementById("firstTD");
//     if (fTD.style.background == "aqua"){
//         fTD.style.background = "red";
//         console.log(fTD.clientWidth);
//         fTD.style.width = (fTD.clientWidth + 200) + "px";
//     }
//     else{
//         fTD.style.background = "aqua";
//         fTD.style.width = (fTD.clientWidth - 200) + "px";
//     }
// }

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
    const txtTime = document.getElementById("txtTime");
    if ((txtDate.value) && (txtType.value) && (txtTime.value)) {
        let dateType = txtDate.value + "_:_" + txtType.value;
        let newTime = "";
        if (stLocal.getItem(dateType)) {
            console.log(stLocal.getItem(dateType));
            newTime = Number(stLocal.getItem(dateType)) + Number(txtTime.value);
        }
        else {
            newTime = txtTime.value;
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
    const locStor = document.getElementById("locStor"); 

    let stLocal = window.localStorage;

    const progMain = document.getElementById("ProgressMain");
    progMain.innerHTML = "";
    for (let i = 0; i < stLocal.length; i++) {
        const key = localStorage.key(i);
        console.log(key);


        // progMain.innerHTML += "<div><span class='Date'>" + key.split("_:_")[0] + "</span>";
        
        if(key.split("_:_")[1] == "red") {
            
            progMain.innerHTML +=`<div class='Progress'><span class='Date'>` + key.split("_:_")[0] + "</span>" + `<span id="d${i}" class='Red'></span>`+"</div>";
            let idd = "d"+i;
            document.getElementById(idd).style.width = stLocal.getItem(key) + "px";
        }
        else if(key.split("_:_")[1] == "blue") {
            progMain.innerHTML +=`<div class='Progress'><span class='Date'>` + key.split("_:_")[0] + "</span>" + `<span id="d${i}" class='Blue'></span>`+"</div>";
            let idd = "d"+i;
            document.getElementById(idd).style.width = stLocal.getItem(key) + "px";
        }
        else if(key.split("_:_")[1] == "green") {
            progMain.innerHTML +=`<div class='Progress'><span class='Date'>` + key.split("_:_")[0] + "</span>" + `<span id="d${i}" class='Green'></span>`+"</div>";
            let idd = "d"+i;
            document.getElementById(idd).style.width = stLocal.getItem(key) + "px";
        }
        




        locStor.innerHTML += "<br>" + key + " " + stLocal.getItem(key);
    }
}