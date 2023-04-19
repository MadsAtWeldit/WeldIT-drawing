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
})(DrawingElementType || (DrawingElementType = {}));
class DrawingCanvas {
    constructor(elementId, options) {
        //Controller Change handler
        this.changeHandler = (e) => {
            let colorPicker = document.getElementById("color");
            let pencilWidthPicker = document.getElementById("lineWidth");
            const target = e.target;
            const context = this.context;
            if (this.colorPicker) {
                colorPicker = this.colorPicker;
            }
            if (this.pencilWidthPicker) {
                pencilWidthPicker = this.pencilWidthPicker;
            }
            //Check if targetId matches the element id
            if (target.id === colorPicker.id) {
                context.strokeStyle = target.value;
            }
            if (target.id === pencilWidthPicker.id) {
                context.lineWidth = Number(target.value);
            }
        };
        //Controller Clear canvas
        this.clickHandler = (e) => {
            let pen = document.getElementById("pen");
            let eraser = document.getElementById("eraser");
            let clearCanvas = document.getElementById("clear");
            const context = this.context;
            const target = e.target;
            if (this.pencil) {
                pen = this.pencil;
            }
            if (this.eraser) {
                eraser = this.eraser;
            }
            if (this.clearCanvas) {
                clearCanvas = this.clearCanvas;
            }
            //Clear
            if (target.id === clearCanvas.id) {
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            //Pencil
            if (target.id === pen.id) {
                console.log(target.id);
                eraser === null || eraser === void 0 ? void 0 : eraser.classList.remove("active");
                this.shouldErase = false;
                this.shouldDraw = true;
                pen === null || pen === void 0 ? void 0 : pen.classList.add("active");
            }
            //Eraser
            if (target.id === eraser.id) {
                pen === null || pen === void 0 ? void 0 : pen.classList.remove("active");
                this.shouldDraw = false;
                this.shouldErase = true;
                eraser === null || eraser === void 0 ? void 0 : eraser.classList.add("active");
            }
        };
        //Runs whenever mouse is clicked
        this.start = (e) => {
            const evtType = e.touches
                ? e.touches[0]
                : e;
            if (this.shouldErase) {
                this.context.globalCompositeOperation = "destination-out";
                this.isErasing = true;
                this.isDrawing = false;
            }
            else {
                this.context.globalCompositeOperation = "source-over";
                this.isDrawing = true;
                this.isErasing = false;
            }
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
        };
        //Runs whenever mouse is released
        this.stop = () => {
            this.isDrawing = false;
            this.isErasing = false;
            //Save stroke
            this.context.stroke();
            //New Path
            this.context.beginPath();
        };
        //Runs whenever mouse moves
        this.draw = (e) => {
            //IF we are not drawing or erasing
            if (!this.isDrawing && !this.isErasing)
                return;
            //Check if event has touch or mouse and assign accordingly
            const evtType = e.touches
                ? e.touches[0]
                : e;
            this.context.lineWidth = this.lineWidth;
            this.context.lineCap = "round";
            this.context.lineTo(evtType.clientX - this.canvas.offsetLeft, evtType.clientY - this.canvas.offsetTop);
            //Save stroke
            this.context.stroke();
        };
        //Get element access based on id passed
        const canvas = document.getElementById(elementId);
        const context = canvas.getContext("2d");
        //Check if any elements are passed
        if (options === null || options === void 0 ? void 0 : options.elements) {
            //IF any elements are passed
            //THEN look for identifier and execute query
            options.elements.forEach((element) => {
                switch (element.type) {
                    case "controller":
                        if (element.className) {
                            const controller = document.querySelector(element.className);
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
                            const pen = document.querySelector(element.className);
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
                            const eraser = document.querySelector(element.className);
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
                            const colorPicker = document.querySelector(element.className);
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
                            const pencilWidthPicker = document.querySelector(element.className);
                            this.pencilWidthPicker = pencilWidthPicker;
                        }
                        if (element.id) {
                            const pencilWidthPicker = document.getElementById(element.id);
                            this.pencilWidthPicker = pencilWidthPicker;
                        }
                        if (element.className && element.id) {
                            const pencilWidthPicker = document.getElementById(element.id);
                            this.pencilWidthPicker = pencilWidthPicker;
                        }
                        break;
                    case "clearCanvas":
                        if (element.className) {
                            const clearCanvas = document.querySelector(element.className);
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
                    default:
                        break;
                }
            });
        }
        //Check if width and height has been set
        (options === null || options === void 0 ? void 0 : options.width)
            ? (canvas.width = options.width)
            : (canvas.width = window.innerWidth - canvas.offsetLeft);
        (options === null || options === void 0 ? void 0 : options.height)
            ? (canvas.height = options.height)
            : (canvas.height = window.innerHeight - canvas.offsetTop);
        //Save canvas
        this.canvas = canvas;
        this.context = context;
        //Default values
        this.context.lineWidth = 5;
        this.context.strokeStyle = "black";
        //Add eventlisteners to canvas
        this.listen();
    }
    //Listen for events on given canvas
    listen() {
        const canvas = this.canvas;
        let controller = document.getElementById("toolbar");
        if (this.controller) {
            controller = this.controller;
        }
        canvas.addEventListener("mousedown", this.start);
        canvas.addEventListener("mouseup", this.stop);
        canvas.addEventListener("mousemove", this.draw);
        canvas.addEventListener("touchstart", this.start);
        canvas.addEventListener("touchend", this.stop);
        canvas.addEventListener("touchmove", this.draw);
        controller.addEventListener("change", this.changeHandler);
        controller.addEventListener("click", this.clickHandler);
    }
    log() {
        return console.log(this.canvas);
    }
}
new DrawingCanvas("drawing-board");
// type ElementTuple = [
//   { type: DrawingElementType; className?: string; id?: string }
// ];
//# sourceMappingURL=index.js.map