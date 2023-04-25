"use strict";
// const canvas = <HTMLCanvasElement>document.getElementById("drawing-board");
const toolBar = document.getElementById("toolbar");
//Get context of canvas
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
// //Offset of canvas
// enum Offset {
//   X = canvas.offsetLeft,
//   Y = canvas.offsetTop,
// }
// //Set canvas width and height
// canvas.width = window.innerWidth - Offset.X;
// canvas.height = window.innerHeight - Offset.Y;
// let isDrawing: boolean;
// let lineWidth = 5;
// let startX: number;
// let startY: number;
// //Function runs whenever the mouse moves
// const draw = (e: MouseEvent) => {
//   if (!isDrawing) return;
//   console.log("drawing");
//   //Set linewidth and cap
//   ctx.lineWidth = lineWidth;
//   ctx.lineCap = "round";
//   //Create line based on client mouse position
//   ctx.lineTo(e.clientX - Offset.X, e.clientY);
//   //Set stroke
//   ctx.stroke();
// };
// //Listen for changes
// toolBar.addEventListener("change", (e) => {
//   //We know that target will be Input element so we type cast
//   const target = e.target as HTMLInputElement;
//   //IF Stroke
//   if (target.id === "stroke") {
//     //Set strokestyle
//     ctx.strokeStyle = target.value;
//   }
//   //IF Linewidth
//   if (target.id === "lineWidth") {
//     //Set linewidth
//     lineWidth = Number(target.value);
//   }
// });
// toolBar.addEventListener("click", (e) => {
//   const target = e.target as HTMLButtonElement;
//   if (target.id === "clear") {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//   }
// });
// //When mouse is held down
// canvas.addEventListener("mousedown", (e) => {
//   //Set drawing to true
//   isDrawing = true;
//   //Store starting point
//   startX = e.clientX;
//   startY = e.clientY;
//   console.log("starting point set");
// });
// //Whenever we let go of mouse
// canvas.addEventListener("mouseup", (e) => {
//   //No longer painting
//   isDrawing = false;
//   //Save stroke
//   ctx?.stroke();
//   //Set or begin new path
//   ctx?.beginPath();
// });
// //Listen for mousemove on canvas
// canvas.addEventListener("mousemove", draw);
var DrawingElementType;
(function (DrawingElementType) {
    DrawingElementType["controller"] = "controller";
    DrawingElementType["pencil"] = "pencil";
    DrawingElementType["eraser"] = "eraser";
    DrawingElementType["colorPicker"] = "colorPicker";
    DrawingElementType["lineWidth"] = "lineWidth";
    DrawingElementType["clearCanvas"] = "clearCanvas";
    DrawingElementType["moveAndResize"] = "moveAndResize";
    DrawingElementType["undo"] = "undo";
})(DrawingElementType || (DrawingElementType = {}));
class DrawingCanvas {
    constructor(elementId, options) {
        //States for tracking drawing data
        this.index = -1;
        this.drawingData = [];
        //Tries to select using default
        this.defaultStore = () => {
            const controller = document.getElementById("toolbar");
            if (controller)
                this.controller = controller;
            const pen = document.getElementById("pencil");
            if (pen)
                this.pencil = pen;
            const eraser = document.getElementById("eraser");
            if (eraser)
                this.eraser = eraser;
            const colorPicker = (document.getElementById("color"));
            if (colorPicker)
                this.colorPicker = colorPicker;
            const lineWidthPicker = (document.getElementById("lineWidth"));
            if (lineWidthPicker)
                this.lineWidthPicker = lineWidthPicker;
            const clearCanvas = (document.getElementById("clear"));
            if (clearCanvas)
                this.clearCanvas = clearCanvas;
            const moveAndResize = (document.getElementById("mv-rz"));
            if (moveAndResize)
                this.moveAndResize = moveAndResize;
            const undo = document.getElementById("undo");
            if (undo)
                this.undo = undo;
        };
        //Runs on each element in the options
        this.storeElements = (element) => {
            //Look for type
            switch (element.type) {
                //IF type is controller
                //THEN check if element has classname or id and query based on that
                case "controller":
                    if (element.className) {
                        const controller = document.querySelector("." + element.className);
                        this.controller = controller;
                    }
                    if (element.id) {
                        const controller = document.getElementById(element.id);
                        this.controller = controller;
                    }
                    if (element.className && element.id) {
                        const controller = document.getElementById(element.id);
                        this.controller = controller;
                    }
                    break;
                case "pencil":
                    if (element.className) {
                        const pen = document.querySelector("." + element.className);
                        this.pencil = pen;
                    }
                    if (element.id) {
                        const pen = document.getElementById(element.id);
                        this.pencil = pen;
                    }
                    if (element.className && element.id) {
                        const pen = document.getElementById(element.id);
                        this.pencil = pen;
                    }
                    break;
                case "eraser":
                    if (element.className) {
                        const eraser = document.querySelector("." + element.className);
                        this.eraser = eraser;
                    }
                    if (element.id) {
                        const eraser = document.getElementById(element.id);
                        this.eraser = eraser;
                    }
                    if (element.className && element.id) {
                        const eraser = document.getElementById(element.id);
                        this.eraser = eraser;
                    }
                    break;
                case "colorPicker":
                    if (element.className) {
                        const colorPicker = document.querySelector("." + element.className);
                        this.colorPicker = colorPicker;
                    }
                    if (element.id) {
                        const colorPicker = document.getElementById(element.id);
                        this.colorPicker = colorPicker;
                    }
                    if (element.className && element.id) {
                        const colorPicker = document.getElementById(element.id);
                        this.colorPicker = colorPicker;
                    }
                    break;
                case "lineWidth":
                    if (element.className) {
                        const lineWidthPicker = document.querySelector("." + element.className);
                        this.lineWidthPicker = lineWidthPicker;
                    }
                    if (element.id) {
                        const lineWidthPicker = document.getElementById(element.id);
                        this.lineWidthPicker = lineWidthPicker;
                    }
                    if (element.className && element.id) {
                        const lineWidthPicker = document.getElementById(element.id);
                        this.lineWidthPicker = lineWidthPicker;
                    }
                    break;
                case "clearCanvas":
                    if (element.className) {
                        const clearCanvas = document.querySelector("." + element.className);
                        this.clearCanvas = clearCanvas;
                    }
                    if (element.id) {
                        const clearCanvas = document.getElementById(element.id);
                        this.clearCanvas = clearCanvas;
                    }
                    if (element.className && element.id) {
                        const clearCanvas = document.getElementById(element.id);
                        this.clearCanvas = clearCanvas;
                    }
                    break;
                case "moveAndResize":
                    if (element.className) {
                        const moveAndResize = document.querySelector("." + element.className);
                        this.moveAndResize = moveAndResize;
                    }
                    if (element.id) {
                        const moveAndResize = document.getElementById(element.id);
                        this.moveAndResize = moveAndResize;
                    }
                    if (element.className && element.id) {
                        const moveAndResize = document.getElementById(element.id);
                        this.moveAndResize = moveAndResize;
                    }
                    break;
                case "undo":
                    if (element.className) {
                        const undo = document.querySelector("." + element.className);
                        this.undo = undo;
                    }
                    if (element.id) {
                        const undo = document.getElementById(element.id);
                        this.undo = undo;
                    }
                    if (element.className && element.id) {
                        const undo = document.getElementById(element.id);
                        this.undo = undo;
                    }
                    break;
                default:
                    break;
            }
        };
        //Controller Change handler
        this.changeHandler = (e) => {
            const colorPicker = this.colorPicker;
            const lineWidthPicker = this.lineWidthPicker;
            const target = e.target;
            const context = this.context;
            //IF any element can be found
            if (colorPicker) {
                if ((target.id && target.id === colorPicker.id) ||
                    (target.className && target.className === colorPicker.className)) {
                    context.strokeStyle = target.value;
                }
            }
            if (lineWidthPicker) {
                if ((target.id && target.id === lineWidthPicker.id) ||
                    (target.className && target.className === lineWidthPicker.className)) {
                    context.lineWidth = Number(target.value);
                }
            }
        };
        //Controller click handler
        this.clickHandler = (e) => {
            const pen = this.pencil;
            const eraser = this.eraser;
            const clearCanvas = this.clearCanvas;
            const moveAndResize = this.moveAndResize;
            const undo = this.undo;
            const context = this.context;
            //We know that controller expects buttons for click functions
            const target = e.target;
            //Check if any element could be found from either options or default
            if (clearCanvas) {
                //IF it can THEN check if it has id or class that is equal to the target
                if ((target.id && target.id === clearCanvas.id) ||
                    (target.className && target.className === clearCanvas.className)) {
                    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }
            if (undo) {
                if ((target.id && target.id === undo.id) ||
                    (target.className && target.className === undo.className)) {
                    //IF index is at 0 when we undo
                    console.log(this.index);
                    if (this.index <= 0) {
                        //Then make canvas clean
                        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.index = -1;
                        this.drawingData = [];
                    }
                    else {
                        //Remove last data and re render
                        this.index -= 1;
                        this.drawingData.pop();
                        context.putImageData(this.drawingData[this.index], 0, 0);
                    }
                }
            }
            if (pen) {
                if ((target.id && target.id === pen.id) ||
                    (target.className && target.className === pen.className)) {
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.remove("active");
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.remove("active");
                    this.shouldErase = false;
                    this.shouldMoveAndResize = false;
                    this.shouldDraw = true;
                    //Add classList to indicate active tool
                    pen === null || pen === void 0 ? void 0 : pen.classList.add("active");
                }
            }
            if (eraser) {
                if ((target.id && target.id === eraser.id) ||
                    (target.className && target.className === eraser.className)) {
                    pen === null || pen === void 0 ? void 0 : pen.classList.remove("active");
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.remove("active");
                    this.shouldDraw = false;
                    this.shouldMoveAndResize = false;
                    this.shouldErase = true;
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.add("active");
                }
            }
            if (moveAndResize) {
                if ((target.id && target.id === moveAndResize.id) ||
                    (target.className && target.className === moveAndResize.className)) {
                    pen === null || pen === void 0 ? void 0 : pen.classList.remove("active");
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.remove("active");
                    this.shouldErase = false;
                    this.shouldDraw = false;
                    this.shouldMoveAndResize = true;
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.add("active");
                }
            }
        };
        //Runs whenever mouse is clicked
        this.start = (e) => {
            //Check if event is touch or mouse
            const evtType = e.touches
                ? e.touches[0]
                : e;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            //If eraser has been selected
            if (this.shouldErase) {
                this.context.globalCompositeOperation = "destination-out";
                this.isErasing = true;
                this.isDrawing = false;
                this.isMovingAndResizing = false;
            }
            else if (this.shouldDraw) {
                this.context.globalCompositeOperation = "source-over";
                this.isDrawing = true;
                this.isErasing = false;
                this.isMovingAndResizing = false;
            }
            else {
                this.isMovingAndResizing = true;
                this.isDrawing = false;
                this.isErasing = false;
            }
            //Begin new path
            this.context.beginPath();
        };
        //Runs whenever mouse is released
        this.stop = () => {
            this.isDrawing = false;
            this.isErasing = false;
            this.isMovingAndResizing = false;
            //Get index and data from current stroke and save
            this.index++;
            this.drawingData.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
            //Save stroke
            this.context.stroke();
            this.context.closePath();
        };
        //Runs whenever mouse moves
        this.draw = (e) => {
            //Check if event is touch or mouse
            const evtType = e.touches
                ? e.touches[0]
                : e;
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
            // if (this.context.isPointInPath(mouseX, mouseY)) {
            //   console.log("yes");
            // } else {
            //   console.log("no");
            // }
            //IF we are not drawing or erasing
            if (!this.isDrawing && !this.isErasing && !this.isMovingAndResizing)
                return;
            this.context.lineCap = "round";
            this.context.lineTo(evtType.clientX - this.canvas.offsetLeft, evtType.clientY - this.canvas.offsetTop);
            //Save stroke
            this.context.stroke();
        };
        //Select canvas element
        const canvas = document.getElementById(elementId);
        const context = canvas.getContext("2d");
        //Try to save elements using hardcoded defaults
        this.defaultStore();
        //Check if any elements are passed
        if (options === null || options === void 0 ? void 0 : options.elements) {
            //IF any elements are passed
            //THEN loop through each element and reassign element props
            options.elements.forEach((element) => this.storeElements(element));
        }
        //Check if width and height has been set
        (options === null || options === void 0 ? void 0 : options.width)
            ? (canvas.width = options.width)
            : (canvas.width = window.innerWidth - canvas.offsetLeft);
        (options === null || options === void 0 ? void 0 : options.height)
            ? (canvas.height = options.height)
            : (canvas.height = window.innerHeight - canvas.offsetTop);
        //Save canvas and context
        this.canvas = canvas;
        this.context = context;
        //Assign default values
        this.context.lineWidth = 5;
        this.context.strokeStyle = "black";
        this.canvas.style.cursor = "crosshair";
        this.pencil.classList.add("active");
        this.shouldDraw = true;
        //Add eventlisteners to canvas
        this.listen();
    }
    //Listen for events on given canvas
    listen() {
        const canvas = this.canvas;
        const controller = this.controller;
        canvas.addEventListener("mousedown", this.start);
        canvas.addEventListener("mouseup", this.stop);
        canvas.addEventListener("mousemove", this.draw);
        canvas.addEventListener("touchstart", this.start);
        canvas.addEventListener("touchend", this.stop);
        canvas.addEventListener("touchmove", this.draw);
        controller === null || controller === void 0 ? void 0 : controller.addEventListener("change", this.changeHandler);
        controller === null || controller === void 0 ? void 0 : controller.addEventListener("click", this.clickHandler);
    }
    log() {
        return console.log(this.canvas);
    }
}
new DrawingCanvas("drawing-board");
//# sourceMappingURL=index.js.map