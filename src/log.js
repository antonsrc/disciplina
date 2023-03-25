changeFirstTD();

function changeFirstTD() {
    console.log("CALL function " + arguments.callee.name);

    var fTD = document.getElementById("firstTD");
    if (fTD.style.background == "aqua"){
        fTD.style.background = "red";
        console.log(fTD.clientWidth);
        fTD.style.width = (fTD.clientWidth + 200) + "px";
    }
    else{
        fTD.style.background = "aqua";
        fTD.style.width = (fTD.clientWidth - 200) + "px";
    }
}

function addNewEvent() {
    console.log("CALL function " + arguments.callee.name);

    let editPl = document.getElementById("editorPlace");
    let editMainPl = document.getElementById("editorMainPlace");
    editPl.style.display = "block";
    editMainPl.innerHTML = "дата\nописание";
}

function eventOk() {
    console.log("CALL function " + arguments.callee.name);

    let editPl = document.getElementById("editorPlace");
    editPl.style.display = "none";
}


