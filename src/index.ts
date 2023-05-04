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
  private isDrawing: boolean;
  private isErasing: boolean;
  private isMovingAndResizing: boolean;
  private isWriting: boolean;

  private shouldDraw: boolean;
  private shouldErase: boolean;
  private shouldMoveAndResize: boolean;
  private shouldWrite: boolean;

  //States for tracking drawing data
  private index = -1;
  private drawingData: ImageData[] = [];

  //Props
  private lineWidth: number;
  private strokeStyle: string;

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
    this.context.lineWidth = 5;
    this.context.strokeStyle = "black";
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
      context.strokeStyle = target.value;
    }

    if (lineWidthPicker && this.targetIs(lineWidthPicker, target)) {
      context.lineWidth = Number(target.value);
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
      this.drawingData = [];
    }

    if (undo && this.targetIs(undo, target)) {
      //IF index is at 0 when we undo
      if (this.index <= 0) {
        //Then make canvas clean
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.index = -1;
        this.drawingData = [];
      } else {
        //Remove last data
        this.index -= 1;
        this.drawingData.pop();

        //RE render
        context.putImageData(this.drawingData[this.index], 0, 0);
      }
    }

    if (pen && this.targetIs(pen, target)) {
      eraser?.classList.remove("active");
      moveAndResize?.classList.remove("active");
      text?.classList.remove("active");

      this.shouldErase = false;
      this.shouldMoveAndResize = false;
      this.shouldWrite = false;

      this.shouldDraw = true;

      pen?.classList.add("active");
    }

    if (eraser && this.targetIs(eraser, target)) {
      pen?.classList.remove("active");
      moveAndResize?.classList.remove("active");
      text?.classList.remove("active");

      this.shouldDraw = false;
      this.shouldMoveAndResize = false;
      this.shouldWrite = false;

      this.shouldErase = true;

      eraser?.classList.add("active");
    }

    if (moveAndResize && this.targetIs(moveAndResize, target)) {
      pen?.classList.remove("active");
      eraser?.classList.remove("active");
      text?.classList.remove("active");

      this.shouldErase = false;
      this.shouldDraw = false;
      this.shouldWrite = false;

      this.shouldMoveAndResize = true;

      moveAndResize?.classList.add("active");
    }

    if (text && this.targetIs(text, target)) {
      pen?.classList.remove("active");
      eraser?.classList.remove("active");
      moveAndResize?.classList.remove("active");

      this.shouldDraw = false;
      this.shouldErase = false;
      this.shouldMoveAndResize = false;

      this.shouldWrite = true;

      text?.classList.add("active");
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

    //IF element has been selected when we click on canvas
    if (this.shouldErase) {
      this.context.globalCompositeOperation = "destination-out";

      this.isErasing = true;

      this.isDrawing = false;
      this.isMovingAndResizing = false;
      this.isWriting = false;
    } else if (this.shouldDraw) {
      this.context.globalCompositeOperation = "source-over";

      this.isDrawing = true;

      this.isErasing = false;
      this.isMovingAndResizing = false;
      this.isWriting = false;
    } else if (this.shouldMoveAndResize) {
      this.isMovingAndResizing = true;
      if (this.context.isPointInPath(mouseX, mouseY)) {
        console.log("yes");
      } else {
        console.log("no");
      }

      this.isDrawing = false;
      this.isErasing = false;
      this.isWriting = false;
    } else if (this.shouldWrite) {
      //Set focus on textInput
      window.setTimeout(() => textInput.focus(), 0);

      const canvasContainer = <HTMLElement>(
        document.querySelector(".drawing-board")
      );

      const textInput = document.createElement("input");
      //Give proper styles and attr
      textInput.setAttribute("type", "text");
      textInput.style.position = "fixed";
      textInput.style.top = `${evtType.clientY}px`;
      textInput.style.left = `${evtType.clientX}px`;
      textInput.id = "textInput";
      //Runs whenever we save text
      textInput.addEventListener("blur", () => {
        this.context.textBaseline = "top";
        this.context.font = "30px sans-serif";

        this.context.fillText(textInput.value, mouseX, mouseY);

        canvasContainer.removeChild(textInput);
        this.isWriting = false;
      });

      canvasContainer?.appendChild(textInput);

      this.isWriting = true;

      this.isDrawing = false;
      this.isErasing = false;
      this.isMovingAndResizing = false;
    }

    //Begin new path
    this.context.beginPath();
  };

  //Runs whenever mouse is released
  private mouseUpHandler = () => {
    if (this.isWriting) return;
    console.log("not writing");
    this.isDrawing = false;
    this.isErasing = false;
    this.isMovingAndResizing = false;
    this.isWriting = false;
    //Get index and data from current stroke and save
    this.index++;
    this.drawingData.push(
      this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    );

    //Save stroke
    this.context.stroke();
    this.context.closePath();
  };

  //Runs whenever mouse moves
  private mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
    if (!this.isDrawing && !this.isErasing) return;
    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    const mouseX = evtType.clientX - this.canvas.offsetLeft;
    const mouseY = evtType.clientY - this.canvas.offsetTop;

    // if (this.context.isPointInPath(mouseX, mouseY)) {
    //   console.log("yes");
    // } else {
    //   console.log("no");
    // }
    //IF we are not drawing or erasing

    this.context.lineCap = "round";
    this.context.lineTo(
      evtType.clientX - this.canvas.offsetLeft,
      evtType.clientY - this.canvas.offsetTop
    );
    //Save stroke
    this.context.stroke();
  };

  //Since element props are read only we have to have method
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
