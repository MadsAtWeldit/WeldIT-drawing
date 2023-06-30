import { DrawingElementType } from "./enums/enum.js";
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
            coords: {},
            resizedCoords: {},
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
            operation: "source-over",
            coords: {},
            resizedCoords: {},
        };
        //Create default line object
        this.lineObject = {
            type: "line",
            path: new Path2D(),
            resizedPath: null,
            lineWidth: 5,
            strokeStyle: "black",
            operation: "source-over",
            coords: {},
            resizedCoords: {},
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
        //Handles pressdown/click
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
                    //Init coordinates
                    this.textObject.coords = {
                        x1: mouseX,
                        y1: mouseY,
                        x2: Math.round(mouseX + textWidth),
                        y2: Math.round(mouseY + textHeight),
                    };
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
                        operation: "source-over",
                        coords: {},
                        resizedCoords: {},
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
                    return; //So it jumps to mouseup
                this.lineObject.operation = "source-over";
                //Signal that we are trying to draw a line
                this.shouldLine = true;
                this.lineObject.path.moveTo(mouseX, mouseY);
                //Init start coordinates
                this.lineObject.coords = { startX: mouseX, startY: mouseY };
            }
        };
        //Handles mouse release
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
                        coords: {},
                        resizedCoords: {},
                        xCords: [],
                        yCords: [],
                        resizedXCords: [],
                        resizedYCords: [],
                    };
                    return;
                }
                //Init coords
                this.pathObject.coords = {
                    x1: Math.min(...this.pathObject.xCords),
                    y1: Math.min(...this.pathObject.yCords),
                    x2: Math.max(...this.pathObject.xCords),
                    y2: Math.max(...this.pathObject.yCords),
                };
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
                    coords: {},
                    resizedCoords: {},
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
                //Set end points
                this.lineObject.coords.endX = this.mouseX;
                this.lineObject.coords.endY = this.mouseY;
                //Take the path and line it to end
                this.lineObject.path.lineTo(this.mouseX, this.mouseY);
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
                    coords: {},
                    resizedCoords: {},
                };
            }
            this.redraw(this.drawingData);
        };
        //Handles moving mouse
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
                //Move with respect to current mouse
                const dx = mouseX - this.startX;
                const dy = mouseY - this.startY;
                //Selected drawing
                const selectedDrawing = this.drawingData[this.selectedDrawingIndex];
                //Coords are required IF not present then throw an error
                this.assertRequired(selectedDrawing.coords);
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
                                selectedDrawing.coords.x1 = Math.min(...selectedDrawing.xCords);
                                selectedDrawing.coords.y1 = Math.min(...selectedDrawing.yCords);
                                selectedDrawing.coords.x2 = Math.max(...selectedDrawing.xCords);
                                selectedDrawing.coords.y2 = Math.max(...selectedDrawing.yCords);
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
                                selectedDrawing.coords.x1 += dx;
                                selectedDrawing.coords.y1 += dy;
                                selectedDrawing.coords.x2 += dx;
                                selectedDrawing.coords.y2 += dy;
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
                                selectedDrawing.coords.startX += dx;
                                selectedDrawing.coords.startY += dy;
                                selectedDrawing.coords.endX += dx;
                                selectedDrawing.coords.endY += dy;
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
                                //For tracking if we should resize the start or end of the line
                                let resizeStartCoords = false;
                                let resizeEndCoords = false;
                                this.isResizing = true;
                                const resizedPath = new Path2D();
                                //Init resized start and end
                                selectedDrawing.resizedCoords = {
                                    resizedStartX: selectedDrawing.coords.startX,
                                    resizedStartY: selectedDrawing.coords.startY,
                                    resizedEndX: selectedDrawing.coords.endX,
                                    resizedEndY: selectedDrawing.coords.endY,
                                };
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
                                    selectedDrawing.resizedCoords.resizedStartX = mouseX;
                                    selectedDrawing.resizedCoords.resizedStartY = mouseY;
                                    this.context.beginPath();
                                    resizedPath.moveTo(selectedDrawing.resizedCoords.resizedStartX, selectedDrawing.resizedCoords.resizedStartY);
                                    resizedPath.lineTo(selectedDrawing.coords.endX, selectedDrawing.coords.endY);
                                }
                                else {
                                    selectedDrawing.resizedCoords.resizedEndX = mouseX;
                                    selectedDrawing.resizedCoords.resizedEndY = mouseY;
                                    this.context.beginPath();
                                    resizedPath.moveTo(selectedDrawing.resizedCoords.resizedEndX, selectedDrawing.resizedCoords.resizedEndY);
                                    resizedPath.lineTo(selectedDrawing.coords.startX, selectedDrawing.coords.startY);
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
                this.context.moveTo(this.lineObject.coords.startX, this.lineObject.coords.startY); //We know that since we "shouldLine" we have clicked so we can say as
                //Draw a line to current mouse position
                this.context.lineTo(mouseX, mouseY);
                //Close the path and save -> repeat while moving
                this.context.closePath();
                this.context.stroke();
            }
            e.preventDefault();
        };
        //Function for creating a html element
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
        //Handles toggling between buttons
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
    //Function that updates given drawings coords to resized coords
    updateToResized(drawing) {
        if (drawing.type === "stroke") {
            drawing.xCords = drawing.resizedXCords;
            drawing.yCords = drawing.resizedYCords;
            drawing.path = drawing.resizedPath;
            drawing.coords.x1 = Math.min(...drawing.xCords);
            drawing.coords.y1 = Math.min(...drawing.yCords);
            drawing.coords.x2 = Math.max(...drawing.xCords);
            drawing.coords.y2 = Math.max(...drawing.yCords);
        }
        else if (drawing.type === "text") {
            drawing.font = drawing.resizedFont;
            drawing.coords.x1 = drawing.resizedCoords.resizedX1;
            drawing.coords.y1 = drawing.resizedCoords.resizedY1;
            drawing.coords.x2 = drawing.resizedCoords.resizedX2;
            drawing.coords.y2 = drawing.resizedCoords.resizedY2;
        }
        else {
            drawing.coords.startX = drawing.resizedCoords.resizedStartX;
            drawing.coords.endX = drawing.resizedCoords.resizedEndX;
            drawing.coords.startY = drawing.resizedCoords.resizedStartY;
            drawing.coords.endY = drawing.resizedCoords.resizedEndY;
            drawing.path = drawing.resizedPath;
        }
    }
    //Adds each coordinate to array
    addCoords(x, y, dragging) {
        this.pathObject.xCords.push(x);
        this.pathObject.yCords.push(y);
        this.isDragging = dragging;
    }
    //Function that returns correct coordinates and scalefactor for scaling
    scaleCorrectly(from, element, currentMouseX, currentMouseY) {
        this.assertRequired(element.coords);
        //IF scaling from the left side then start = left : start = right;
        const startCornerX = from === "tl" || from === "bl" ? element.coords.x1 : element.coords.x2;
        const startCornerY = from === "tl" || from === "tr" ? element.coords.y1 : element.coords.y2;
        //IF scaling from left side then origin is opposite side so that we scale inwards or outwards based on corner
        const scaleOriginX = from === "tl" || from === "bl" ? element.coords.x2 : element.coords.x1;
        const scaleOriginY = from === "tl" || from === "tr" ? element.coords.y2 : element.coords.y1;
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
        //Convert font size to number/float
        const fontSize = parseFloat(fontStringCopy);
        //Get original distance from scale origin to start corner/current mouse
        const originalDistanceX = scaleOriginX - startCornerX;
        const originalDistanceY = scaleOriginY - startCornerY;
        //Resize font size
        const resizedFontSize = fontSize * scaleFactor;
        //Get new distance based on scale factor
        const newDistanceX = originalDistanceX * scaleFactor;
        const newDistanceY = originalDistanceY * scaleFactor;
        //Replace original font size with resized
        const newFont = fontStringCopy.replace(fontSize.toString(), resizedFontSize.toString());
        //Store new left, right, top and bottom based on which side we scaled from
        from === "tl" || from === "bl"
            ? ((element.resizedCoords.resizedX1 = scaleOriginX - newDistanceX),
                (element.resizedCoords.resizedX2 = scaleOriginX))
            : ((element.resizedCoords.resizedX2 = scaleOriginX - newDistanceX),
                (element.resizedCoords.resizedX1 = scaleOriginX));
        from === "tl" || from === "tr"
            ? ((element.resizedCoords.resizedY1 = scaleOriginY - newDistanceY),
                (element.resizedCoords.resizedY2 = scaleOriginY))
            : ((element.resizedCoords.resizedY2 = scaleOriginY - newDistanceY),
                (element.resizedCoords.resizedY1 = scaleOriginY));
        //Store the new font size
        element.resizedFont = newFont;
    }
    //Resize drawing with provided scale factor and scale origin
    resizePath(element, from, currentMouseX, currentMouseY) {
        const { scaleOriginXPos, scaleOriginYPos, scale } = this.scaleCorrectly(from, element, currentMouseX, currentMouseY);
        const scaleOriginX = scaleOriginXPos;
        const scaleOriginY = scaleOriginYPos;
        const scaleFactor = scale;
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
        element.resizedCoords.resizedX1 = Math.min(...resizedXCords);
        element.resizedCoords.resizedY1 = Math.min(...resizedYCords);
        element.resizedCoords.resizedX2 = Math.max(...resizedXCords);
        element.resizedCoords.resizedY2 = Math.max(...resizedYCords);
        element.resizedXCords = resizedXCords;
        element.resizedYCords = resizedYCords;
        element.resizedPath = resizedPath;
    }
    //Checks where LineElement is drawn from
    drawnFrom(drawing) {
        let X;
        let Y;
        this.assertRequired(drawing.coords);
        const { startX, endX, startY, endY } = drawing.coords;
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
    //Check if mouse is in corner of LineElement
    mouseWithinLineSelection(drawing, mouseX, mouseY) {
        //Throw error if coords is undefined
        this.assertRequired(drawing.coords);
        //Current line element
        const { startX, startY, endX, endY } = drawing.coords;
        let leftToRight = false;
        let rightToLeft = false;
        let topToBottom = false;
        let bottomToTop = false;
        let mousePosition;
        const offset = 10;
        //Get info on where line was drawn from
        const { drawnFromX, drawnFromY } = this.drawnFrom(drawing);
        const distanceX = drawnFromX === "leftToRight" ? endX - startX : startX - endX;
        const distanceY = drawnFromY === "topToBottom" ? endY - startY : startY - endY;
        if (distanceX > distanceY) {
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
        else if (this.context.isPointInStroke(drawing.path, mouseX, mouseY)) {
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
        this.assertRequired(drawing.coords);
        const { x1, y1, x2, y2 } = drawing.coords;
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
    //Function for well.. creating a drawing selection
    createDrawingSelection(drawing) {
        this.context.globalCompositeOperation = "source-over";
        this.context.strokeStyle = "#738FE5";
        this.context.lineWidth = 1;
        const coords = this.getCorrectCoords(drawing);
        if (drawing.type === "stroke" || drawing.type === "text") {
            const width = coords.x2 - coords.x1;
            const height = coords.y2 - coords.y1;
            //Draw main rectangle
            this.context.strokeRect(coords.x1, coords.y1, width, height);
            //Draw corners
            this.drawCornerPoints(drawing);
        }
        else {
            //Draw line from start to end
            this.context.lineWidth = 1;
            this.context.moveTo(coords.startX, coords.startY);
            this.context.lineTo(coords.endX, coords.endY);
            this.context.stroke();
            this.drawCornerPoints(drawing);
        }
    }
    //Function for drawing corner points :P
    drawCornerPoints(drawing) {
        this.context.lineWidth = 5;
        let x;
        let y;
        const coords = this.getCorrectCoords(drawing);
        if (drawing.type === "stroke" || drawing.type === "text") {
            //Selection has 4 corners
            for (let i = 0; i < 4; i++) {
                i === 0
                    ? ((x = coords.x1), (y = coords.y1)) //First draw top left corner
                    : i === 1
                        ? ((x = coords.x2), (y = coords.y1)) //Second draw top right corner
                        : i === 2
                            ? ((x = coords.x1), (y = coords.y2)) //Third draw bottom left corner
                            : ((x = coords.x2), (y = coords.y2)); //Last draw bottom right corner
                this.context.beginPath();
                this.context.arc(x, y, 1, 0, 2 * Math.PI);
                this.context.stroke();
            }
        }
        else {
            //Selection has 2 ends
            for (let i = 0; i < 2; i++) {
                i === 0
                    ? ((x = coords.startX), (y = coords.startY))
                    : ((x = coords.endX), (y = coords.endY));
                this.context.beginPath();
                this.context.arc(x, y, 1, 0, 2 * Math.PI);
                this.context.stroke();
            }
        }
    }
    //Function that returns the correct coords of given drawing based on if we are resizing or not
    getCorrectCoords(drawing) {
        let coords;
        if (drawing.type === "line") {
            coords = {
                startX: this.isResizing ? drawing.resizedCoords.resizedStartX : drawing.coords.startX,
                startY: this.isResizing ? drawing.resizedCoords.resizedStartY : drawing.coords.startY,
                endX: this.isResizing ? drawing.resizedCoords.resizedEndX : drawing.coords.endX,
                endY: this.isResizing ? drawing.resizedCoords.resizedEndY : drawing.coords.endY,
            };
        }
        else {
            coords = {
                x1: this.isResizing ? drawing.resizedCoords.resizedX1 : drawing.coords.x1,
                y1: this.isResizing ? drawing.resizedCoords.resizedY1 : drawing.coords.y1,
                x2: this.isResizing ? drawing.resizedCoords.resizedX2 : drawing.coords.x2,
                y2: this.isResizing ? drawing.resizedCoords.resizedY2 : drawing.coords.y2,
            };
        }
        //Make sure that coords are not undefined before returning them
        this.assertRequired(coords);
        return coords;
    }
    //Checks if mouse is within given coordinates
    mouseWithin(x1, x2, y1, y2, x, y) {
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2)
            return true;
        return false;
    }
    //Function for setting styles based on drawing
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
    //Function for redrawing canvas when interactive
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
                            this.assertRequired(drawing.resizedCoords);
                            this.setCtxStyles(drawing);
                            this.context.font = drawing.resizedFont;
                            this.context.fillText(drawing.text, drawing.resizedCoords.resizedX1, drawing.resizedCoords.resizedY1);
                            this.createDrawingSelection(drawing);
                            return;
                        }
                        this.createDrawingSelection(drawing);
                    }
                    this.setCtxStyles(drawing);
                    this.context.fillText(drawing.text, drawing.coords.x1, drawing.coords.y1);
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
    //Function for assigning value to readonly props
    assignToProp(propName, element) {
        this[propName] = element;
    }
    //Function that checks if given element is target
    targetIs(element, target) {
        if ((target.id && target.id === element.id) ||
            (target.className && target.className === element.className)) {
            return true;
        }
        else {
            return false;
        }
    }
    //Function for incrementing and decrementing
    incOrDec(index, type, steps) {
        if (type === "increment") {
            return (index += steps);
        }
        else {
            return (index -= steps);
        }
    }
    //Throws error if value is null or undefined
    assertDefined(value) {
        if (value == null) {
            throw new Error(`Error: value ${value} cannot be null/undefined`);
        }
    }
    //Function that throws an error if coords are undefined or not typeof number
    assertRequired(coords) {
        //IF there is no props in the provided object
        if (Object.keys(coords).length <= 0)
            throw new Error(`Error: no coords exist on this object`);
        //IF the provided value of said object is not type of a number
        Object.entries(coords).forEach(([k, v]) => {
            if (typeof v !== "number")
                throw new Error(`Error type ${k}:${v} must be of type number`);
        });
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