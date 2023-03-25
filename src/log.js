window.onload = function() {
    changeFirstTD();
}




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
    // editMainPl.innerHTML = "дата\nописание";
}

function eventOk() {
    console.log("CALL function " + arguments.callee.name);

    let editPl = document.getElementById("editorPlace");
    editPl.style.display = "none";
}






let stLocal = window.localStorage;
let txtDate = document.getElementById("txtDate");
let txtType = document.getElementById("txtType");
let txtTime = document.getElementById("txtTime");

let btnSave = document.getElementById("btnSave");

function btnSaveLoc() { 
    console.log("CALL function " + arguments.callee.name);

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
    //   stLocal.setItem("content", txtContent.value); 
    //   btnLoad.disabled = false; 
    } 







// var txtContent = document.getElementById("txtContent"); 
// var btnLoad = document.getElementById("btnLoad"); 
// btnLoad.disabled = !((stLocal.getItem("title")) && 
//                      (stLocal.getItem("content"))); 

// btnSave.addEventListener("click", function() { 
//   if ((txtDate.value) && (txtContent.value)) { 
//     stLocal.setItem("title", txtDate.value); 
//     stLocal.setItem("content", txtContent.value); 
//     btnLoad.disabled = false; 
//   } 
// }, false); 
// btnLoad.addEventListener("click", function() { 
//   txtDate.value = stLocal.getItem("title"); 
//   txtContent.value = stLocal.getItem("content"); 
// }, false); 
}


