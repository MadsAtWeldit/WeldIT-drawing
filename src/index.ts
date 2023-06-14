//Values for different types of elements
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
  lineTool = "lineTool",
  rectangle = "rectangle",
}

//Props for storing elements passed to options
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
  readonly lineTool: HTMLButtonElement | null;
  readonly rectangle: HTMLButtonElement | null;
}

//Structure of passing in elements to options
interface CanvasElement {
  type: DrawingElementType;
  className?: string;
  id?: string;
}

interface ToggledStates {
  toggleDraw: boolean;
  toggleErase: boolean;
  toggleMvRz: boolean;
  toggleWrite: boolean;
  toggleLine: boolean;
}

interface PathElement {
  type: "stroke";
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  resizedX1: number;
  resizedY1: number;
  resizedX2: number;
  resizedY2: number;
  xCords: number[];
  yCords: number[];
  resizedXCords: number[];
  resizedYCords: number[];
}

interface TextElement {
  type: "text";
  text: string;
  font: string;
  resizedFont: string;
  baseline: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  resizedX1: number;
  resizedY1: number;
  resizedX2: number;
  resizedY2: number;

  operation: "source-over" | "destination-out";
}

interface LineElement {
  type: "line";
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
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
  readonly lineTool = document.getElementById("lineTool") as HTMLButtonElement;
  readonly rectangle = document.getElementById(
    "rectangle"
  ) as HTMLButtonElement;

  //For state tracking
  private isDrawing = false;
  private isErasing = false;
  private isMoving = false;
  private isResizing = false;
  private isWriting = false;
  private isLining = false;

  private shouldDraw = false;
  private shouldErase = false;
  private shouldMove = false;
  private shouldResize = {
    toggled: false,
    from: "",
  };
  private shouldLine = false;

  //Toggled states
  private toggleDraw = false;
  private toggleErase = false;
  private toggleMvRz = false;
  private toggleWrite = false;
  private toggleLine = false;

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
  private textObject: TextElement = {
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
  private lineObject: LineElement = {
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
    this.toggleDraw = true;

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
      } else {
        this.index -= 1;
        this.drawingData.pop();

        this.redraw(this.drawingData);
      }
    }

    if (pen && this.targetIs(pen, target)) {
      this.canvas.style.cursor = "crosshair";
      this.handleToggle(
        [{ element: pen, stateName: "toggleDraw" }],
        [
          { element: eraser, stateName: "toggleErase" },
          { element: moveAndResize, stateName: "toggleMvRz" },
          { element: text, stateName: "toggleWrite" },
          { element: lineTool, stateName: "toggleLine" },
        ]
      );
    }

    if (eraser && this.targetIs(eraser, target)) {
      this.canvas.style.cursor = "crosshair";
      this.handleToggle(
        [{ element: eraser, stateName: "toggleErase" }],
        [
          { element: pen, stateName: "toggleDraw" },
          { element: moveAndResize, stateName: "toggleMvRz" },
          { element: text, stateName: "toggleWrite" },
          { element: lineTool, stateName: "toggleLine" },
        ]
      );
    }

    if (moveAndResize && this.targetIs(moveAndResize, target)) {
      this.canvas.style.cursor = "default";
      this.handleToggle(
        [{ element: moveAndResize, stateName: "toggleMvRz" }],
        [
          { element: pen, stateName: "toggleDraw" },
          { element: eraser, stateName: "toggleErase" },
          { element: text, stateName: "toggleWrite" },
          { element: lineTool, stateName: "toggleLine" },
        ]
      );
    }

    if (text && this.targetIs(text, target)) {
      this.canvas.style.cursor = "text";
      this.handleToggle(
        [{ element: text, stateName: "toggleWrite" }],
        [
          { element: pen, stateName: "toggleDraw" },
          { element: eraser, stateName: "toggleErase" },
          { element: moveAndResize, stateName: "toggleMvRz" },
          { element: lineTool, stateName: "toggleLine" },
        ]
      );
    }

    if (lineTool && this.targetIs(lineTool, target)) {
      this.canvas.style.cursor = "crosshair";
      this.handleToggle(
        [{ element: lineTool, stateName: "toggleLine" }],
        [
          { element: pen, stateName: "toggleDraw" },
          { element: eraser, stateName: "toggleErase" },
          { element: text, stateName: "toggleWrite" },
          { element: moveAndResize, stateName: "toggleMvRz" },
        ]
      );
    }
  };

  //Runs whenever mouse is clicked
  private pressDownHandler = (e: MouseEvent | TouchEvent) => {
    this.mouseIsDown = true;

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
      if (this.drawingData.length <= 0) return;

      //Loop through each drawing
      this.drawingData.forEach((drawing, i) => {
        if (drawing.type === "stroke") {
          //IF selected drawing index when we click on canvas
          if (this.selectedDrawingIndex !== null) {
            //Get selected drawing
            const selected = this.drawingData[this.selectedDrawingIndex];

            //Check if mouse is on selected drawing corners
            if (this.mouseInCorner(mouseX, mouseY, selected)) {
              //IF it is then get value of corner
              const corner = this.mouseInCorner(mouseX, mouseY, selected);
              //And store
              this.shouldResize.toggled = true;
              this.shouldResize.from = corner as string;

              //Return because it is still within the selection
              return;
            }

            //IF in selection of the selected
            if (this.mouseInSelection(mouseX, mouseY, selected)) {
              this.shouldMove = true;

              return;
            }

            //IF NOT in corner or selection THEN check if its in another drawing path
            this.context.isPointInStroke(drawing.path, mouseX, mouseY)
              ? (this.selectedDrawingIndex = i)
              : (this.selectedDrawingIndex = null);

            //IF no selected drawing when we click
          } else {
            if (this.context.isPointInStroke(drawing.path, mouseX, mouseY)) {
              this.selectedDrawingIndex = i;
              this.shouldMove = true;
            }
          }

          this.redraw(this.drawingData);
        }

        if (drawing.type === "text") {
          if (this.selectedDrawingIndex !== null) {
            //Get selected drawing
            const selected = this.drawingData[this.selectedDrawingIndex];
            //IF in corner of selected drawing
            if (this.mouseInCorner(mouseX, mouseY, selected)) {
              const corner = this.mouseInCorner(mouseX, mouseY, selected);

              this.shouldResize.toggled = true;
              this.shouldResize.from = corner as string;

              return;
            }
            //IF in selection of selected
            if (this.mouseInSelection(mouseX, mouseY, selected)) {
              this.shouldMove = true;
              return;
            }

            //IF not in corner or selection
            //Check if its in another unselected drawing
            this.mouseInSelection(mouseX, mouseY, drawing)
              ? (this.selectedDrawingIndex = i)
              : (this.selectedDrawingIndex = null);

            //IF no selected drawing then simply select
          } else {
            if (this.mouseInSelection(mouseX, mouseY, drawing)) {
              this.selectedDrawingIndex = i;
              this.shouldMove = true;
            }
          }
          this.redraw(this.drawingData);
        }
      });
    }

    if (this.toggleWrite) {
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

      //Focus input
      window.setTimeout(() => textInput.focus(), 0);

      //Runs whenever we unfocus input
      textInput.addEventListener("blur", () => {
        this.redraw(this.drawingData);

        //Assign value of text
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

      textInput.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          textInput.blur();
        }
      });

      canvasContainer?.appendChild(textInput);
    }

    if (this.toggleLine) {
      if (this.isLining) {
        //Will run at end of line
        this.lineObject.endX = mouseX;
        this.lineObject.endY = mouseY;

        this.lineObject.path.lineTo(this.lineObject.endX, this.lineObject.endY);

        return;
      }
      //Will run at start of line
      this.lineObject.operation = "source-over";
      this.shouldLine = true;

      this.lineObject.path.moveTo(mouseX, mouseY);

      this.lineObject.startX = mouseX;
      this.lineObject.startY = mouseY;
    }

    //Begin new path
    //this.context.beginPath();
  };

  //Runs whenever mouse is released
  private mouseUpHandler = () => {
    //No longer moving or dragging
    this.mouseIsDown = false;
    this.isDragging = false;

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

      //Save object
      this.index = this.incOrDec(this.index, "increment", 1);
      this.drawingData.push(this.pathObject);

      //Set new path
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

    if (this.shouldMove) {
      this.shouldMove = false;
      this.isMoving = false;
    }
    //IF we are drawing line when we mouseUp
    if (this.isLining) {
      this.shouldLine = false;
      this.isLining = false;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.stroke(this.lineObject.path);

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
      };
      return;
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

    if (this.toggleMvRz) {
      this.canvas.style.cursor = "default";

      this.drawingData.forEach((drawing, i) => {
        if (drawing.type === "stroke") {
          if (
            this.context.isPointInStroke(drawing.path, mouseX, mouseY) ||
            this.selectedDrawingIndex === i
          ) {
            if (this.mouseInSelection(mouseX, mouseY, drawing))
              this.canvas.style.cursor = "move";

            if (this.mouseInCorner(mouseX, mouseY, drawing)) {
              const corner = this.mouseInCorner(mouseX, mouseY, drawing);
              corner === "tl" || corner === "br"
                ? (this.canvas.style.cursor = "nwse-resize")
                : (this.canvas.style.cursor = "nesw-resize");
            }
          }
        }

        if (drawing.type === "text") {
          if (this.mouseInSelection(mouseX, mouseY, drawing))
            this.canvas.style.cursor = "move";

          if (this.mouseInCorner(mouseX, mouseY, drawing)) {
            const corner = this.mouseInCorner(mouseX, mouseY, drawing);
            corner === "tl" || corner === "br"
              ? (this.canvas.style.cursor = "nwse-resize")
              : (this.canvas.style.cursor = "nesw-resize");
          }
        }
      });
    }

    //IF mousedown and selected drawing
    if (this.mouseIsDown && this.selectedDrawingIndex !== null) {
      this.isDragging = true;

      const dx = mouseX - this.startX;
      const dy = mouseY - this.startY;

      //Selected drawing
      const selectedDrawing = this.drawingData[this.selectedDrawingIndex];

      if (selectedDrawing.type === "stroke") {
        if (this.shouldMove) {
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
        } else {
          const { from } = this.shouldResize;

          this.isResizing = true;
          this.resizePath(selectedDrawing, from, mouseX, mouseY);
        }
      }

      if (selectedDrawing.type === "text") {
        if (this.shouldMove) {
          //Assign new coordinates
          selectedDrawing.x1 += dx;
          selectedDrawing.y1 += dy;

          selectedDrawing.x2 += dx;
          selectedDrawing.y2 += dy;

          this.startX = mouseX;
          this.startY = mouseY;
        } else {
          const { from } = this.shouldResize;
          this.isResizing = true;
          this.resizeText(selectedDrawing, from, mouseX, mouseY);
        }
      }

      this.redraw(this.drawingData);
    }

    if (
      (this.mouseIsDown && this.shouldDraw) ||
      (this.mouseIsDown && this.shouldErase)
    ) {
      this.shouldDraw ? (this.isDrawing = true) : (this.isDrawing = false);
      this.shouldErase ? (this.isErasing = true) : (this.isErasing = false);
      this.redraw(this.drawingData);

      //Set props for current path object
      this.context.lineCap = "round";
      this.setCtxStyles(this.pathObject);

      this.addCoords(mouseX, mouseY, true);

      this.pathObject.path.lineTo(mouseX, mouseY);
      this.context.stroke(this.pathObject.path);
    }

    if (this.shouldLine) {
      this.isLining = true;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Set ctx styles
      this.context.globalCompositeOperation = this.lineObject.operation;
      this.context.lineWidth = this.lineObject.lineWidth;
      this.context.strokeStyle = this.lineObject.strokeStyle;

      this.context.beginPath();

      this.context.moveTo(this.lineObject.startX, this.lineObject.startY);
      this.context.lineTo(mouseX, mouseY);

      this.context.closePath();

      this.context.stroke();
    }
    e.preventDefault();
  };

  //Updates drawing to resized
  private updateToResized(drawing: DrawingElements) {
    if (drawing.type === "stroke") {
      drawing.xCords = drawing.resizedXCords;
      drawing.yCords = drawing.resizedYCords;

      drawing.path = drawing.resizedPath as Path2D;
      drawing.x1 = Math.min(...drawing.xCords);
      drawing.y1 = Math.min(...drawing.yCords);
      drawing.x2 = Math.max(...drawing.xCords);
      drawing.y2 = Math.max(...drawing.yCords);
    } else {
      drawing.font = drawing.resizedFont;

      drawing.x1 = drawing.resizedX1;
      drawing.y1 = drawing.resizedY1;
      drawing.x2 = drawing.resizedX2;
      drawing.y2 = drawing.resizedY2;
    }
  }

  //Adds each coordinate to array
  private addCoords(x: number, y: number, dragging: boolean) {
    this.pathObject.xCords.push(x);
    this.pathObject.yCords.push(y);
    this.isDragging = dragging;
  }

  //Helper function that takes care of returning values for scaling correctly
  private scaleCorrectly(
    from: string,
    element: DrawingElements,
    currentMouseX: number,
    currentMouseY: number
  ) {
    //IF scaling from the left side then start = left : start = right;
    const startCornerX =
      from === "tl" || from === "bl" ? element.x1 : element.x2;
    const startCornerY =
      from === "tl" || from === "tr" ? element.y1 : element.y2;

    //IF scaling from left side then origin is opposite side so that we scale inwards or outwards based on corner
    const scaleOriginX =
      from === "tl" || from === "bl" ? element.x2 : element.x1;
    const scaleOriginY =
      from === "tl" || from === "tr" ? element.y2 : element.y1;

    //For the scaling to work properly i also need where we scale from
    //Since scaling from left side to right side would not work with e.g (x1 - x2 so instead x2 - x1 for distance)
    const originalDistance =
      from === "tl" || from === "bl"
        ? scaleOriginX - startCornerX
        : startCornerX -
          scaleOriginX +
          (from === "tl" || from === "tr"
            ? scaleOriginY - startCornerY
            : startCornerY - scaleOriginY);

    const currentDistance =
      from === "tl" || from === "bl"
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
  private resizeText(
    element: TextElement,
    from: string,
    currentMouseX: number,
    currentMouseY: number
  ): void {
    const {
      scaleOriginXPos,
      scaleOriginYPos,
      startCornerXPos,
      startCornerYPos,
      scale,
    } = this.scaleCorrectly(from, element, currentMouseX, currentMouseY);

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
    const newFont = fontStringCopy.replace(
      fontSize.toString(),
      resizedFontSize.toString()
    );

    //Assign new left, right, top and bottom based on which side we scaled from
    from === "tl" || from === "bl"
      ? ((element.resizedX1 = scaleOriginX - newDistanceX),
        (element.resizedX2 = scaleOriginX))
      : ((element.resizedX2 = scaleOriginX - newDistanceX),
        (element.resizedX1 = scaleOriginX));
    from === "tl" || from === "tr"
      ? ((element.resizedY1 = scaleOriginY - newDistanceY),
        (element.resizedY2 = scaleOriginY))
      : ((element.resizedY2 = scaleOriginY - newDistanceY),
        (element.resizedY1 = scaleOriginY));

    //Store the new font size
    element.resizedFont = newFont;
  }

  //Resize drawing with provided scale factor and scale origin
  private resizePath(
    element: DrawingElements,
    from: string,
    currentMouseX: number,
    currentMouseY: number
  ) {
    const { scaleOriginXPos, scaleOriginYPos, scale } = this.scaleCorrectly(
      from,
      element,
      currentMouseX,
      currentMouseY
    );

    const scaleOriginX = scaleOriginXPos;
    const scaleOriginY = scaleOriginYPos;

    const scaleFactor = scale;

    if (element.type === "stroke") {
      const resizedPath = new Path2D();

      //Create copy of element coordinates
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

      //Assign resized path to element
      element.resizedX1 = Math.min(...resizedXCords);
      element.resizedY1 = Math.min(...resizedYCords);
      element.resizedX2 = Math.max(...resizedXCords);
      element.resizedY2 = Math.max(...resizedYCords);

      element.resizedXCords = resizedXCords;
      element.resizedYCords = resizedYCords;

      element.resizedPath = resizedPath;
    }
  }

  private mouseInCorner(
    x: number,
    y: number,
    drawing: DrawingElements
  ): boolean | string {
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

    const mouseIsIn =
      x >= topLeftX1 && x <= topLeftX2 && y >= topLeftY1 && y <= topLeftY2
        ? "tl"
        : x >= topRightX1 &&
          x <= topRightX2 &&
          y >= topRightY1 &&
          y <= topRightY2
        ? "tr"
        : x >= bottomRightX1 &&
          x <= bottomRightX2 &&
          y >= bottomRightY1 &&
          y <= bottomRightY2
        ? "br"
        : x >= bottomLeftX1 &&
          x <= bottomLeftX2 &&
          y >= bottomLeftY1 &&
          y <= bottomLeftY2
        ? "bl"
        : false;

    return mouseIsIn;
  }

  //Draw a selection rectangle for given coords
  private createDrawingSelection(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    px?: number
  ) {
    const width = x2 - x1;
    const height = y2 - y1;
    const size = px ? px : 10;

    this.context.globalCompositeOperation = "source-over";
    this.context.strokeStyle = "#7678ed";
    this.context.lineWidth = 1;

    this.context.strokeRect(x1, y1, width, height);

    this.context.strokeRect(x1, y1, size, size);
    this.context.strokeRect(x2, y1, -size, size);
    this.context.strokeRect(x2, y2, -size, -size);
    this.context.strokeRect(x1, y2, size, -size);
  }

  //Checks if given point is in given drawing selection
  private mouseInSelection(
    mouseX: number,
    mouseY: number,
    drawing: DrawingElements
  ) {
    const { x1, y1, x2, y2 } = drawing;
    if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2)
      return true;

    return false;
  }

  //Sets context styles based on drawing styles
  private setCtxStyles(drawing: DrawingElements) {
    this.context.globalCompositeOperation = drawing.operation;

    if (drawing.type === "stroke") {
      this.context.lineWidth = drawing.lineWidth;
      this.context.strokeStyle = drawing.strokeStyle;
    } else {
      this.context.textBaseline = drawing.baseline as CanvasTextBaseline;
      this.context.font = drawing.font;
    }
  }

  //Loop and redraw each drawing as drawn
  private redraw(drawingData: DrawingElements[]) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (drawingData.length <= 0) return;

    drawingData.forEach((drawing, i) => {
      if (drawing.type === "stroke") {
        if (this.selectedDrawingIndex === i) {
          if (this.isResizing) {
            this.setCtxStyles(drawing);

            this.context.stroke(drawing.resizedPath as Path2D);

            this.createDrawingSelection(
              drawing.resizedX1,
              drawing.resizedY1,
              drawing.resizedX2,
              drawing.resizedY2
            );

            return;
          }

          this.createDrawingSelection(
            drawing.x1,
            drawing.y1,
            drawing.x2,
            drawing.y2
          );
        }

        this.setCtxStyles(drawing);

        this.context.stroke(drawing.path);
      }

      if (drawing.type === "text") {
        if (this.selectedDrawingIndex === i) {
          if (this.isResizing) {
            this.setCtxStyles(drawing);

            this.context.font = drawing.resizedFont;
            this.context.fillText(
              drawing.text,
              drawing.resizedX1,
              drawing.resizedY1
            );
            this.createDrawingSelection(
              drawing.resizedX1,
              drawing.resizedY1,
              drawing.resizedX2,
              drawing.resizedY2
            );
            return;
          }
          this.createDrawingSelection(
            drawing.x1,
            drawing.y1,
            drawing.x2,
            drawing.y2
          );
        }
        this.setCtxStyles(drawing);

        this.context.fillText(drawing.text, drawing.x1, drawing.y1);
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
