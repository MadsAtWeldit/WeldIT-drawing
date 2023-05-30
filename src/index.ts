enum DrawingElementType {
  controller = "controller",
  pencil = "pencil",
  eraser = "eraser",
  colorPicker = "colorPicker",
  lineWidth = "lineWidth",
  clearCanvas = "clearCanvas",
  moveAndResize = "moveAndResize",
  undo = "undo",
  text = "text",
  rectangle = "rectangle",
}

interface OptionElementsI {
  readonly controller: HTMLElement | null;
  readonly pencil: HTMLButtonElement | null;
  readonly eraser: HTMLButtonElement | null;
  readonly colorPicker: HTMLInputElement | null;
  readonly lineWidthPicker: HTMLInputElement | null;
  readonly clearCanvas: HTMLButtonElement | null;
  readonly moveAndResize: HTMLButtonElement | null;
  readonly undo: HTMLButtonElement | null;
  readonly text: HTMLButtonElement | null;
  readonly rectangle: HTMLButtonElement | null;
}

interface CanvasElement {
  type: DrawingElementType;
  className?: string;
  id?: string;
}

interface ToggledStates {
  shouldDraw: boolean;
  shouldErase: boolean;
  shouldMove: boolean;
  shouldWrite: boolean;
}

interface PathElement {
  type: "stroke";
  path: Path2D;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xCords: number[];
  yCords: number[];
}

interface TextElement {
  type: "text";
  text: string;
  font: string;
  baseline: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  operation: "source-over" | "destination-out";
}

type DrawingElements = PathElement | TextElement;

//Type that removes readonly so we can assign values inside class
type Writable<T> = { -readonly [K in keyof T]: T[K] };
type WritableDrawingCanvas = Writable<DrawingCanvas>;

class DrawingCanvas implements OptionElementsI {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  //Elements for controlling canvas props
  readonly controller = document.getElementById("toolbar") as HTMLElement;
  readonly pencil = document.getElementById("pencil") as HTMLButtonElement;
  readonly eraser = document.getElementById("eraser") as HTMLButtonElement;
  readonly colorPicker = document.getElementById("color") as HTMLInputElement;
  readonly lineWidthPicker = document.getElementById(
    "lineWidth"
  ) as HTMLInputElement;
  readonly clearCanvas = document.getElementById("clear") as HTMLButtonElement;
  readonly moveAndResize = document.getElementById(
    "mv-rz"
  ) as HTMLButtonElement;
  readonly undo = document.getElementById("undo") as HTMLButtonElement;
  readonly text = document.getElementById("text") as HTMLButtonElement;
  readonly rectangle = document.getElementById(
    "rectangle"
  ) as HTMLButtonElement;

  //For state tracking
  private isDrawing = false;
  private isErasing = false;
  private isMovingAndResizing = false;
  private isWriting = false;

  private shouldDraw = false;
  private shouldErase = false;
  private shouldMove = false;
  private shouldWrite = false;

  private index = -1;
  private selectedDrawingIndex: number | null = null;

  //Create default path object
  private pathObject: PathElement = {
    type: "stroke",
    path: new Path2D(),
    lineWidth: 5,
    strokeStyle: "black",
    operation: "source-over",
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    xCords: [],
    yCords: [],
  };

  //Create default text object
  private textObject: TextElement = {
    type: "text",
    text: "",
    font: "30pt sans-serif",
    baseline: "top",
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    operation: "source-over",
  };

  private drawingData: DrawingElements[] = [];

  private lineWidth: number;
  private strokeStyle: string;

  private startX = 0;
  private startY = 0;

  constructor(
    elementId: string,

    options?: {
      width?: number;
      height?: number;
      elements?: CanvasElement[];
    }
  ) {
    //Select canvas element
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    //Check if any elements are passed
    if (options?.elements) {
      //THEN loop through each element and reassign element props
      options.elements.forEach((element) => this.storeElements(element));
    }

    //Check if width and height has been set
    options?.width
      ? (canvas.width = options.width)
      : (canvas.width = window.innerWidth - canvas.offsetLeft);
    options?.height
      ? (canvas.height = options.height)
      : (canvas.height = window.innerHeight - canvas.offsetTop);

    //Save canvas and context
    this.canvas = canvas;
    this.context = context;

    //Assign default values
    this.canvas.style.cursor = "crosshair";
    this.pencil?.classList.add("active");
    this.shouldDraw = true;

    //Add eventlisteners to canvas
    this.listen();
  }

  //Runs for each element passed to options
  private storeElements = (currentElement: CanvasElement) => {
    //Loop through class props
    Object.keys(this).map((currentProp) => {
      if (currentElement.type === currentProp) {
        const classProp = currentProp as keyof OptionElementsI;

        if (currentElement.className) {
          const element = document.querySelector(
            "." + currentElement.className
          ) as HTMLElement & HTMLButtonElement & HTMLInputElement; //Needs to be intersection to safely assign to lhs

          //Same as saying this.element = element
          this.assignToProp(classProp, element);
        }

        if (currentElement.id) {
          const element = document.getElementById(
            currentElement.id
          ) as HTMLElement & HTMLButtonElement & HTMLInputElement;

          this.assignToProp(classProp, element);
        }
      }
    });
  };

  //Listen for events on given canvas
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
  private toolSelectHandler = (e: MouseEvent) => {
    this.selectedDrawingIndex = null;
    const target = e.target as HTMLButtonElement;

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

      this.drawingData = [];
    }

    if (undo && this.targetIs(undo, target)) {
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

    if (pen && this.targetIs(pen, target)) {
      this.canvas.style.cursor = "crosshair";
      this.handleToggle(
        [{ element: pen, stateName: "shouldDraw" }],
        [
          { element: eraser, stateName: "shouldErase" },
          { element: moveAndResize, stateName: "shouldMove" },
          { element: text, stateName: "shouldWrite" },
        ]
      );
    }

    if (eraser && this.targetIs(eraser, target)) {
      this.canvas.style.cursor = "crosshair";
      this.handleToggle(
        [{ element: eraser, stateName: "shouldErase" }],
        [
          { element: pen, stateName: "shouldDraw" },
          { element: moveAndResize, stateName: "shouldMove" },
          { element: text, stateName: "shouldWrite" },
        ]
      );
    }

    if (moveAndResize && this.targetIs(moveAndResize, target)) {
      this.canvas.style.cursor = "default";
      this.handleToggle(
        [{ element: moveAndResize, stateName: "shouldMove" }],
        [
          { element: pen, stateName: "shouldDraw" },
          { element: eraser, stateName: "shouldErase" },
          { element: text, stateName: "shouldWrite" },
        ]
      );
    }

    if (text && this.targetIs(text, target)) {
      this.canvas.style.cursor = "text";
      this.handleToggle(
        [{ element: text, stateName: "shouldWrite" }],
        [
          { element: pen, stateName: "shouldDraw" },
          { element: eraser, stateName: "shouldErase" },
          { element: moveAndResize, stateName: "shouldMove" },
        ]
      );
    }
  };

  //Runs whenever mouse is clicked
  private pressDownHandler = (e: MouseEvent | TouchEvent) => {
    if (this.isWriting) return;
    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    const mouseY = evtType.clientY - this.canvas.offsetTop;
    const mouseX = evtType.clientX - this.canvas.offsetLeft;

    //Store starting positions
    this.startX = mouseX;
    this.startY = mouseY;

    //IF element has been selected when we click on canvas
    if (this.shouldErase) {
      this.pathObject.operation = "destination-out";
      this.isErasing = true;

      this.isDrawing = false;
      this.isMovingAndResizing = false;
      this.isWriting = false;

      this.pathObject.xCords.push(mouseX);
      this.pathObject.yCords.push(mouseY);
      this.pathObject.path.moveTo(mouseX, mouseY);
    }

    if (this.shouldDraw) {
      this.pathObject.operation = "source-over";
      this.isDrawing = true;

      this.isErasing = false;
      this.isMovingAndResizing = false;
      this.isWriting = false;

      this.pathObject.xCords.push(mouseX);
      this.pathObject.yCords.push(mouseY);
      this.pathObject.path.moveTo(mouseX, mouseY);
    }

    if (this.shouldMove) {
      this.isMovingAndResizing = true;
      this.isDrawing = false;
      this.isErasing = false;
      this.isWriting = false;

      //IF no paths
      if (this.drawingData.length <= 0) return;

      //IF there is a selected drawing
      if (this.selectedDrawingIndex !== null) {
        const selected = this.drawingData[this.selectedDrawingIndex];

        if (
          this.mouseInSelection(
            mouseX,
            mouseY,
            selected.x1,
            selected.x2,
            selected.y1,
            selected.y2
          )
        ) {
          switch (
            this.mouseInSelectionCorner(
              mouseX,
              mouseY,
              selected.x1,
              selected.x2,
              selected.y1,
              selected.y2
            )
          ) {
            case "top-left":
              console.log("top-left");
              break;
            case "top-right":
              console.log("top-right");
              break;
            case "bottom-right":
              console.log("bottom-right");
              break;
            case "bottom-left":
              console.log("bottom-left");
              break;
          }
          return;
        }

        //THEN loop each drawing
        this.drawingData.forEach((drawing, i) => {
          if (drawing.type === "stroke") {
            if (this.context.isPointInPath(drawing.path, mouseX, mouseY)) {
              this.selectedDrawingIndex = i;
              this.redraw(this.drawingData);
            } else {
              this.selectedDrawingIndex = null;
              this.redraw(this.drawingData);
            }
          }
          if (drawing.type === "text") {
            if (
              this.mouseInSelection(
                mouseX,
                mouseY,
                drawing.x1,
                drawing.x2,
                drawing.y1,
                drawing.y2
              )
            ) {
              this.selectedDrawingIndex = i;
              this.redraw(this.drawingData);
            } else {
              this.selectedDrawingIndex = null;
              this.redraw(this.drawingData);
            }
          }
        });
      }

      //IF there is no selected drawing
      this.drawingData.forEach((drawing, i) => {
        if (drawing.type === "stroke") {
          if (this.context.isPointInPath(drawing.path, mouseX, mouseY)) {
            this.selectedDrawingIndex = i;
            this.redraw(this.drawingData);
          }
        }

        if (drawing.type === "text") {
          if (
            this.mouseInSelection(
              mouseX,
              mouseY,
              drawing.x1,
              drawing.x2,
              drawing.y1,
              drawing.y2
            )
          ) {
            this.selectedDrawingIndex = i;
            this.redraw(this.drawingData);
          }
        }
      });
    }

    if (this.shouldWrite) {
      const canvasContainer = <HTMLElement>(
        document.querySelector(".drawing-board")
      );

      //Create textinput
      const textInput = <HTMLInputElement>this.createPersonalElement(
        "input",
        "text",
        {
          position: "fixed",
          top: `${evtType.clientY}px`,
          left: `${evtType.clientX}px`,
          background: "transparent",
          outline: "none",
          border: "none",
          "font-size": "30pt",
          "font-family": "sans-serif",
        }
      );

      //We are now writing
      this.isWriting = true;

      this.isDrawing = false;
      this.isErasing = false;
      this.isMovingAndResizing = false;

      //Focus input
      window.setTimeout(() => textInput.focus(), 0);

      //Runs whenever we unfocus input
      textInput.addEventListener("blur", () => {
        this.redraw(this.drawingData);
        //Set start cords and text
        this.textObject.x1 = mouseX;
        this.textObject.y1 = mouseY;
        this.textObject.text = textInput.value;

        //Set context props based on current text
        this.context.textBaseline = this.textObject
          .baseline as CanvasTextBaseline;
        this.context.font = this.textObject.font;
        this.context.globalCompositeOperation = this.textObject.operation;

        //Draw text
        this.context.fillText(
          this.textObject.text,
          this.textObject.x1,
          this.textObject.y1
        );

        //Measure the drawn text
        const textWidth = this.context.measureText(textInput.value).width;
        const textHeight = parseInt(this.context.font);

        //Assign right and bottom coords
        this.textObject.x2 = Math.round(this.textObject.x1 + textWidth);
        this.textObject.y2 = Math.round(this.textObject.y1 + textHeight);

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
          baseline: "top",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
          operation: "source-over",
        };
      });

      textInput.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          textInput.blur();
        }
      });

      canvasContainer?.appendChild(textInput);
    }

    //Begin new path
    //this.context.beginPath();
  };

  //Runs whenever mouse is released
  private mouseUpHandler = () => {
    if (this.isMovingAndResizing) {
      this.isMovingAndResizing = false;

      //No longer selecting anything
      // this.selectedDrawingIndex = null;
      return;
    }

    if (this.isDrawing || this.isErasing) {
      this.isDrawing = false;
      this.isErasing = false;

      //IF its just a click and no stroke
      if (this.pathObject.xCords.length === 1) {
        this.pathObject = {
          type: "stroke",
          path: new Path2D(),
          lineWidth: this.context.lineWidth,
          strokeStyle: String(this.context.strokeStyle),
          operation: "source-over",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
          xCords: [],
          yCords: [],
        };
        return;
      }

      //Set init value for left, top right and bottom
      this.pathObject.x1 = Math.min(...this.pathObject.xCords);
      this.pathObject.y1 = Math.min(...this.pathObject.yCords);
      this.pathObject.x2 = Math.max(...this.pathObject.xCords);
      this.pathObject.y2 = Math.max(...this.pathObject.yCords);

      //Save object
      this.index = this.incOrDec(this.index, "increment", 1);
      this.drawingData.push(this.pathObject);

      //Set new path
      this.pathObject = {
        type: "stroke",
        path: new Path2D(),
        lineWidth: this.context.lineWidth,
        strokeStyle: String(this.context.strokeStyle),
        operation: "source-over",
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        xCords: [],
        yCords: [],
      };
    }
    this.redraw(this.drawingData);

    //Save stroke
    // this.context.stroke();
    // this.context.closePath();
  };

  private mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    //Current mouse positions
    const mouseX = evtType.clientX - this.canvas.offsetLeft;
    const mouseY = evtType.clientY - this.canvas.offsetTop;

    //IF moving tool is toggled
    if (this.shouldMove) {
      this.canvas.style.cursor = "default";

      this.drawingData.forEach((drawing, i) => {
        if (drawing.type === "stroke") {
          if (
            this.context.isPointInPath(drawing.path, mouseX, mouseY) ||
            this.selectedDrawingIndex === i
          ) {
            //IF mouse is in selection rectangle
            if (
              this.mouseInSelection(
                mouseX,
                mouseY,
                drawing.x1,
                drawing.x2,
                drawing.y1,
                drawing.y2
              )
            ) {
              this.canvas.style.cursor = "move";
            }
            //IF mouse is in any of the corners
            switch (
              this.mouseInSelectionCorner(
                mouseX,
                mouseY,
                drawing.x1,
                drawing.x2,
                drawing.y1,
                drawing.y2
              )
            ) {
              case "top-left":
                this.canvas.style.cursor = "nwse-resize";
                break;
              case "top-right":
                this.canvas.style.cursor = "nesw-resize";
                break;
              case "bottom-right":
                this.canvas.style.cursor = "nwse-resize";
                break;
              case "bottom-left":
                this.canvas.style.cursor = "nesw-resize";
                break;
            }
          }
        }
        if (drawing.type === "text") {
          if (
            this.mouseInSelection(
              mouseX,
              mouseY,
              drawing.x1,
              drawing.x2,
              drawing.y1,
              drawing.y2
            )
          ) {
            this.canvas.style.cursor = "move";
          }

          switch (
            this.mouseInSelectionCorner(
              mouseX,
              mouseY,
              drawing.x1,
              drawing.x2,
              drawing.y1,
              drawing.y2
            )
          ) {
            case "top-left":
              this.canvas.style.cursor = "nwse-resize";
              break;
            case "top-right":
              this.canvas.style.cursor = "nesw-resize";
              break;
            case "bottom-right":
              this.canvas.style.cursor = "nwse-resize";
              break;
            case "bottom-left":
              this.canvas.style.cursor = "nesw-resize";
              break;
          }
        }
      });
    }

    //IF we are movingAndResizing
    if (this.isMovingAndResizing) {
      //IF there is no selected element
      if (this.selectedDrawingIndex === null) return;

      const dx = mouseX - this.startX;
      const dy = mouseY - this.startY;

      //Selected drawing
      const selectedPath = this.drawingData[this.selectedDrawingIndex];

      if (selectedPath.type === "stroke") {
        //Update x and y coordinates
        for (let i = 0; i < selectedPath.xCords.length; i++) {
          selectedPath.xCords[i] += dx;
          selectedPath.yCords[i] += dy;
        }
        //Update left, top, right and bottom
        selectedPath.x1 = Math.min(...selectedPath.xCords);
        selectedPath.y1 = Math.min(...selectedPath.yCords);
        selectedPath.x2 = Math.max(...selectedPath.xCords);
        selectedPath.y2 = Math.max(...selectedPath.yCords);

        //Create new path from existing path
        const newPath = new Path2D();
        const m = new DOMMatrix().translate(dx, dy);
        newPath.addPath(selectedPath.path, m);

        selectedPath.path = newPath;
      }

      if (selectedPath.type === "text") {
        //Assign new coordinates
        selectedPath.x1 += dx;
        selectedPath.y1 += dy;

        selectedPath.x2 += dx;
        selectedPath.y2 += dy;
      }

      this.redraw(this.drawingData);

      //Set start positions to current
      this.startX = mouseX;
      this.startY = mouseY;
    }

    if (!this.isDrawing && !this.isErasing) return;
    this.redraw(this.drawingData);

    //Set props for current path object
    this.context.lineCap = "round";
    this.context.lineWidth = this.pathObject.lineWidth;
    this.context.strokeStyle = this.pathObject.strokeStyle;
    this.context.globalCompositeOperation = this.pathObject.operation;

    //Save each x and y to path object
    this.pathObject.xCords.push(mouseX);
    this.pathObject.yCords.push(mouseY);

    this.pathObject.path.lineTo(mouseX, mouseY);

    //Draw a stroke according to the path
    this.context.stroke(this.pathObject.path);
  };

  private mouseInSelectionCorner(
    x: number,
    y: number,
    x1: number,
    x2: number,
    y1: number,
    y2: number
  ): boolean | string {
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

    const mouseIsIn =
      x >= topLeftX1 && x <= topLeftX2 && y >= topLeftY1 && y <= topLeftY2
        ? "top-left"
        : x >= topRightX1 &&
          x <= topRightX2 &&
          y >= topRightY1 &&
          y <= topRightY2
        ? "top-right"
        : x >= bottomRightX1 &&
          x <= bottomRightX2 &&
          y >= bottomRightY1 &&
          y <= bottomRightY2
        ? "bottom-right"
        : x >= bottomLeftX1 &&
          x <= bottomLeftX2 &&
          y >= bottomLeftY1 &&
          y <= bottomLeftY2
        ? "bottom-left"
        : false;

    return mouseIsIn;
  }

  //Checks if given point is in given shape
  private mouseInSelection(
    mouseX: number,
    mouseY: number,
    x1: number,
    x2: number,
    y1: number,
    y2: number
  ) {
    if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2)
      return true;

    return false;
  }
  //Loop each pathObject and redraw corresponding Path2D
  private redraw(drawingData: DrawingElements[]) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (drawingData.length <= 0) return;

    drawingData.forEach((drawing, i) => {
      if (drawing.type === "stroke") {
        this.context.lineWidth = drawing.lineWidth;
        this.context.strokeStyle = drawing.strokeStyle;
        this.context.globalCompositeOperation = drawing.operation;

        this.context.stroke(drawing.path);

        //Check if there is a selected drawing
        if (this.selectedDrawingIndex === i) {
          const shapeWidth = drawing.x2 - drawing.x1;
          const shapeHeight = drawing.y2 - drawing.y1;

          this.context.strokeStyle = "#7678ed";
          this.context.lineWidth = 1;

          //Stroke main selection rectangle
          this.context.strokeRect(
            drawing.x1,
            drawing.y1,
            shapeWidth,
            shapeHeight
          );

          //Stroke rectangles inside each corner
          //Inner top left corner
          this.context.strokeRect(drawing.x1, drawing.y1, 10, 10);
          //Inner top right corner
          this.context.strokeRect(drawing.x2, drawing.y1, -10, 10);
          //Inner bottom right corner
          this.context.strokeRect(drawing.x2, drawing.y2, -10, -10);
          //Inner bottom left corner
          this.context.strokeRect(drawing.x1, drawing.y2, 10, -10);
        }
      }
      if (drawing.type === "text") {
        this.context.textBaseline = drawing.baseline as CanvasTextBaseline;
        this.context.font = drawing.font;
        this.context.globalCompositeOperation = drawing.operation;

        this.context.fillText(drawing.text, drawing.x1, drawing.y1);

        if (this.selectedDrawingIndex === i) {
          const shapeWidth = drawing.x2 - drawing.x1;
          const shapeHeight = drawing.y2 - drawing.y1;

          this.context.strokeStyle = "#7678ed";
          this.context.lineWidth = 1;

          //Stroke main selection rectangle
          this.context.strokeRect(
            drawing.x1,
            drawing.y1,
            shapeWidth,
            shapeHeight
          );

          //Stroke rectangles inside each corner
          //Inner top left corner
          this.context.strokeRect(drawing.x1, drawing.y1, 10, 10);
          //Inner top right corner
          this.context.strokeRect(drawing.x2, drawing.y1, -10, 10);
          //Inner bottom right corner
          this.context.strokeRect(drawing.x2, drawing.y2, -10, -10);
          //Inner bottom left corner
          this.context.strokeRect(drawing.x1, drawing.y2, 10, -10);
        }
      }
    });
  }

  private assignToProp(
    propName: keyof OptionElementsI,
    element: HTMLElement & HTMLButtonElement & HTMLInputElement
  ) {
    (this as WritableDrawingCanvas)[propName] = element;
  }

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

  private createPersonalElement = (
    tagName: string,
    type?: string,
    styles?: {
      position?: string;
      top?: string;
      left?: string;
      background?: string;
      outline?: string;
      border?: string;
      "font-size"?: string;
      "font-family"?: string;
    }
  ): HTMLElement => {
    const element = document.createElement(tagName);

    if (type) element.setAttribute("type", type);
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

  private incOrDec(
    index: number,
    type: "increment" | "decrement",
    steps: number
  ) {
    if (type === "increment") {
      return (index += steps);
    } else {
      return (index -= steps);
    }
  }

  private handleToggle = (
    activeElements: { element: HTMLElement; stateName: string }[],
    inactiveElements: { element: HTMLElement; stateName: string }[]
  ) => {
    activeElements.forEach((element) => {
      element.element?.classList.add("active");

      this[element.stateName as keyof ToggledStates] = true;
    });
    inactiveElements.forEach((element) => {
      element.element?.classList.remove("active");

      this[element.stateName as keyof ToggledStates] = false;
    });
  };
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
