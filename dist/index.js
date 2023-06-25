"use strict";
//Values for different types of elements
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
    DrawingElementType["lineTool"] = "lineTool";
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
        this.lineTool = document.getElementById("lineTool");
        this.rectangle = document.getElementById("rectangle");
        //For state tracking
        this.isDrawing = false;
        this.isErasing = false;
        this.isMoving = false;
        this.isResizing = false;
        this.isWriting = false;
        this.isLining = false;
        this.shouldDraw = false;
        this.shouldErase = false;
        this.shouldMove = false;
        this.shouldResize = {
            toggled: false,
            from: "",
        };
        this.shouldLine = false;
        //Toggled states
        this.toggleDraw = false;
        this.toggleErase = false;
        this.toggleMvRz = false;
        this.toggleWrite = false;
        this.toggleLine = false;
        this.mouseIsDown = false;
        this.isDragging = false;
        this.index = -1;
        this.selectedDrawingIndex = null;
        //Create default path object
        this.pathObject = {
            type: "stroke",
            path: new Path2D(),
            resizedPath: null,
            lineWidth: 5,
            strokeStyle: "black",
            operation: "source-over",
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            resizedX1: 0,
            resizedY1: 0,
            resizedX2: 0,
            resizedY2: 0,
            xCords: [],
            yCords: [],
            resizedXCords: [],
            resizedYCords: [],
        };
        //Create default text object
        this.textObject = {
            type: "text",
            text: "",
            font: "30pt sans-serif",
            resizedFont: "",
            baseline: "top",
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            resizedX1: 0,
            resizedY1: 0,
            resizedX2: 0,
            resizedY2: 0,
            operation: "source-over",
        };
        //Create default line object
        this.lineObject = {
            type: "line",
            path: new Path2D(),
            resizedPath: null,
            lineWidth: 5,
            strokeStyle: "black",
            operation: "source-over",
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            resizedStartX: 0,
            resizedStartY: 0,
            resizedEndX: 0,
            resizedEndY: 0,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
        };
        this.drawingData = [];
        this.startX = 0;
        this.startY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
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
            this.selectedDrawingIndex = null;
            const target = e.target;
            const pen = this.pencil;
            const eraser = this.eraser;
            const clearCanvas = this.clearCanvas;
            const moveAndResize = this.moveAndResize;
            const undo = this.undo;
            const text = this.text;
            const lineTool = this.lineTool;
            const context = this.context;
            if (clearCanvas && this.targetIs(clearCanvas, target)) {
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.index = -1;
                this.drawingData = [];
            }
            if (undo && this.targetIs(undo, target)) {
                if (this.index <= 0) {
                    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.index = -1;
                    this.drawingData = [];
                }
                else {
                    this.index -= 1;
                    this.drawingData.pop();
                    this.redraw(this.drawingData);
                }
            }
            if (pen && this.targetIs(pen, target)) {
                this.canvas.style.cursor = "crosshair";
                this.handleToggle([{ element: pen, stateName: "toggleDraw" }], [
                    { element: eraser, stateName: "toggleErase" },
                    { element: moveAndResize, stateName: "toggleMvRz" },
                    { element: text, stateName: "toggleWrite" },
                    { element: lineTool, stateName: "toggleLine" },
                ]);
            }
            if (eraser && this.targetIs(eraser, target)) {
                this.canvas.style.cursor = "crosshair";
                this.handleToggle([{ element: eraser, stateName: "toggleErase" }], [
                    { element: pen, stateName: "toggleDraw" },
                    { element: moveAndResize, stateName: "toggleMvRz" },
                    { element: text, stateName: "toggleWrite" },
                    { element: lineTool, stateName: "toggleLine" },
                ]);
            }
            if (moveAndResize && this.targetIs(moveAndResize, target)) {
                this.canvas.style.cursor = "default";
                this.handleToggle([{ element: moveAndResize, stateName: "toggleMvRz" }], [
                    { element: pen, stateName: "toggleDraw" },
                    { element: eraser, stateName: "toggleErase" },
                    { element: text, stateName: "toggleWrite" },
                    { element: lineTool, stateName: "toggleLine" },
                ]);
            }
            if (text && this.targetIs(text, target)) {
                this.canvas.style.cursor = "text";
                this.handleToggle([{ element: text, stateName: "toggleWrite" }], [
                    { element: pen, stateName: "toggleDraw" },
                    { element: eraser, stateName: "toggleErase" },
                    { element: moveAndResize, stateName: "toggleMvRz" },
                    { element: lineTool, stateName: "toggleLine" },
                ]);
            }
            if (lineTool && this.targetIs(lineTool, target)) {
                this.canvas.style.cursor = "crosshair";
                this.handleToggle([{ element: lineTool, stateName: "toggleLine" }], [
                    { element: pen, stateName: "toggleDraw" },
                    { element: eraser, stateName: "toggleErase" },
                    { element: text, stateName: "toggleWrite" },
                    { element: moveAndResize, stateName: "toggleMvRz" },
                ]);
            }
        };
        //Runs whenever mouse is clicked
        this.pressDownHandler = (e) => {
            this.mouseIsDown = true;
            if (this.isWriting)
                return;
            //Check if event is touch or mouse
            const evtType = e.touches ? e.touches[0] : e;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            //Store starting positions
            this.startX = mouseX;
            this.startY = mouseY;
            //IF element has been selected when we click on canvas
            if (this.toggleErase) {
                this.pathObject.operation = "destination-out";
                this.shouldErase = true;
                this.addCoords(mouseX, mouseY, false);
            }
            if (this.toggleDraw) {
                this.pathObject.operation = "source-over";
                this.shouldDraw = true;
                this.addCoords(mouseX, mouseY, false);
            }
            if (this.toggleMvRz) {
                //IF no paths
                if (this.drawingData.length <= 0)
                    return;
                //Loop through each drawing
                this.drawingData.forEach((drawing, i) => {
                    if (this.selectedDrawingIndex !== null) {
                        const selected = this.drawingData[this.selectedDrawingIndex];
                        //Check selected drawing type
                        switch (selected.type) {
                            //IF its text or stroke
                            case "text":
                            case "stroke":
                                {
                                    //Get position of mouse within selected element
                                    const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, selected);
                                    //IF not within selection anymore
                                    if (!selectionPosition) {
                                        //Check if its in another drawing
                                        if (drawing.type === "stroke" || drawing.type === "line") {
                                            this.context.isPointInStroke(drawing.path, mouseX, mouseY)
                                                ? (this.selectedDrawingIndex = i)
                                                : (this.selectedDrawingIndex = null);
                                        }
                                        else if (drawing.type === "text") {
                                            this.mouseWithinSelection(mouseX, mouseY, drawing)
                                                ? (this.selectedDrawingIndex = i)
                                                : (this.selectedDrawingIndex = null);
                                        }
                                        return; //Return because we dont want to move or resize
                                    }
                                    //Check if posistion is in middle else corners
                                    if (selectionPosition === "m") {
                                        this.shouldMove = true;
                                    }
                                    else {
                                        this.shouldResize.toggled = true;
                                        this.shouldResize.from = selectionPosition;
                                    }
                                }
                                break;
                            case "line":
                                {
                                    //Get mouse position within selected element
                                    const selectionPosition = this.mouseWithinLineSelection(selected, mouseX, mouseY);
                                    //IF mouse is not within selected anymore
                                    if (!selectionPosition) {
                                        //Check if its in another drawing
                                        if (drawing.type === "stroke" || drawing.type === "line") {
                                            this.context.isPointInStroke(drawing.path, mouseX, mouseY)
                                                ? (this.selectedDrawingIndex = i)
                                                : (this.selectedDrawingIndex = null);
                                        }
                                        else if (drawing.type === "text") {
                                            this.mouseWithinSelection(mouseX, mouseY, drawing)
                                                ? (this.selectedDrawingIndex = i)
                                                : (this.selectedDrawingIndex = null);
                                        }
                                        return;
                                    }
                                    //IF in corner then we want to resize
                                    if (selectionPosition === "m") {
                                        this.shouldMove = true;
                                    }
                                    else {
                                        this.shouldResize.toggled = true;
                                        this.shouldResize.from = selectionPosition;
                                    }
                                }
                                break;
                        }
                        return;
                    }
                    switch (drawing.type) {
                        case "stroke":
                        case "line":
                            //For line and handdrawn we check if cursor is within stroke
                            if (this.context.isPointInStroke(drawing.path, mouseX, mouseY)) {
                                this.selectedDrawingIndex = i;
                                this.shouldMove = true;
                            }
                            break;
                        case "text":
                            //Since text is not handdrawn we check IF within selection block
                            if (this.mouseWithinSelection(mouseX, mouseY, drawing)) {
                                this.selectedDrawingIndex = i;
                                this.shouldMove = true;
                            }
                            break;
                    }
                });
            }
            if (this.toggleWrite) {
                const canvasContainer = document.querySelector(".drawing-board");
                //Create textinput
                const textInput = this.createPersonalElement("input", "text", {
                    position: "fixed",
                    top: `${evtType.clientY}px`,
                    left: `${evtType.clientX}px`,
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    "font-size": "30pt",
                    "font-family": "sans-serif",
                });
                //We are now writing
                this.isWriting = true;
                //Focus input
                window.setTimeout(() => textInput.focus(), 0);
                //Runs whenever we unfocus input
                textInput.addEventListener("blur", () => {
                    this.redraw(this.drawingData);
                    //Store value of text in drawing for later refernce when drawing it
                    this.textObject.text = textInput.value;
                    //Set context props based on current drawing
                    this.setCtxStyles(this.textObject);
                    //Measure the drawn text
                    const textWidth = this.context.measureText(textInput.value).width;
                    const textHeight = parseInt(this.context.font);
                    this.textObject.x1 = mouseX;
                    this.textObject.y1 = mouseY;
                    this.textObject.x2 = Math.round(this.textObject.x1 + textWidth);
                    this.textObject.y2 = Math.round(this.textObject.y1 + textHeight);
                    //Draw the text
                    this.context.fillText(this.textObject.text, mouseX, mouseY);
                    //Save and store index
                    this.index = this.incOrDec(this.index, "increment", 1);
                    this.drawingData.push(this.textObject);
                    canvasContainer.removeChild(textInput);
                    this.isWriting = false;
                    //Set new text object
                    this.textObject = {
                        type: "text",
                        text: "",
                        font: "30pt sans-serif",
                        resizedFont: "",
                        baseline: "top",
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 0,
                        resizedX1: 0,
                        resizedY1: 0,
                        resizedX2: 0,
                        resizedY2: 0,
                        operation: "source-over",
                    };
                });
                textInput.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        textInput.blur();
                    }
                });
                canvasContainer === null || canvasContainer === void 0 ? void 0 : canvasContainer.appendChild(textInput);
            }
            if (this.toggleLine) {
                if (this.isLining)
                    return;
                this.lineObject.operation = "source-over";
                //Signal that we are trying to draw a line
                this.shouldLine = true;
                this.lineObject.path.moveTo(mouseX, mouseY);
                this.lineObject.startX = mouseX;
                this.lineObject.startY = mouseY;
            }
        };
        //Runs whenever mouse is released
        this.mouseUpHandler = () => {
            //Reset states
            this.mouseIsDown = false;
            this.shouldMove = false;
            this.isMoving = false;
            if (this.isDrawing || this.isErasing) {
                this.shouldDraw = false;
                this.shouldErase = false;
                this.isDrawing = false;
                this.isErasing = false;
                //IF its just a click and no stroke
                if (this.pathObject.xCords.length === 1) {
                    this.pathObject = {
                        type: "stroke",
                        path: new Path2D(),
                        resizedPath: null,
                        lineWidth: this.context.lineWidth,
                        strokeStyle: String(this.context.strokeStyle),
                        operation: "source-over",
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 0,
                        resizedX1: 0,
                        resizedY1: 0,
                        resizedX2: 0,
                        resizedY2: 0,
                        xCords: [],
                        yCords: [],
                        resizedXCords: [],
                        resizedYCords: [],
                    };
                    return;
                }
                //Set init value for left, top right and bottom
                this.pathObject.x1 = Math.min(...this.pathObject.xCords);
                this.pathObject.y1 = Math.min(...this.pathObject.yCords);
                this.pathObject.x2 = Math.max(...this.pathObject.xCords);
                this.pathObject.y2 = Math.max(...this.pathObject.yCords);
                //Save
                this.index = this.incOrDec(this.index, "increment", 1);
                this.drawingData.push(this.pathObject);
                //Set new pathObject
                this.pathObject = {
                    type: "stroke",
                    path: new Path2D(),
                    resizedPath: null,
                    lineWidth: this.context.lineWidth,
                    strokeStyle: String(this.context.strokeStyle),
                    operation: "source-over",
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                    resizedX1: 0,
                    resizedY1: 0,
                    resizedX2: 0,
                    resizedY2: 0,
                    xCords: [],
                    yCords: [],
                    resizedXCords: [],
                    resizedYCords: [],
                };
            }
            if (this.isResizing) {
                this.shouldResize = { toggled: false, from: "" };
                this.isResizing = false;
                if (this.selectedDrawingIndex !== null) {
                    const selectedDrawing = this.drawingData[this.selectedDrawingIndex];
                    this.updateToResized(selectedDrawing);
                }
            }
            //IF we are drawing line when we mouseUp
            if (this.isLining) {
                this.shouldLine = false;
                this.isLining = false;
                //End of line
                this.lineObject.endX = this.mouseX;
                this.lineObject.endY = this.mouseY;
                //Take the path and line it to end
                this.lineObject.path.lineTo(this.mouseX, this.mouseY);
                this.lineObject.x1 = Math.min(this.lineObject.startX, this.lineObject.endX);
                this.lineObject.x2 = Math.max(this.lineObject.startX, this.lineObject.endX);
                this.lineObject.y1 = Math.min(this.lineObject.startY, this.lineObject.endY);
                this.lineObject.y2 = Math.max(this.lineObject.startY, this.lineObject.endY);
                //Save new line
                this.index = this.incOrDec(this.index, "increment", 1);
                this.drawingData.push(this.lineObject);
                //New lineObject
                this.lineObject = {
                    type: "line",
                    path: new Path2D(),
                    resizedPath: null,
                    lineWidth: 5,
                    strokeStyle: "black",
                    operation: "source-over",
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0,
                    resizedStartX: 0,
                    resizedStartY: 0,
                    resizedEndX: 0,
                    resizedEndY: 0,
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                };
            }
            this.redraw(this.drawingData);
            //Save stroke
            // this.context.stroke();
            // this.context.closePath();
        };
        this.mouseMoveHandler = (e) => {
            const evtType = e.touches ? e.touches[0] : e;
            //Current mouse positions
            const mouseX = evtType.clientX - this.canvas.offsetLeft;
            const mouseY = evtType.clientY - this.canvas.offsetTop;
            //Store current mousePosition
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            this.mouseIsDown ? (this.isDragging = true) : (this.isDragging = false);
            if (this.toggleMvRz) {
                this.canvas.style.cursor = "default";
                this.drawingData.forEach((drawing, i) => {
                    switch (drawing.type) {
                        case "stroke":
                            {
                                if (this.context.isPointInStroke(drawing.path, mouseX, mouseY)) {
                                    this.canvas.style.cursor = "move";
                                }
                                //IF mouse is within selection of selected drawing
                                if (this.selectedDrawingIndex === i &&
                                    this.mouseWithinSelection(mouseX, mouseY, drawing)) {
                                    //Get position within selection
                                    const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, drawing);
                                    //Style accordingly
                                    selectionPosition === "m"
                                        ? (this.canvas.style.cursor = "move")
                                        : selectionPosition === "tl" || selectionPosition === "br"
                                            ? (this.canvas.style.cursor = "nwse-resize")
                                            : (this.canvas.style.cursor = "nesw-resize");
                                }
                            }
                            break;
                        case "text":
                            {
                                if (this.mouseWithinSelection(mouseX, mouseY, drawing)) {
                                    const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, drawing);
                                    selectionPosition === "m"
                                        ? (this.canvas.style.cursor = "move")
                                        : selectionPosition === "tl" || selectionPosition === "br"
                                            ? (this.canvas.style.cursor = "nwse-resize")
                                            : (this.canvas.style.cursor = "nesw-resize");
                                }
                            }
                            break;
                        case "line":
                            {
                                if (this.mouseWithinLineSelection(drawing, mouseX, mouseY)) {
                                    const selectionPosition = this.mouseWithinLineSelection(drawing, mouseX, mouseY);
                                    selectionPosition === "m"
                                        ? (this.canvas.style.cursor = "move")
                                        : (this.canvas.style.cursor = "pointer");
                                }
                            }
                            break;
                    }
                });
            }
            //IF we have a selected drawing and we are dragging
            if (this.selectedDrawingIndex !== null && this.isDragging) {
                const dx = mouseX - this.startX;
                const dy = mouseY - this.startY;
                //Selected drawing
                const selectedDrawing = this.drawingData[this.selectedDrawingIndex];
                switch (selectedDrawing.type) {
                    case "stroke":
                        {
                            if (this.shouldMove) {
                                this.isMoving = true;
                                //Update x and y coordinates
                                for (let i = 0; i < selectedDrawing.xCords.length; i++) {
                                    selectedDrawing.xCords[i] += dx;
                                    selectedDrawing.yCords[i] += dy;
                                }
                                //Update left, top, right and bottom
                                selectedDrawing.x1 = Math.min(...selectedDrawing.xCords);
                                selectedDrawing.y1 = Math.min(...selectedDrawing.yCords);
                                selectedDrawing.x2 = Math.max(...selectedDrawing.xCords);
                                selectedDrawing.y2 = Math.max(...selectedDrawing.yCords);
                                //Create new path from existing path
                                const newPath = new Path2D();
                                const m = new DOMMatrix().translate(dx, dy);
                                newPath.addPath(selectedDrawing.path, m);
                                selectedDrawing.path = newPath;
                                //Set start positions to current
                                this.startX = mouseX;
                                this.startY = mouseY;
                            }
                            else {
                                const { from } = this.shouldResize;
                                this.isResizing = true;
                                this.resizePath(selectedDrawing, from, mouseX, mouseY);
                            }
                        }
                        break;
                    case "text":
                        {
                            if (this.shouldMove) {
                                this.isMoving = true;
                                //Assign new coordinates
                                selectedDrawing.x1 += dx;
                                selectedDrawing.y1 += dy;
                                selectedDrawing.x2 += dx;
                                selectedDrawing.y2 += dy;
                                this.startX = mouseX;
                                this.startY = mouseY;
                            }
                            else {
                                const { from } = this.shouldResize;
                                this.isResizing = true;
                                this.resizeText(selectedDrawing, from, mouseX, mouseY);
                            }
                        }
                        break;
                    case "line":
                        {
                            if (this.shouldMove) {
                                this.isMoving = true;
                                //Assign new start and end coordinates
                                selectedDrawing.startX += dx;
                                selectedDrawing.startY += dy;
                                selectedDrawing.endX += dx;
                                selectedDrawing.endY += dy;
                                selectedDrawing.x1 += dx;
                                selectedDrawing.y1 += dy;
                                selectedDrawing.x2 += dx;
                                selectedDrawing.y2 += dy;
                                //Create new path from existing path
                                const newPath = new Path2D();
                                const m = new DOMMatrix().translate(dx, dy);
                                newPath.addPath(selectedDrawing.path, m);
                                selectedDrawing.path = newPath;
                                this.startX = mouseX;
                                this.startY = mouseY;
                            }
                            else {
                                const { from } = this.shouldResize;
                                const { drawnFromX, drawnFromY } = this.drawnFrom(selectedDrawing);
                                let resizeStartCoords = false;
                                let resizeEndCoords = false;
                                this.isResizing = true;
                                const resizedPath = new Path2D();
                                //Init resized start and end
                                selectedDrawing.resizedStartX = selectedDrawing.startX;
                                selectedDrawing.resizedStartY = selectedDrawing.startY;
                                selectedDrawing.resizedEndX = selectedDrawing.endX;
                                selectedDrawing.resizedEndY = selectedDrawing.endY;
                                switch (from) {
                                    //IF we should resize from left and its drawn from left that means that start coords is on the left side
                                    //So resizeStartCoords
                                    case "l":
                                        drawnFromX === "leftToRight"
                                            ? (resizeStartCoords = true)
                                            : (resizeEndCoords = true);
                                        break;
                                    case "r":
                                        drawnFromX === "leftToRight"
                                            ? (resizeEndCoords = true)
                                            : (resizeStartCoords = true);
                                        break;
                                    case "t":
                                        drawnFromY === "topToBottom"
                                            ? (resizeStartCoords = true)
                                            : (resizeEndCoords = true);
                                        break;
                                    case "b":
                                        drawnFromY === "topToBottom"
                                            ? (resizeEndCoords = true)
                                            : (resizeStartCoords = true);
                                        break;
                                }
                                if (resizeStartCoords) {
                                    selectedDrawing.resizedStartX = mouseX;
                                    selectedDrawing.resizedStartY = mouseY;
                                    this.context.beginPath();
                                    resizedPath.moveTo(selectedDrawing.resizedStartX, selectedDrawing.resizedStartY);
                                    resizedPath.lineTo(selectedDrawing.endX, selectedDrawing.endY);
                                }
                                else {
                                    selectedDrawing.resizedEndX = mouseX;
                                    selectedDrawing.resizedEndY = mouseY;
                                    this.context.beginPath();
                                    resizedPath.moveTo(selectedDrawing.resizedEndX, selectedDrawing.resizedEndY);
                                    resizedPath.lineTo(selectedDrawing.startX, selectedDrawing.startY);
                                }
                                selectedDrawing.resizedPath = resizedPath;
                            }
                        }
                        break;
                }
                this.redraw(this.drawingData);
            }
            if ((this.shouldDraw && this.isDragging) || (this.shouldErase && this.isDragging)) {
                this.shouldDraw ? (this.isDrawing = true) : (this.isDrawing = false);
                this.shouldErase ? (this.isErasing = true) : (this.isErasing = false);
                this.redraw(this.drawingData);
                //Set props for current path object
                this.setCtxStyles(this.pathObject);
                this.addCoords(mouseX, mouseY, true);
                this.pathObject.path.lineTo(mouseX, mouseY);
                this.context.stroke(this.pathObject.path);
            }
            if (this.shouldLine) {
                this.isLining = true;
                //Redraw data
                this.redraw(this.drawingData);
                this.setCtxStyles(this.lineObject);
                //Begin current path
                this.context.beginPath();
                //Move context to start position of lineObject
                this.context.moveTo(this.lineObject.startX, this.lineObject.startY);
                //Draw a line to current mouse position
                this.context.lineTo(mouseX, mouseY);
                //Close the path and save -> repeat while moving
                this.context.closePath();
                this.context.stroke();
            }
            e.preventDefault();
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
        this.toggleDraw = true;
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
    //Updates drawing to resized
    updateToResized(drawing) {
        if (drawing.type === "stroke") {
            drawing.xCords = drawing.resizedXCords;
            drawing.yCords = drawing.resizedYCords;
            drawing.path = drawing.resizedPath;
            drawing.x1 = Math.min(...drawing.xCords);
            drawing.y1 = Math.min(...drawing.yCords);
            drawing.x2 = Math.max(...drawing.xCords);
            drawing.y2 = Math.max(...drawing.yCords);
        }
        else if (drawing.type === "text") {
            drawing.font = drawing.resizedFont;
            drawing.x1 = drawing.resizedX1;
            drawing.y1 = drawing.resizedY1;
            drawing.x2 = drawing.resizedX2;
            drawing.y2 = drawing.resizedY2;
        }
        else {
            const { drawnFromX, drawnFromY } = this.drawnFrom(drawing);
            drawing.startX = drawing.resizedStartX;
            drawing.endX = drawing.resizedEndX;
            drawing.startY = drawing.resizedStartY;
            drawing.endY = drawing.resizedEndY;
            drawing.path = drawing.resizedPath;
            drawing.x1 = Math.min(drawing.startX, drawing.endX);
            drawing.x2 = Math.max(drawing.startX, drawing.endX);
            drawing.y1 = Math.min(drawing.startY, drawing.endY);
            drawing.y2 = Math.max(drawing.startY, drawing.endY);
        }
    }
    //Adds each coordinate to array
    addCoords(x, y, dragging) {
        this.pathObject.xCords.push(x);
        this.pathObject.yCords.push(y);
        this.isDragging = dragging;
    }
    //Helper function that takes care of returning values for scaling correctly
    scaleCorrectly(from, element, currentMouseX, currentMouseY) {
        //IF scaling from the left side then start = left : start = right;
        const startCornerX = from === "tl" || from === "bl" ? element.x1 : element.x2;
        const startCornerY = from === "tl" || from === "tr" ? element.y1 : element.y2;
        //IF scaling from left side then origin is opposite side so that we scale inwards or outwards based on corner
        const scaleOriginX = from === "tl" || from === "bl" ? element.x2 : element.x1;
        const scaleOriginY = from === "tl" || from === "tr" ? element.y2 : element.y1;
        //For the scaling to work properly i also need where we scale from
        //Since scaling from left side to right side would not work with e.g (x1 - x2 so instead x2 - x1 for distance)
        const originalDistance = from === "tl" || from === "bl"
            ? scaleOriginX - startCornerX
            : startCornerX -
                scaleOriginX +
                (from === "tl" || from === "tr"
                    ? scaleOriginY - startCornerY
                    : startCornerY - scaleOriginY);
        const currentDistance = from === "tl" || from === "bl"
            ? scaleOriginX - currentMouseX
            : currentMouseX -
                scaleOriginX +
                (from === "tl" || from === "tr"
                    ? scaleOriginY - currentMouseY
                    : currentMouseY - scaleOriginY);
        const scaleFactor = currentDistance / originalDistance;
        return {
            scaleOriginXPos: scaleOriginX,
            scaleOriginYPos: scaleOriginY,
            startCornerXPos: startCornerX,
            startCornerYPos: startCornerY,
            scale: scaleFactor,
        };
    }
    //Resize text based on origin of mouse
    resizeText(element, from, currentMouseX, currentMouseY) {
        const { scaleOriginXPos, scaleOriginYPos, startCornerXPos, startCornerYPos, scale } = this.scaleCorrectly(from, element, currentMouseX, currentMouseY);
        const startCornerX = startCornerXPos;
        const startCornerY = startCornerYPos;
        const scaleOriginX = scaleOriginXPos;
        const scaleOriginY = scaleOriginYPos;
        //Scale factor based on mouse
        const scaleFactor = scale;
        //Create copy of original font string
        const fontStringCopy = element.font.slice();
        //Convert font size to number
        const fontSize = parseFloat(fontStringCopy);
        //Get original distance from scale origin to start corner
        const originalDistanceX = scaleOriginX - startCornerX;
        const originalDistanceY = scaleOriginY - startCornerY;
        //Resize font size
        const resizedFontSize = fontSize * scaleFactor;
        //Get new distance based on scale factor
        const newDistanceX = originalDistanceX * scaleFactor;
        const newDistanceY = originalDistanceY * scaleFactor;
        //Replace original font size with resized
        const newFont = fontStringCopy.replace(fontSize.toString(), resizedFontSize.toString());
        //Assign new left, right, top and bottom based on which side we scaled from
        from === "tl" || from === "bl"
            ? ((element.resizedX1 = scaleOriginX - newDistanceX), (element.resizedX2 = scaleOriginX))
            : ((element.resizedX2 = scaleOriginX - newDistanceX), (element.resizedX1 = scaleOriginX));
        from === "tl" || from === "tr"
            ? ((element.resizedY1 = scaleOriginY - newDistanceY), (element.resizedY2 = scaleOriginY))
            : ((element.resizedY2 = scaleOriginY - newDistanceY), (element.resizedY1 = scaleOriginY));
        //Store the new font size
        element.resizedFont = newFont;
    }
    //Resize drawing with provided scale factor and scale origin
    resizePath(element, from, currentMouseX, currentMouseY) {
        const { scaleOriginXPos, scaleOriginYPos, scale } = this.scaleCorrectly(from, element, currentMouseX, currentMouseY);
        const scaleOriginX = scaleOriginXPos;
        const scaleOriginY = scaleOriginYPos;
        const scaleFactor = scale;
        if (element.type === "stroke") {
            const resizedPath = new Path2D();
            //Create copy
            const resizedXCords = [...element.xCords];
            const resizedYCords = [...element.yCords];
            const originalDistanceX = [];
            const originalDistanceY = [];
            //Calculate original distance between origin and x,y coordinates
            for (let i = 0; i < element.xCords.length; i++) {
                originalDistanceX[i] = scaleOriginX - element.xCords[i];
                originalDistanceY[i] = scaleOriginY - element.yCords[i];
            }
            //Update to resized coords
            for (let i = 0; i < resizedXCords.length; i++) {
                //Calculate new distance based on scale factor
                const newDistanceX = originalDistanceX[i] * scaleFactor;
                const newDistanceY = originalDistanceY[i] * scaleFactor;
                //Place resized coords in the correct place
                resizedXCords[i] = scaleOriginX - newDistanceX;
                resizedYCords[i] = scaleOriginY - newDistanceY;
                //Move path to new coords
                resizedPath.moveTo(resizedXCords[i - 1], resizedYCords[i - 1]);
                //Create line to new coords
                resizedPath.lineTo(resizedXCords[i], resizedYCords[i]);
            }
            //Set resized left, right, top and bottom
            element.resizedX1 = Math.min(...resizedXCords);
            element.resizedY1 = Math.min(...resizedYCords);
            element.resizedX2 = Math.max(...resizedXCords);
            element.resizedY2 = Math.max(...resizedYCords);
            element.resizedXCords = resizedXCords;
            element.resizedYCords = resizedYCords;
            element.resizedPath = resizedPath;
        }
    }
    //Checks where line is drawn from
    drawnFrom(drawing) {
        let X;
        let Y;
        const { startX, endX, startY, endY } = drawing;
        if (startX < endX) {
            X = "leftToRight";
        }
        else {
            X = "rightToLeft";
        }
        if (startY < endY) {
            Y = "topToBottom";
        }
        else {
            Y = "bottomToTop";
        }
        return { drawnFromX: X, drawnFromY: Y };
    }
    //Check if mouse is in corner of line
    mouseWithinLineSelection(drawing, mouseX, mouseY) {
        //Current line element
        const { startX, startY, endX, endY, x1, y1, x2, y2, path } = drawing;
        let leftToRight = false;
        let rightToLeft = false;
        let topToBottom = false;
        let bottomToTop = false;
        let mousePosition;
        const offset = 10;
        //Get info on where line was drawn from
        const { drawnFromX, drawnFromY } = this.drawnFrom(drawing);
        if (x2 - x1 > y2 - y1) {
            //IF drawn across the x axis we wanna say that its either from left to right OR right to left
            drawnFromX === "leftToRight" ? (leftToRight = true) : (rightToLeft = true);
        }
        else {
            //IF drawn across y axis we wanna say that its either from top to bottom OR bottom to top
            drawnFromY === "topToBottom" ? (topToBottom = true) : (bottomToTop = true);
        }
        //IF left to right THEN leftX is startX : leftX is endX
        //IF top to bottom THEN topX is startX : topX is endX
        const leftAndTopX = leftToRight || topToBottom ? startX : endX;
        const rightAndBottomX = leftToRight || topToBottom ? endX : startX;
        const leftAndTopY = leftToRight || topToBottom ? startY : endY;
        const rightAndBottomY = leftToRight || topToBottom ? endY : startY;
        const leftAndTopX1 = leftAndTopX - offset;
        const leftAndTopX2 = leftAndTopX + offset;
        const leftAndTopY1 = leftAndTopY - offset;
        const leftAndTopY2 = leftAndTopY + offset;
        const rightAndBottomX1 = rightAndBottomX - offset;
        const rightAndBottomX2 = rightAndBottomX + offset;
        const rightAndBottomY1 = rightAndBottomY - offset;
        const rightAndBottomY2 = rightAndBottomY + offset;
        if (this.mouseWithin(leftAndTopX1, leftAndTopX2, leftAndTopY1, leftAndTopY2, mouseX, mouseY)) {
            //Conditional because we dont want to say that its on the left side when its on the top side and so on
            mousePosition = leftToRight || rightToLeft ? "l" : "t";
        }
        else if (this.mouseWithin(rightAndBottomX1, rightAndBottomX2, rightAndBottomY1, rightAndBottomY2, mouseX, mouseY)) {
            mousePosition = leftToRight || rightToLeft ? "r" : "b";
        }
        else if (this.context.isPointInStroke(path, mouseX, mouseY)) {
            //IF its not in corner but inside stroke
            mousePosition = "m";
        }
        else {
            //IF not in line at all
            mousePosition = false;
        }
        return mousePosition;
    }
    //Checks if mouse is within selection rectangle for those that have it
    mouseWithinSelection(x, y, drawing) {
        const { x1, y1, x2, y2 } = drawing;
        //Top left rectangle
        const topLeftX1 = x1;
        const topLeftX2 = x1 + 10;
        const topLeftY1 = y1;
        const topLeftY2 = y1 + 10;
        //Top right rectangle
        const topRightX1 = x2 - 10;
        const topRightX2 = x2;
        const topRightY1 = y1;
        const topRightY2 = y1 + 10;
        //Bottom right rectangle
        const bottomRightX1 = x2 - 10;
        const bottomRightX2 = x2;
        const bottomRightY1 = y2 - 10;
        const bottomRightY2 = y2;
        //Bottom left rectangle
        const bottomLeftX1 = x1;
        const bottomLeftX2 = x1 + 10;
        const bottomLeftY1 = y2 - 10;
        const bottomLeftY2 = y2;
        const mouseIsIn = this.mouseWithin(topLeftX1, topLeftX2, topLeftY1, topLeftY2, x, y)
            ? "tl"
            : this.mouseWithin(topRightX1, topRightX2, topRightY1, topRightY2, x, y)
                ? "tr"
                : this.mouseWithin(bottomRightX1, bottomRightX2, bottomRightY1, bottomRightY2, x, y)
                    ? "br"
                    : this.mouseWithin(bottomLeftX1, bottomLeftX2, bottomLeftY1, bottomLeftY2, x, y)
                        ? "bl"
                        : this.mouseWithin(x1, x2, y1, y2, x, y)
                            ? "m"
                            : false;
        return mouseIsIn;
    }
    //Draw a selection for selected drawing
    createDrawingSelection(drawing) {
        this.context.globalCompositeOperation = "source-over";
        this.context.strokeStyle = "#738FE5";
        this.context.lineWidth = 1;
        if (drawing.type === "stroke" || drawing.type === "text") {
            const { x1, y1, x2, y2 } = this.getCurrentCoords(drawing); //Check if we are resizing and use coords based on that
            const width = x2 - x1;
            const height = y2 - y1;
            //Draw main rectangle
            this.context.strokeRect(x1, y1, width, height);
            //Draw corners
            this.drawCornerPoints(x1, y1, x2, y2);
        }
        else {
            //Draw line from start to end
            this.context.lineWidth = 1;
            this.context.moveTo(drawing.startX, drawing.startY);
            this.context.lineTo(drawing.endX, drawing.endY);
            this.context.stroke();
            this.context.lineWidth = 5;
            this.context.beginPath();
            this.context.arc(drawing.startX, drawing.startY, 1, 0, 2 * Math.PI);
            this.context.stroke();
            this.context.beginPath();
            this.context.arc(drawing.endX, drawing.endY, 1, 0, 2 * Math.PI);
            this.context.stroke();
            // this.drawCornerPoints(drawing);
        }
    }
    //Draw points in corner
    drawCornerPoints(x1, y1, x2, y2) {
        this.context.lineWidth = 5;
        let x;
        let y;
        //Selection has 4 corners
        for (let i = 0; i < 4; i++) {
            i === 0
                ? ((x = x1), (y = y1)) //First draw top left corner
                : i === 1
                    ? ((x = x2), (y = y1)) //Second draw top right corner
                    : i === 2
                        ? ((x = x1), (y = y2)) //Third draw bottom left corner
                        : ((x = x2), (y = y2)); //Last draw bottom right corner
            this.context.beginPath();
            this.context.arc(x, y, 1, 0, 2 * Math.PI);
            this.context.stroke();
        }
    }
    //Checks if we should use the resized coords or normal coords
    getCurrentCoords(drawing) {
        const { x1, y1, x2, y2, resizedX1, resizedY1, resizedX2, resizedY2 } = drawing;
        if (this.isResizing) {
            return { x1: resizedX1, y1: resizedY1, x2: resizedX2, y2: resizedY2 };
        }
        else {
            return { x1: x1, y1: y1, x2: x2, y2: y2 };
        }
    }
    //Checks if mouse is within given coordinates
    mouseWithin(x1, x2, y1, y2, x, y) {
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2)
            return true;
        return false;
    }
    //Sets context styles based on drawing styles
    setCtxStyles(drawing) {
        this.context.globalCompositeOperation = drawing.operation;
        this.context.lineCap = "round";
        if (drawing.type === "stroke") {
            this.context.lineWidth = drawing.lineWidth;
            this.context.strokeStyle = drawing.strokeStyle;
        }
        else if (drawing.type === "text") {
            this.context.textBaseline = drawing.baseline;
            this.context.font = drawing.font;
        }
        else {
            this.context.lineWidth = drawing.lineWidth;
            this.context.strokeStyle = drawing.strokeStyle;
        }
    }
    //Loop and redraw each drawing as drawn
    redraw(drawingData) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (drawingData.length <= 0)
            return;
        drawingData.forEach((drawing, i) => {
            switch (drawing.type) {
                case "stroke":
                    if (this.selectedDrawingIndex === i) {
                        if (this.isResizing) {
                            this.setCtxStyles(drawing);
                            this.context.stroke(drawing.resizedPath);
                            this.createDrawingSelection(drawing);
                            return;
                        }
                        this.createDrawingSelection(drawing);
                    }
                    this.setCtxStyles(drawing);
                    this.context.stroke(drawing.path);
                    break;
                case "text":
                    if (this.selectedDrawingIndex === i) {
                        if (this.isResizing) {
                            this.setCtxStyles(drawing);
                            this.context.font = drawing.resizedFont;
                            this.context.fillText(drawing.text, drawing.resizedX1, drawing.resizedY1);
                            this.createDrawingSelection(drawing);
                            return;
                        }
                        this.createDrawingSelection(drawing);
                    }
                    this.setCtxStyles(drawing);
                    this.context.fillText(drawing.text, drawing.x1, drawing.y1);
                    break;
                case "line":
                    if (this.selectedDrawingIndex === i) {
                        if (this.isResizing) {
                            this.setCtxStyles(drawing);
                            this.context.stroke(drawing.resizedPath);
                            this.createDrawingSelection(drawing);
                            return;
                        }
                    }
                    this.setCtxStyles(drawing);
                    this.context.stroke(drawing.path);
                    if (this.selectedDrawingIndex === i) {
                        this.createDrawingSelection(drawing);
                    }
                    break;
            }
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