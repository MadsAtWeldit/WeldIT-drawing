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
  shouldMoveAndResize: boolean;
  shouldWrite: boolean;
}

//Interface for path object
interface PathElement {
  path: Path2D;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
}

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
  private shouldMoveAndResize = false;
  private shouldWrite = false;

  //States for tracking drawing data
  private index = -1;
  private selectedPathIndex: number | null = null;

  //Create default path object
  private pathObject: PathElement = {
    path: new Path2D(),
    lineWidth: 5,
    strokeStyle: "black",
    operation: "source-over",
  };

  private pathData: PathElement[] = [];
  //Props
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

      this.pathData = [];
    }

    if (undo && this.targetIs(undo, target)) {
      //IF index is at 0 when we undo
      if (this.index <= 0) {
        //Then make canvas clean
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.index = -1;
        this.pathData = [];
      } else {
        //Remove last data
        this.index -= 1;
        this.pathData.pop();

        //Clear and redraw paths
        this.redraw(this.pathData);
      }
    }

    if (pen && this.targetIs(pen, target)) {
      this.handleToggle(
        [{ element: pen, stateName: "shouldDraw" }],
        [
          { element: eraser, stateName: "shouldErase" },
          { element: moveAndResize, stateName: "shouldMoveAndResize" },
          { element: text, stateName: "shouldWrite" },
        ]
      );
    }

    if (eraser && this.targetIs(eraser, target)) {
      this.handleToggle(
        [{ element: eraser, stateName: "shouldErase" }],
        [
          { element: pen, stateName: "shouldDraw" },
          { element: moveAndResize, stateName: "shouldMoveAndResize" },
          { element: text, stateName: "shouldWrite" },
        ]
      );
    }

    if (moveAndResize && this.targetIs(moveAndResize, target)) {
      this.handleToggle(
        [{ element: moveAndResize, stateName: "shouldMoveAndResize" }],
        [
          { element: pen, stateName: "shouldDraw" },
          { element: eraser, stateName: "shouldErase" },
          { element: text, stateName: "shouldWrite" },
        ]
      );
    }

    if (text && this.targetIs(text, target)) {
      this.handleToggle(
        [{ element: text, stateName: "shouldWrite" }],
        [
          { element: pen, stateName: "shouldDraw" },
          { element: eraser, stateName: "shouldErase" },
          { element: moveAndResize, stateName: "shouldMoveAndResize" },
        ]
      );
    }
  };

  //Runs whenever mouse is clicked
  private pressDownHandler = (e: MouseEvent | TouchEvent) => {
    if (!this.isErasing) this.context.globalCompositeOperation = "source-over";

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

    //Start path at click position
    this.pathObject.path?.moveTo(mouseX, mouseY);

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
      if (this.pathData.length <= 0) return;

      this.pathData.forEach((path, i) => {
        if (this.context.isPointInPath(path.path, mouseX, mouseY)) {
          this.selectedPathIndex = i;
        } else {
          return;
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
          "font-size": "30px",
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

      //Runs whenever we save text
      textInput.addEventListener("blur", () => {
        this.context.textBaseline = "top";
        this.context.font = "30px sans-serif";

        this.context.fillText(textInput.value, mouseX, mouseY);

        canvasContainer.removeChild(textInput);
        this.isWriting = false;
      });

      textInput.addEventListener("keypress", (e: KeyboardEvent) => {
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

      canvasContainer?.appendChild(textInput);
    }

    //Begin new path
    // this.context.beginPath();
  };

  //Runs whenever mouse is released
  private mouseUpHandler = () => {
    if (this.isWriting) return;

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

  private mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    //Current mouse positions
    const mouseX = evtType.clientX - this.canvas.offsetLeft;
    const mouseY = evtType.clientY - this.canvas.offsetTop;

    if (this.isMovingAndResizing) {
      //IF there is no selected element
      if (this.selectedPathIndex === null) return;

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

    if (!this.isDrawing && !this.isErasing) return;
    this.redraw(this.pathData);

    //Before stroking set lineWidth and color
    this.context.lineCap = "round";
    this.context.lineWidth = this.pathObject.lineWidth;
    this.context.strokeStyle = this.pathObject.strokeStyle;
    this.context.globalCompositeOperation = this.pathObject.operation;

    //Use the Path2D iface to make line for object
    this.pathObject.path?.lineTo(mouseX, mouseY);

    //Draw a stroke according to the path
    this.context.stroke(this.pathObject.path as Path2D);
  };

  //Loop each pathObject and redraw corresponding Path2D
  private redraw(pathData: PathElement[]) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (pathData.length <= 0) return;

    pathData.forEach((path) => {
      this.context.lineWidth = path.lineWidth;
      this.context.strokeStyle = path.strokeStyle;
      this.context.globalCompositeOperation = path.operation;

      this.context.stroke(path.path as Path2D);
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
