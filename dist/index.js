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
    DrawingElementType["text"] = "text";
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
        this.text = document.getElementById("text");
        this.rectangle = document.getElementById("rectangle");
        //For state tracking
        this.isDrawing = false;
        this.isErasing = false;
        this.isMovingAndResizing = false;
        this.isWriting = false;
        this.shouldDraw = false;
        this.shouldErase = false;
        this.shouldMoveAndResize = false;
        this.shouldWrite = false;
        //States for tracking drawing data
        this.index = -1;
        this.selectedPathIndex = null;
        //Create default path object
        this.pathObject = {
            path: new Path2D(),
            lineWidth: 5,
            strokeStyle: "black",
            operation: "source-over",
        };
        this.pathData = [];
        this.startX = 0;
        this.startY = 0;
        //Runs for each element passed to options
        this.storeElements = (currentElement) => {
            //Loop through class props
            Object.keys(this).map((currentProp) => {
                if (currentElement.type === currentProp) {
                    const classProp = currentProp;
                    if (currentElement.className) {
                        const element = document.querySelector("." + currentElement.className); //Needs to be intersection to safely assign to lhs
                        //Same as saying this.element = element
                        this.assignToProp(classProp, element);
                    }
                    if (currentElement.id) {
                        const element = document.getElementById(currentElement.id);
                        this.assignToProp(classProp, element);
                    }
                }
            });
        };
        //Controller Change handler
        this.changeHandler = (e) => {
            const target = e.target;
            const colorPicker = this.colorPicker;
            const lineWidthPicker = this.lineWidthPicker;
            const context = this.context;
            if (colorPicker && this.targetIs(colorPicker, target)) {
                //Change current path object strokeStyle
                this.pathObject.strokeStyle = target.value;
            }
            if (lineWidthPicker && this.targetIs(lineWidthPicker, target)) {
                this.pathObject.lineWidth = Number(target.value);
            }
        };
        //Controller click handler
        this.toolSelectHandler = (e) => {
            const target = e.target;
            const pen = this.pencil;
            const eraser = this.eraser;
            const clearCanvas = this.clearCanvas;
            const moveAndResize = this.moveAndResize;
            const undo = this.undo;
            const text = this.text;
            const context = this.context;
            if (clearCanvas && this.targetIs(clearCanvas, target)) {
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.index = -1;
                this.pathData = [];
            }
            if (undo && this.targetIs(undo, target)) {
                //IF index is at 0 when we undo
                if (this.index <= 0) {
                    //Then make canvas clean
                    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.index = -1;
                    this.pathData = [];
                }
                else {
                    //Remove last data
                    this.index -= 1;
                    this.pathData.pop();
                    //Clear and redraw paths
                    this.redraw(this.pathData);
                }
            }
            if (pen && this.targetIs(pen, target)) {
                this.handleToggle([{ element: pen, stateName: "shouldDraw" }], [
                    { element: eraser, stateName: "shouldErase" },
                    { element: moveAndResize, stateName: "shouldMoveAndResize" },
                    { element: text, stateName: "shouldWrite" },
                ]);
            }
            if (eraser && this.targetIs(eraser, target)) {
                this.handleToggle([{ element: eraser, stateName: "shouldErase" }], [
                    { element: pen, stateName: "shouldDraw" },
                    { element: moveAndResize, stateName: "shouldMoveAndResize" },
                    { element: text, stateName: "shouldWrite" },
                ]);
            }
            if (moveAndResize && this.targetIs(moveAndResize, target)) {
                this.handleToggle([{ element: moveAndResize, stateName: "shouldMoveAndResize" }], [
                    { element: pen, stateName: "shouldDraw" },
                    { element: eraser, stateName: "shouldErase" },
                    { element: text, stateName: "shouldWrite" },
                ]);
            }
            if (text && this.targetIs(text, target)) {
                this.handleToggle([{ element: text, stateName: "shouldWrite" }], [
                    { element: pen, stateName: "shouldDraw" },
                    { element: eraser, stateName: "shouldErase" },
                    { element: moveAndResize, stateName: "shouldMoveAndResize" },
                ]);
            }
        };
        //Runs whenever mouse is clicked
        this.pressDownHandler = (e) => {
            var _a;
            if (!this.isErasing)
                this.context.globalCompositeOperation = "source-over";
            if (this.isWriting)
                return;
            //Check if event is touch or mouse
            const evtType = e.touches
                ? e.touches[0]
                : e;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            //Store starting positions
            this.startX = mouseX;
            this.startY = mouseY;
            //Start path at click position
            (_a = this.pathObject.path) === null || _a === void 0 ? void 0 : _a.moveTo(mouseX, mouseY);
            //IF element has been selected when we click on canvas
            if (this.shouldErase) {
                this.pathObject.operation = "destination-out";
                this.isErasing = true;
                this.isDrawing = false;
                this.isMovingAndResizing = false;
                this.isWriting = false;
            }
            if (this.shouldDraw) {
                this.pathObject.operation = "source-over";
                this.isDrawing = true;
                this.isErasing = false;
                this.isMovingAndResizing = false;
                this.isWriting = false;
            }
            if (this.shouldMoveAndResize) {
                this.isMovingAndResizing = true;
                this.isDrawing = false;
                this.isErasing = false;
                this.isWriting = false;
                //IF no paths
                if (this.pathData.length <= 0)
                    return;
                this.pathData.forEach((path, i) => {
                    if (this.context.isPointInPath(path.path, mouseX, mouseY)) {
                        this.selectedPathIndex = i;
                    }
                    else {
                        return;
                    }
                });
            }
            if (this.shouldWrite) {
                const canvasContainer = (document.querySelector(".drawing-board"));
                //Create textinput
                const textInput = this.createPersonalElement("input", "text", {
                    position: "fixed",
                    top: `${evtType.clientY}px`,
                    left: `${evtType.clientX}px`,
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    "font-size": "30px",
                    "font-family": "sans-serif",
                });
                //We are now writing
                this.isWriting = true;
                this.isDrawing = false;
                this.isErasing = false;
                this.isMovingAndResizing = false;
                //Focus input
                window.setTimeout(() => textInput.focus(), 0);
                //Runs whenever we save text
                textInput.addEventListener("blur", () => {
                    this.context.textBaseline = "top";
                    this.context.font = "30px sans-serif";
                    this.context.fillText(textInput.value, mouseX, mouseY);
                    canvasContainer.removeChild(textInput);
                    this.isWriting = false;
                });
                textInput.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        textInput.blur();
                        this.index = this.incOrDec(this.index, "increment", 1);
                        // this.drawingData.push(
                        //   this.context.getImageData(
                        //     0,
                        //     0,
                        //     this.canvas.width,
                        //     this.canvas.height
                        //   )
                        // );
                    }
                });
                canvasContainer === null || canvasContainer === void 0 ? void 0 : canvasContainer.appendChild(textInput);
            }
            //Begin new path
            // this.context.beginPath();
        };
        //Runs whenever mouse is released
        this.mouseUpHandler = () => {
            if (this.isWriting)
                return;
            if (this.isMovingAndResizing) {
                this.isMovingAndResizing = false;
                this.selectedPathIndex = null;
                return;
            }
            this.isDrawing = false;
            this.isErasing = false;
            this.isMovingAndResizing = false;
            this.isWriting = false;
            //Increment to get current index
            this.index = this.incOrDec(this.index, "increment", 1);
            //Save pathdata
            this.pathData.push(this.pathObject);
            //Replace old path object with new
            this.pathObject = {
                path: new Path2D(),
                lineWidth: this.context.lineWidth,
                strokeStyle: String(this.context.strokeStyle),
                operation: "source-over",
            };
            this.redraw(this.pathData);
            //Save stroke
            // this.context.stroke();
            // this.context.closePath();
        };
        this.mouseMoveHandler = (e) => {
            var _a;
            //Check if event is touch or mouse
            const evtType = e.touches
                ? e.touches[0]
                : e;
            //Current mouse positions
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
            if (this.isMovingAndResizing) {
                //IF there is no selected element
                if (this.selectedPathIndex === null)
                    return;
                const dx = mouseX - this.startX;
                const dy = mouseY - this.startY;
                //Get current path
                const selectedPath = this.pathData[this.selectedPathIndex];
                //Create new path from existing path
                const newPath = new Path2D();
                const m = new DOMMatrix().translate(dx, dy);
                newPath.addPath(selectedPath.path, m);
                selectedPath.path = newPath;
                this.redraw(this.pathData);
                //Set start positions to current
                this.startX = mouseX;
                this.startY = mouseY;
            }
            if (!this.isDrawing && !this.isErasing)
                return;
            this.redraw(this.pathData);
            //Before stroking set lineWidth and color
            this.context.lineCap = "round";
            this.context.lineWidth = this.pathObject.lineWidth;
            this.context.strokeStyle = this.pathObject.strokeStyle;
            this.context.globalCompositeOperation = this.pathObject.operation;
            //Use the Path2D iface to make line for object
            (_a = this.pathObject.path) === null || _a === void 0 ? void 0 : _a.lineTo(mouseX, mouseY);
            //Draw a stroke according to the path
            this.context.stroke(this.pathObject.path);
        };
        this.createPersonalElement = (tagName, type, styles) => {
            const element = document.createElement(tagName);
            if (type)
                element.setAttribute("type", type);
            if (styles) {
                const stylings = [];
                for (const [k, v] of Object.entries(styles)) {
                    stylings.push(k + ":");
                    stylings.push(v + ";");
                }
                //Apply styles
                element.setAttribute("style", stylings.join(" "));
            }
            return element;
        };
        this.handleToggle = (activeElements, inactiveElements) => {
            activeElements.forEach((element) => {
                var _a;
                (_a = element.element) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                this[element.stateName] = true;
            });
            inactiveElements.forEach((element) => {
                var _a;
                (_a = element.element) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
                this[element.stateName] = false;
            });
        };
        //Select canvas element
        const canvas = document.getElementById(elementId);
        const context = canvas.getContext("2d");
        //Check if any elements are passed
        if (options === null || options === void 0 ? void 0 : options.elements) {
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
        this.canvas.style.cursor = "crosshair";
        (_a = this.pencil) === null || _a === void 0 ? void 0 : _a.classList.add("active");
        this.shouldDraw = true;
        //Add eventlisteners to canvas
        this.listen();
    }
    //Listen for events on given canvas
    listen() {
        const canvas = this.canvas;
        const controller = this.controller;
        canvas.addEventListener("mousedown", this.pressDownHandler);
        canvas.addEventListener("mouseup", this.mouseUpHandler);
        canvas.addEventListener("mousemove", this.mouseMoveHandler);
        canvas.addEventListener("touchstart", this.pressDownHandler);
        canvas.addEventListener("touchend", this.mouseUpHandler);
        canvas.addEventListener("touchmove", this.mouseMoveHandler);
        controller === null || controller === void 0 ? void 0 : controller.addEventListener("change", this.changeHandler);
        controller === null || controller === void 0 ? void 0 : controller.addEventListener("click", this.toolSelectHandler);
    }
    //Loop each pathObject and redraw corresponding Path2D
    redraw(pathData) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (pathData.length <= 0)
            return;
        pathData.forEach((path) => {
            this.context.lineWidth = path.lineWidth;
            this.context.strokeStyle = path.strokeStyle;
            this.context.globalCompositeOperation = path.operation;
            this.context.stroke(path.path);
        });
    }
    assignToProp(propName, element) {
        this[propName] = element;
    }
    targetIs(element, target) {
        if ((target.id && target.id === element.id) ||
            (target.className && target.className === element.className)) {
            return true;
        }
        else {
            return false;
        }
    }
    incOrDec(index, type, steps) {
        if (type === "increment") {
            return (index += steps);
        }
        else {
            return (index -= steps);
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
        },
    ],
});
//# sourceMappingURL=index.js.map