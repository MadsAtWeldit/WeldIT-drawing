"use strict";
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
    DrawingElementType["rectangle"] = "rectangle";
})(DrawingElementType || (DrawingElementType = {}));
class DrawingCanvas {
    constructor(elementId, options) {
        var _a;
        //Elements for controlling canvas props
        this.controller = document.getElementById("toolbar");
        this.pencil = document.getElementById("pencil");
        this.eraser = document.getElementById("eraser");
        this.colorPicker = document.getElementById("color");
        this.lineWidthPicker = document.getElementById("lineWidth");
        this.clearCanvas = document.getElementById("clear");
        this.moveAndResize = document.getElementById("mv-rz");
        this.undo = document.getElementById("undo");
        this.rectangle = document.getElementById("rectangle");
        //States for tracking drawing data
        this.index = -1;
        this.drawingData = [];
        //Runs for each element passed to options
        this.storeElements = (currentElement) => {
            //Loop through class props
            Object.keys(this).map((currentProp) => {
                //IF elements type is same as prop
                if (currentElement.type === currentProp) {
                    //THEN store THAT prop to be used as a index accessor when assigning value to this.(prop)
                    const propName = currentProp;
                    //Check if current has a classname and query corresponding element
                    if (currentElement.className) {
                        const element = document.querySelector("." + currentElement.className);
                        //Same as saying this.element = element
                        this.setElement(propName, element);
                    }
                    if (currentElement.id) {
                        const element = document.getElementById(currentElement.id);
                        this.setElement(propName, element);
                    }
                }
            });
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
            const rectangle = this.rectangle;
            const context = this.context;
            //We know that controller expects buttons for click functions
            const target = e.target;
            //Check if any element could be found from either options or default
            if (clearCanvas) {
                //Returns true if target is equal to element
                this.compareTargetToElement(target, clearCanvas, () => {
                    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.index = -1;
                    this.drawingData = [];
                });
            }
            if (undo) {
                this.compareTargetToElement(target, undo, () => {
                    //IF index is at 0 when we undo
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
                });
            }
            if (pen) {
                this.compareTargetToElement(target, pen, () => {
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.remove("active");
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.remove("active");
                    rectangle === null || rectangle === void 0 ? void 0 : rectangle.classList.remove("active");
                    this.shouldErase = false;
                    this.shouldMoveAndResize = false;
                    this.shouldDraw = true;
                    //Add classList to indicate active tool
                    pen === null || pen === void 0 ? void 0 : pen.classList.add("active");
                });
            }
            if (eraser) {
                this.compareTargetToElement(target, eraser, () => {
                    pen === null || pen === void 0 ? void 0 : pen.classList.remove("active");
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.remove("active");
                    rectangle === null || rectangle === void 0 ? void 0 : rectangle.classList.remove("active");
                    this.shouldDraw = false;
                    this.shouldMoveAndResize = false;
                    this.shouldErase = true;
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.add("active");
                });
            }
            if (moveAndResize) {
                this.compareTargetToElement(target, moveAndResize, () => {
                    pen === null || pen === void 0 ? void 0 : pen.classList.remove("active");
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.remove("active");
                    rectangle === null || rectangle === void 0 ? void 0 : rectangle.classList.remove("active");
                    this.shouldErase = false;
                    this.shouldDraw = false;
                    this.shouldMoveAndResize = true;
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.add("active");
                });
            }
            if (rectangle) {
                this.compareTargetToElement(target, rectangle, () => {
                    pen === null || pen === void 0 ? void 0 : pen.classList.remove("active");
                    eraser === null || eraser === void 0 ? void 0 : eraser.classList.remove("active");
                    moveAndResize === null || moveAndResize === void 0 ? void 0 : moveAndResize.classList.remove("active");
                    this.shouldErase = false;
                    this.shouldDraw = false;
                    this.shouldMoveAndResize = true;
                    rectangle === null || rectangle === void 0 ? void 0 : rectangle.classList.add("active");
                });
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
        //Check if any elements are passed
        if (options === null || options === void 0 ? void 0 : options.elements) {
            //IF any elements are passed
            //THEN loop through each element and reassign element props
            // options.elements.forEach((element) => this.storeElements(element));
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
        (_a = this.pencil) === null || _a === void 0 ? void 0 : _a.classList.add("active");
        this.shouldDraw = true;
        //Add eventlisteners to canvas
        this.listen();
    }
    //Since element props are read only we have to have method
    setElement(propName, element) {
        this[propName] = element;
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
    compareTargetToElement(target, element, callBack) {
        if ((target.id && target.id === element.id) ||
            (target.className && target.className === element.className)) {
            callBack();
        }
    }
}
new DrawingCanvas("drawing-board", {
    elements: [
        {
            type: DrawingElementType.rectangle,
            className: "rectanglea",
        },
        {
            type: DrawingElementType.pencil,
            id: "pencilID",
            className: "pencil",
        },
    ],
});
//# sourceMappingURL=index.js.map