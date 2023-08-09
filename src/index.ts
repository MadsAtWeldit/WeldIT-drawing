import {
  excludeNullishProps,
  assignCorrectly,
  assertRequired,
  incOrDec,
  createPersonalElement,
} from "./utils/common.js";

import { getCorrectCoords } from "./utils/overloads.js";

//Import element types
import {
  OptionElement,
  DrawingElements,
  LineElement,
  PathElement,
  TextElement,
} from "./types/elements.js";

import { SelectionPosition } from "./enums/enum.js"

class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private controller: HTMLElement | null = document.getElementById("toolbar");

  //Base tools
  private tools: Tools = {
    pencil: <HTMLButtonElement | null>document.getElementById("pencil"),
    eraser: <HTMLButtonElement | null>document.getElementById("eraser"),
    moveAndResize: <HTMLButtonElement | null>document.getElementById("mv-rz"),
    text: <HTMLButtonElement | null>document.getElementById("text"),
    line: <HTMLButtonElement | null>document.getElementById("line"),
  };

  //Tools for changing state of tools
  private toolModifiers: ToolModifiers = {
    color: <HTMLInputElement | null>document.getElementById("color"),
    width: <HTMLInputElement | null>document.getElementById("lineWidth"),
  };

  //Tools for changing state of Canvas
  private canvasModifiers: CanvasModifiers = {
    clear: <HTMLButtonElement | null>document.getElementById("clear"),
    undo: <HTMLButtonElement | null>document.getElementById("undo"),
  };

  //For state tracking
  private actions: Actions = {
    drawing: false,
    erasing: false,
    moving: false,
    resizing: false,
    writing: false,
    lining: false,
  };

  private shouldDraw = false;
  private shouldErase = false;
  private shouldMove = false;
  private shouldResize = {
    toggled: false,
    from: SelectionPosition.NONE
  };
  private shouldLine = false;

  private activeTools: ToolStates = {
    pencil: false,
    eraser: false,
    moveAndResize: false,
    text: false,
    line: false,
  };

  private mouseIsDown = false;
  private isDragging = false;

  private index = -1;
  private selectedDrawingIndex: number | null = null;

  //Create default path object
  private pathObject: PathElement = {
    type: "stroke",
    path: new Path2D(),
    resizedPath: null,
    lineWidth: 5,
    strokeStyle: "black",
    operation: "source-over",       //Source = drawings you are about to draw //Destination = drawings that are already drawn
    coords: {},
    resizedCoords: {},
    xCords: [],
    yCords: [],
    resizedXCords: [],
    resizedYCords: [],
  };

  //Create default text object
  private textObject: TextElement = {
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
  private lineObject: LineElement = {
    type: "line",
    path: new Path2D(),
    resizedPath: null,
    lineWidth: 5,
    strokeStyle: "black",
    operation: "source-over",
    coords: {},
    resizedCoords: {},
  };

  private drawingData: DrawingElements[] = [];

  private startX = 0;
  private startY = 0;
  private mouseX = 0;
  private mouseY = 0;

  private selectedTool: SelectedTool = {};

  constructor(
    elementId: string,

    options?: {
      width?: number;
      height?: number;
      elements?: OptionElement[];
    }
  ) {
    //Select canvas element
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    options?.elements?.forEach((element) => {
      //Assign each element passed to options to its correct place
      assignCorrectly(element, this.tools);
      assignCorrectly(element, this.toolModifiers);
      assignCorrectly(element, this.canvasModifiers);
    });

    //Check if width and height has been set
    options?.width
      ? (canvas.width = options.width)
      : (canvas.width = window.innerWidth - canvas.offsetLeft);
    options?.height
      ? (canvas.height = options.height)
      : (canvas.height = window.innerHeight - canvas.offsetTop);

    //Save canvas and context in class
    this.canvas = canvas;
    this.context = context;

    //Assign default values
    this.canvas.style.cursor = "crosshair";

    //Set selected tool as pencil if exists
    this.tools.pencil &&
      ((this.selectedTool.element = this.tools.pencil), (this.selectedTool.name = "pencil"));
    this.selectedTool.element?.classList.add("active");
    this.activeTools[this.selectedTool.name as keyof ToolStates] = true;

    //Add eventlisteners to canvas
    this.listen();
  }

  //Listen for events and call correct function
  private listen() {
    const canvas = this.canvas;
    const controller = this.controller;

    canvas.addEventListener("mousedown", this.pressDownHandler);
    canvas.addEventListener("mouseup", this.mouseUpHandler);
    canvas.addEventListener("mousemove", this.mouseMoveHandler);

    canvas.addEventListener("touchstart", this.pressDownHandler);
    canvas.addEventListener("touchend", this.mouseUpHandler);
    canvas.addEventListener("touchmove", this.mouseMoveHandler);

    controller?.addEventListener("change", this.changeHandler);
    controller?.addEventListener("click", this.toolSelectHandler);
  }

  //Controller Change handler
  private changeHandler = (e: Event) => {
    const target = e.target as HTMLInputElement;

    const colorPicker = this.toolModifiers.color;
    const lineWidthPicker = this.toolModifiers.width;

    if (colorPicker && this.targetIs(colorPicker, target)) {
      //Change current path object strokeStyle
      this.pathObject.strokeStyle = target.value;
    }

    if (lineWidthPicker && this.targetIs(lineWidthPicker, target)) {
      this.pathObject.lineWidth = Number(target.value);
    }
  };

  //Controller click handler
  private toolSelectHandler = (e: Event) => {
    this.selectedDrawingIndex = null;

    const target = e.target as HTMLElement | HTMLButtonElement | HTMLInputElement;
    const context = this.context;

    //Filter out nullish value props
    const definedTools = excludeNullishProps(this.tools);
    const definedCanvasModifiers = excludeNullishProps(this.canvasModifiers);

    if (Object.keys(definedTools).length > 0) {
      //Loop each defined element and check which of them are the target
      Object.entries(definedTools).forEach(([k, v]) => {
        //IF tool is target
        if (v === target) {
          //Store tool name and element as selected
          this.selectedTool.element = v;
          this.selectedTool.name = k as keyof ToolStates;
        } else {
          this.activeTools[k as keyof ToolStates] = false;
          v?.classList.remove("active");
        }
      });

      //Add active class for the selected tool and update activeTools object
      this.selectedTool.element?.classList.add("active");
      this.activeTools[this.selectedTool.name as keyof ToolStates] = true;

      //Set correct cursor based on selectedTool
      this.selectedTool.name === "pencil" ||
        this.selectedTool.name === "eraser" ||
        this.selectedTool.name === "line"
        ? (this.canvas.style.cursor = "crosshair")
        : this.selectedTool.name === "text"
          ? (this.canvas.style.cursor = "text")
          : (this.canvas.style.cursor = "default");
    }

    if (Object.keys(definedCanvasModifiers).length > 0) {
      if (definedCanvasModifiers.clear === target) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.index = -1;

        this.drawingData = [];
      }

      if (definedCanvasModifiers.undo === target) {
        if (this.index <= 0) {
          context.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.index = -1;
          this.drawingData = [];
        } else {
          this.index -= 1;
          this.drawingData.pop();

          this.redraw(this.drawingData);
        }
      }
    }
  };

  //Handles pressdown/click
  private pressDownHandler = (e: MouseEvent | TouchEvent) => {
    this.mouseIsDown = true;

    if (this.actions.writing) return;
    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);

    const { pencil, eraser, moveAndResize, text, line } = this.activeTools;

    const mouseY = evtType.clientY - this.canvas.offsetTop;
    const mouseX = evtType.clientX - this.canvas.offsetLeft;

    //Store starting positions
    this.startX = mouseX;
    this.startY = mouseY;

    //IF eraser is the active tool
    if (eraser) {
      this.pathObject.operation = "destination-out";

      this.shouldErase = true;

      this.addCoords(mouseX, mouseY, false);
    }

    if (pencil) {
      this.pathObject.operation = "source-over";

      this.shouldDraw = true;

      this.addCoords(mouseX, mouseY, false);
    }

    if (moveAndResize) {
      //IF no paths
      if (this.drawingData.length <= 0) return;

      //IF there already is a selected drawing
      if (typeof this.selectedDrawingIndex === "number") {
        const selected = this.drawingData[this.selectedDrawingIndex];

        //Get position of mouse within drawing
        const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, selected);

        //IF mouse is not in drawing anymore then disselect
        if (selectionPosition === SelectionPosition.NONE) this.selectedDrawingIndex = null;

        //IF mouse is inside the selection THEN check if move or resize
        selectionPosition === SelectionPosition.MIDDLE
          ? (this.shouldMove = true)
          : ((this.shouldResize.toggled = true),
            (this.shouldResize.from = selectionPosition));
      }

      //Loop through each drawing and check if one has been clicked on and set that as the selected drawing
      this.drawingData.forEach((drawing, i) => {
        if (drawing.type === "text") {
          //If its text we only need to check if its within selection since it doesn't have a stroke
          if (this.mouseWithinSelection(mouseX, mouseY, drawing) !== SelectionPosition.NONE) {
            this.selectedDrawingIndex = i;

            const selected = this.drawingData[this.selectedDrawingIndex];

            const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, selected);

            selectionPosition === SelectionPosition.MIDDLE
              ? (this.shouldMove = true)
              : ((this.shouldResize.toggled = true),
                (this.shouldResize.from = selectionPosition));

          }
          return;
        }

        //If its stroke or line we need to check if its within stroke
        if (this.context.isPointInStroke(drawing.path, mouseX, mouseY)) {
          this.selectedDrawingIndex = i;

          const selected = this.drawingData[this.selectedDrawingIndex];

          //Then check mouse position if we should resize or move
          const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, selected);

          selectionPosition === SelectionPosition.MIDDLE
            ? (this.shouldMove = true)
            : ((this.shouldResize.toggled = true),
              (this.shouldResize.from = selectionPosition));
        }
      });
    }

    if (text) {
      const canvasContainer = <HTMLElement>document.querySelector(".drawing-board");

      //Create textinput
      const textInput = createPersonalElement("input", canvasContainer, {
        position: "fixed",
        top: `${evtType.clientY}px`,
        left: `${evtType.clientX}px`,
        outline: "none",
        background: "none",
        border: "none",
        "font-size": "30pt",
        "font-family": "sans-serif",
      });

      //We are now writing
      this.actions.writing = true;

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
        this.index = incOrDec(this.index, "increment", 1);
        this.drawingData.push(this.textObject);

        canvasContainer.removeChild(textInput);

        this.actions.writing = false;

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

      textInput.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          textInput.blur();
        }
      });

      canvasContainer?.appendChild(textInput);
    }

    if (line) {
      if (this.actions.lining) return; //So it jumps to mouseup

      this.lineObject.operation = "source-over";

      //Signal that we are trying to draw a line
      this.shouldLine = true;

      this.lineObject.path.moveTo(mouseX, mouseY);
      //Init start coordinates
      this.lineObject.coords = { startX: mouseX, startY: mouseY };
    }
  };

  //Handles mouse release
  private mouseUpHandler = () => {
    //Reset states
    this.mouseIsDown = false;
    this.shouldMove = false;
    this.actions.moving = false;

    if (this.actions.drawing || this.actions.erasing) {
      this.shouldDraw = false;
      this.shouldErase = false;

      this.actions.drawing = false;
      this.actions.erasing = false;

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
      this.index = incOrDec(this.index, "increment", 1);
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

    if (this.actions.resizing) {
      this.shouldResize = { toggled: false, from: SelectionPosition.NONE };
      this.actions.resizing = false;

      if (typeof this.selectedDrawingIndex === "number") {
        const selectedDrawing = this.drawingData[this.selectedDrawingIndex];

        this.updateToResized(selectedDrawing);
      }
    }

    if (this.actions.lining) {
      this.shouldLine = false;
      this.actions.lining = false;

      //Set end points
      this.lineObject.coords.endX = this.mouseX;
      this.lineObject.coords.endY = this.mouseY;

      //Take the path and line it to end
      this.lineObject.path.lineTo(this.mouseX, this.mouseY);

      //Save new line
      this.index = incOrDec(this.index, "increment", 1);
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
  private mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
    const evtType = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);

    //Current mouse positions
    const mouseX = evtType.clientX - this.canvas.offsetLeft;
    const mouseY = evtType.clientY - this.canvas.offsetTop;

    //Store current mousePosition
    this.mouseX = mouseX;
    this.mouseY = mouseY;

    this.mouseIsDown ? (this.isDragging = true) : (this.isDragging = false);

    // If move and resize tool is active
    if (this.activeTools.moveAndResize) {
      //Reset cursor style
      this.canvas.style.cursor = "default";
      //Loop through and set correct cursor based on the selectionPosition
      this.drawingData.forEach((drawing, i) => {
        //If the current drawing is a stroke and we have not selected it then we check if it's within the stroke first
        if (drawing.type === "stroke" && this.selectedDrawingIndex !== i) {
          this.context.isPointInStroke(drawing.path, mouseX, mouseY) ? this.canvas.style.cursor = "move" : "default";

          return;
        }

        //Get position within selection
        const selectionPosition = this.mouseWithinSelection(mouseX, mouseY, drawing);

        //Style accordingly
        this.setCursorStyles(selectionPosition);

      });
    }

    //IF we have a selected drawing and we are dragging
    if (typeof this.selectedDrawingIndex === "number" && this.isDragging) {
      //Move with respect to current mouse
      const dx = mouseX - this.startX;
      const dy = mouseY - this.startY;

      //Selected drawing
      const selectedDrawing = this.drawingData[this.selectedDrawingIndex];

      //Coords are required IF not present then throw an error
      assertRequired(selectedDrawing.coords);

      switch (selectedDrawing.type) {
        case "stroke":
          {
            if (this.shouldMove) {
              this.actions.moving = true;
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
            } else {
              const from = this.shouldResize.from;
              this.actions.resizing = true;

              const { scaleOriginXPos, scaleOriginYPos, scale } = this.getScaleInfo(
                from,
                selectedDrawing,
                mouseX,
                mouseY
              );

              const scaleOriginX = scaleOriginXPos;
              const scaleOriginY = scaleOriginYPos;

              const scaleFactor = scale;

              const resizedPath = new Path2D();

              //Create copy
              const resizedXCords = [...selectedDrawing.xCords];
              const resizedYCords = [...selectedDrawing.yCords];

              const originalDistanceX = [];
              const originalDistanceY = [];

              //Calculate original distance between origin and x,y coordinates
              for (let i = 0; i < selectedDrawing.xCords.length; i++) {
                originalDistanceX[i] = scaleOriginX - selectedDrawing.xCords[i];
                originalDistanceY[i] = scaleOriginY - selectedDrawing.yCords[i];
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
              selectedDrawing.resizedCoords.resizedX1 = Math.min(...resizedXCords);
              selectedDrawing.resizedCoords.resizedY1 = Math.min(...resizedYCords);
              selectedDrawing.resizedCoords.resizedX2 = Math.max(...resizedXCords);
              selectedDrawing.resizedCoords.resizedY2 = Math.max(...resizedYCords);

              selectedDrawing.resizedXCords = resizedXCords;
              selectedDrawing.resizedYCords = resizedYCords;

              selectedDrawing.resizedPath = resizedPath;
            }
          }
          break;
        case "text":
          {
            if (this.shouldMove) {
              this.actions.moving = true;

              //Assign new coordinates
              for (const k of Object.keys(selectedDrawing.coords)) {
                k.includes("x") ? selectedDrawing.coords[k as keyof SelectionCoords] += dx : selectedDrawing.coords[k as keyof SelectionCoords] += dy;
              }

              this.startX = mouseX;
              this.startY = mouseY;
            } else {
              const from = this.shouldResize.from;
              this.actions.resizing = true;
              const { scaleOriginXPos, scaleOriginYPos, startCornerXPos, startCornerYPos, scale } =
                this.getScaleInfo(from, selectedDrawing, mouseX, mouseY);

              const startCornerX = startCornerXPos;
              const startCornerY = startCornerYPos;

              const scaleOriginX = scaleOriginXPos;
              const scaleOriginY = scaleOriginYPos;

              //Scale factor based on mouse
              const scaleFactor = scale;

              //Create copy of original font string
              const fontStringCopy = selectedDrawing.font.slice();

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
              const newFont = fontStringCopy.replace(
                fontSize.toString(),
                resizedFontSize.toString()
              );

              //Store new left and right
              if (from === SelectionPosition.TOP_LEFT || from === SelectionPosition.BOTTOM_LEFT) {
                selectedDrawing.resizedCoords.resizedX1 = scaleOriginX - newDistanceX;
                selectedDrawing.resizedCoords.resizedX2 = scaleOriginX;
              } else {
                selectedDrawing.resizedCoords.resizedX1 = scaleOriginX;
                selectedDrawing.resizedCoords.resizedX2 = scaleOriginX - newDistanceX;
              }

              //Store new top and bottom
              if (from === SelectionPosition.TOP_LEFT || from === SelectionPosition.TOP_RIGHT) {
                selectedDrawing.resizedCoords.resizedY1 = scaleOriginY - newDistanceY;
                selectedDrawing.resizedCoords.resizedY2 = scaleOriginY;
              } else {
                selectedDrawing.resizedCoords.resizedY1 = scaleOriginY;
                selectedDrawing.resizedCoords.resizedY2 = scaleOriginY - newDistanceY;
              }

              //Store the new font size
              selectedDrawing.resizedFont = newFont;
            }
          }
          break;
        case "line":
          {
            if (this.shouldMove) {
              this.actions.moving = true;

              //Assign new start and end coordinates
              for (const k of Object.keys(selectedDrawing.coords)) {
                k.includes("X") ? selectedDrawing.coords[k as keyof LineSelectionCoords] += dx : selectedDrawing.coords[k as keyof LineSelectionCoords] += dy;
              }

              //Create new path from existing path
              const newPath = new Path2D();
              const m = new DOMMatrix().translate(dx, dy);
              newPath.addPath(selectedDrawing.path, m);

              selectedDrawing.path = newPath;

              this.startX = mouseX;
              this.startY = mouseY;
            } else {
              const from = this.shouldResize.from;

              this.actions.resizing = true;

              const { scaleOriginXPos, scaleOriginYPos, startCornerXPos, startCornerYPos } =
                this.getScaleInfo(from, selectedDrawing, mouseX, mouseY);

              const resizedPath = new Path2D();

              const startCornerX = startCornerXPos;
              const startCornerY = startCornerYPos;

              const scaleOriginX = scaleOriginXPos;
              const scaleOriginY = scaleOriginYPos;

              //Assign start and end x
              if (startCornerX === selectedDrawing.coords.startX) {
                selectedDrawing.resizedCoords.resizedStartX = mouseX;
                selectedDrawing.resizedCoords.resizedEndX = scaleOriginX;
              } else {
                selectedDrawing.resizedCoords.resizedStartX = scaleOriginX;
                selectedDrawing.resizedCoords.resizedEndX = mouseX;
              }
              //Assign start and end y
              if (startCornerY === selectedDrawing.coords.startY) {
                selectedDrawing.resizedCoords.resizedStartY = mouseY;
                selectedDrawing.resizedCoords.resizedEndY = scaleOriginY;
              } else {
                selectedDrawing.resizedCoords.resizedStartY = scaleOriginY;
                selectedDrawing.resizedCoords.resizedEndY = mouseY;
              }

              this.context.beginPath();
              resizedPath.moveTo(mouseX, mouseY);
              resizedPath.lineTo(scaleOriginX, scaleOriginY);

              selectedDrawing.resizedPath = resizedPath;
            }
          }

          break;
      }

      this.redraw(this.drawingData);
    }

    if ((this.shouldDraw && this.isDragging) || (this.shouldErase && this.isDragging)) {
      this.shouldDraw ? (this.actions.drawing = true) : (this.actions.drawing = false);
      this.shouldErase ? (this.actions.erasing = true) : (this.actions.erasing = false);
      this.redraw(this.drawingData);

      //Set props for current path object
      this.setCtxStyles(this.pathObject);

      this.addCoords(mouseX, mouseY, true);

      this.pathObject.path.lineTo(mouseX, mouseY);
      this.context.stroke(this.pathObject.path);
    }

    if (this.shouldLine) {
      this.actions.lining = true;
      //Redraw data
      this.redraw(this.drawingData);

      this.setCtxStyles(this.lineObject);

      //Begin current path
      this.context.beginPath();
      //Move context to start position of lineObject
      this.context.moveTo(
        this.lineObject.coords.startX as number,
        this.lineObject.coords.startY as number
      ); //We know that since we "shouldLine" we have clicked so we can say as

      //Draw a line to current mouse position
      this.context.lineTo(mouseX, mouseY);
      //Close the path and save -> repeat while moving
      this.context.closePath();

      this.context.stroke();
    }

    e.preventDefault();
  };

  //Function that updates given drawings coords to resized coords
  private updateToResized(drawing: DrawingElements) {
    if (drawing.type === "stroke") {
      drawing.xCords = drawing.resizedXCords;
      drawing.yCords = drawing.resizedYCords;

      drawing.coords.x1 = Math.min(...drawing.xCords);
      drawing.coords.y1 = Math.min(...drawing.yCords);
      drawing.coords.x2 = Math.max(...drawing.xCords);
      drawing.coords.y2 = Math.max(...drawing.yCords);

      drawing.path = drawing.resizedPath as Path2D;
    } else if (drawing.type === "text") {
      drawing.coords.x1 = drawing.resizedCoords.resizedX1;
      drawing.coords.y1 = drawing.resizedCoords.resizedY1;
      drawing.coords.x2 = drawing.resizedCoords.resizedX2;
      drawing.coords.y2 = drawing.resizedCoords.resizedY2;

      drawing.font = drawing.resizedFont;
    } else {
      drawing.coords.startX = drawing.resizedCoords.resizedStartX;
      drawing.coords.endX = drawing.resizedCoords.resizedEndX;
      drawing.coords.startY = drawing.resizedCoords.resizedStartY;
      drawing.coords.endY = drawing.resizedCoords.resizedEndY;

      drawing.path = drawing.resizedPath as Path2D;
    }
  }

  //Adds each coordinate to array
  private addCoords(x: number, y: number, dragging: boolean) {
    this.pathObject.xCords.push(x);
    this.pathObject.yCords.push(y);
    this.isDragging = dragging;
  }

  //Function that returns correct coordinates and scalefactor for scaling
  private getScaleInfo(
    from: SelectionPosition,
    element: DrawingElements,
    currentMouseX: number,
    currentMouseY: number
  ) {
    assertRequired(element.coords);

    if (element.type === "line") {
      const startCornerX = from === SelectionPosition.START ? element.coords.startX : element.coords.endX;
      const startCornerY = from === SelectionPosition.START ? element.coords.startY : element.coords.endY;

      const scaleOriginX = from === SelectionPosition.START ? element.coords.endX : element.coords.startX;
      const scaleOriginY = from === SelectionPosition.START ? element.coords.endY : element.coords.startY;
      return {
        scaleOriginXPos: scaleOriginX,
        scaleOriginYPos: scaleOriginY,
        startCornerXPos: startCornerX,
        startCornerYPos: startCornerY,
        scale: 0,
      };
    } else {
      //IF scaling from the left side then start = left : start = right;
      const startCornerX = from.includes("LEFT") ? element.coords.x1 : element.coords.x2;
      const startCornerY = from.includes("TOP") ? element.coords.y1 : element.coords.y2;

      //IF scaling from left side then origin is opposite side so that we scale inwards or outwards based on corner
      const scaleOriginX = from.includes("LEFT") ? element.coords.x2 : element.coords.x1;
      const scaleOriginY = from.includes("TOP") ? element.coords.y2 : element.coords.y1;

      //For the scaling to work properly i also need where we scale from
      //Since scaling from left side to right side would not work with e.g (x1 - x2 so instead x2 - x1 for distance)
      const originalDistance = from.includes("LEFT")
        ? scaleOriginX - startCornerX
        : startCornerX -
        scaleOriginX +
        (from.includes("TOP") ? scaleOriginY - startCornerY : startCornerY - scaleOriginY);

      const currentDistance = from.includes("LEFT")
        ? scaleOriginX - currentMouseX
        : currentMouseX -
        scaleOriginX +
        (from.includes("TOP") ? scaleOriginY - currentMouseY : currentMouseY - scaleOriginY);

      const scaleFactor = currentDistance / originalDistance;

      return {
        scaleOriginXPos: scaleOriginX,
        scaleOriginYPos: scaleOriginY,
        startCornerXPos: startCornerX,
        startCornerYPos: startCornerY,
        scale: scaleFactor,
      };
    }
  }

  //Checks if mouse is within selection rectangle for those that have it
  private mouseWithinSelection(x: number, y: number, drawing: DrawingElements): SelectionPosition {
    assertRequired(drawing.coords);

    let mouseIsIn: SelectionPosition;

    //Fine if its close enough
    const offset = 10;

    if (drawing.type === "line") {
      const { startX, endX, startY, endY } = drawing.coords;

      const startX1 = startX - offset;
      const startX2 = startX + offset;
      const startY1 = startY - offset;
      const startY2 = startY + offset;

      const endX1 = endX - offset;
      const endX2 = endX + offset;
      const endY1 = endY - offset;
      const endY2 = endY + offset;

      mouseIsIn = this.mouseWithin(startX1, startX2, startY1, startY2, x, y)
        ? SelectionPosition.START
        : this.mouseWithin(endX1, endX2, endY1, endY2, x, y)
          ? SelectionPosition.END
          : this.context.isPointInStroke(drawing.path, x, y)
            ? SelectionPosition.MIDDLE
            : SelectionPosition.NONE;
    } else {
      const { x1, y1, x2, y2 } = drawing.coords;

      //Top left rectangle
      const topLeftX1 = x1 - offset;
      const topLeftX2 = x1 + offset;
      const topLeftY1 = y1 - offset;
      const topLeftY2 = y1 + offset;
      //Top right rectangle
      const topRightX1 = x2 - offset;
      const topRightX2 = x2 + offset;
      const topRightY1 = y1 - offset;
      const topRightY2 = y1 + offset;
      //Bottom right rectangle
      const bottomRightX1 = x2 - offset;
      const bottomRightX2 = x2 + offset;
      const bottomRightY1 = y2 - offset;
      const bottomRightY2 = y2 + offset;
      //Bottom left rectangle
      const bottomLeftX1 = x1 - offset;
      const bottomLeftX2 = x1 + offset;
      const bottomLeftY1 = y2 - offset;
      const bottomLeftY2 = y2 + offset;

      mouseIsIn = this.mouseWithin(topLeftX1, topLeftX2, topLeftY1, topLeftY2, x, y)
        ? SelectionPosition.TOP_LEFT
        : this.mouseWithin(topRightX1, topRightX2, topRightY1, topRightY2, x, y)
          ? SelectionPosition.TOP_RIGHT
          : this.mouseWithin(bottomRightX1, bottomRightX2, bottomRightY1, bottomRightY2, x, y)
            ? SelectionPosition.BOTTOM_RIGHT
            : this.mouseWithin(bottomLeftX1, bottomLeftX2, bottomLeftY1, bottomLeftY2, x, y)
              ? SelectionPosition.BOTTOM_LEFT
              : this.mouseWithin(x1, x2, y1, y2, x, y)
                ? SelectionPosition.MIDDLE
                : SelectionPosition.NONE;
    }

    return mouseIsIn;
  }

  //Function for well.. creating a drawing selection
  private createDrawingSelection(drawing: DrawingElements) {
    this.context.globalCompositeOperation = "source-over";
    this.context.strokeStyle = "#738FE5";

    this.context.lineWidth = 1;

    if (drawing.type === "stroke" || drawing.type === "text") {
      const coords = getCorrectCoords(drawing, this.actions.resizing);
      const width = coords.x2 - coords.x1;
      const height = coords.y2 - coords.y1;

      //Draw main rectangle
      this.context.strokeRect(coords.x1, coords.y1, width, height);

      //Draw corners
      this.drawCornerPoints(drawing);
    } else {
      const coords = getCorrectCoords(drawing, this.actions.resizing);
      //Draw line from start to end
      this.context.lineWidth = 1;
      this.context.moveTo(coords.startX, coords.startY);
      this.context.lineTo(coords.endX, coords.endY);
      this.context.stroke();

      this.drawCornerPoints(drawing);
    }
  }

  //Function for drawing corner points :P
  private drawCornerPoints(drawing: DrawingElements) {
    this.context.lineWidth = 5;
    let x: number;
    let y: number;

    if (drawing.type === "stroke" || drawing.type === "text") {
      const coords = getCorrectCoords(drawing, this.actions.resizing);

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
    } else {
      const coords = getCorrectCoords(drawing, this.actions.resizing);

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

  //Checks if mouse is within given coordinates
  private mouseWithin(x1: number, x2: number, y1: number, y2: number, x: number, y: number) {
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) return true;

    return false;
  }

  //Function for setting styles based on drawing
  private setCtxStyles(drawing: DrawingElements) {
    this.context.globalCompositeOperation = drawing.operation;
    this.context.lineCap = "round";

    if (drawing.type === "stroke" || drawing.type === "line") {
      this.context.lineWidth = drawing.lineWidth;
      this.context.strokeStyle = drawing.strokeStyle;
    } else if (drawing.type === "text") {
      this.context.textBaseline = drawing.baseline as CanvasTextBaseline;
      this.context.font = drawing.font;
    }
  }

  //Function for setting cursor styles
  private setCursorStyles(mousePos: SelectionPosition) {
    if (mousePos === SelectionPosition.BOTTOM_LEFT || mousePos === SelectionPosition.TOP_RIGHT) {
      this.canvas.style.cursor = "nesw-resize";
    } else if (mousePos === SelectionPosition.TOP_LEFT || mousePos === SelectionPosition.BOTTOM_RIGHT) {
      this.canvas.style.cursor = "nwse-resize";
    } else if (mousePos === SelectionPosition.START || mousePos === SelectionPosition.END) {
      this.canvas.style.cursor = "pointer"
    } else if (mousePos === SelectionPosition.MIDDLE) {
      this.canvas.style.cursor = "move";
    }



  }

  //Function for redrawing canvas when interactive
  private redraw(drawingData: DrawingElements[]) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (drawingData.length <= 0) return;

    drawingData.forEach((drawing, i) => {
      if (this.selectedDrawingIndex === i) this.createDrawingSelection(drawing);

      this.setCtxStyles(drawing);

      //Override the globalCompositeOperation from setCtxStyles function so that the selection will always be over even though it was drawn first
      this.context.globalCompositeOperation = "destination-over";

      if (drawing.type === "text") {
        //If we are resizing AND the selected drawing is the current drawing in the array THEN draw it using the resized values
        this.actions.resizing && this.selectedDrawingIndex === i ?
          (this.context.font = drawing.resizedFont, this.context.fillText(drawing.text, drawing.resizedCoords.resizedX1 ?? 0, drawing.resizedCoords.resizedY1 ?? 0))
          : this.context.fillText(drawing.text, drawing.coords.x1 ?? 0, drawing.coords.y1 ?? 0);

        return;
      }

      this.actions.resizing && this.selectedDrawingIndex === i ? this.context.stroke(drawing.resizedPath as Path2D) : this.context.stroke(drawing.path)
    });
  }

  //Function that checks if given element is target
  private targetIs(
    element: HTMLButtonElement | HTMLInputElement | HTMLElement,
    target: HTMLButtonElement | HTMLInputElement | HTMLElement
  ) {
    if (
      (target.id && target.id === element.id) ||
      (target.className && target.className === element.className)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

new DrawingCanvas("drawing-board");
