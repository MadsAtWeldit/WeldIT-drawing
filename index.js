const canvas = document.getElementById('drawing-board');
const toolBar = document.getElementById("toolbar");

//Get drawing context of canvas
const ctx = canvas.getContext("2d");

//Get offsets of x and y of canvas
const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

//Set width and height of canvas to take all the space
canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isDrawing = false;
let lineWidth = 5;

//Vars for where drawing starts
let startX;
let startY;

//Will start once we move the mouse and painting is true
const draw = (e) => {
    if (!isDrawing) {
        return;
    }
    console.log("is drawing");
    //Set linewidth of canvas to linewidth
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    //Create a line to match the clients mousedown position
    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY);
    //And then set stroke
    ctx.stroke();
}



function clickHandle(e) {
    console.log("clicked");
    if (e.target.id === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

toolBar.addEventListener("click", clickHandle)

//Click events
// toolBar.addEventListener("click", (e) => {

//     if (e.target.id === "clear") {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }
// });


//Onchange event
toolBar.addEventListener("change", (e) => {
    if (e.target.id === "stroke") {
        console.log(e.target.value);
        ctx.strokeStyle = e.target.value;
    }
    if (e.target.id === "lineWidth") {
        lineWidth = e.target.value;
    }
});


canvas.addEventListener("mousedown", (e) => {

    //Start painting
    isDrawing = true;

    //Store the starting point of mousedown
    startX = e.clientX;
    startY = e.clientY;
    console.log("point was set by client");
});


canvas.addEventListener("mouseup", (e) => {

    //No longer painting
    isDrawing = false;

    //Save to canvas
    ctx.stroke();
    console.log("is now stroke");

    //Begin new path or "set new seperate path"
    ctx.beginPath();
})

canvas.addEventListener("mousemove", draw);

