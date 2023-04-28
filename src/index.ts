enum DrawingElementType {
  controller = "controller",
  pencil = "pencil",
  eraser = "eraser",
  colorPicker = "colorPicker",
  lineWidth = "lineWidth",
  clearCanvas = "clearCanvas",
  moveAndResize = "moveAndResize",
  undo = "undo",
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
  readonly rectangle: HTMLButtonElement | null;
}

type PropKey = keyof OptionElementsI;

//Type that removes readonly so we can assign values inside class
type Writable<T> = { -readonly [K in keyof T]: T[K] };
type WritableDrawingCanvas = Writable<DrawingCanvas>;

class DrawingCanvas implements OptionElementsI {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  //Elements for controlling canvas props
  readonly controller: HTMLElement | null = document.getElementById(
    "toolbar"
  ) as HTMLElement;
  readonly pencil: HTMLButtonElement | null = document.getElementById(
    "pencil"
  ) as HTMLButtonElement;
  readonly eraser: HTMLButtonElement | null = document.getElementById(
    "eraser"
  ) as HTMLButtonElement;
  readonly colorPicker: HTMLInputElement | null = document.getElementById(
    "color"
  ) as HTMLInputElement;
  readonly lineWidthPicker: HTMLInputElement | null = document.getElementById(
    "lineWidth"
  ) as HTMLInputElement;
  readonly clearCanvas: HTMLButtonElement | null = document.getElementById(
    "clear"
  ) as HTMLButtonElement;
  readonly moveAndResize: HTMLButtonElement | null = document.getElementById(
    "mv-rz"
  ) as HTMLButtonElement;
  readonly undo: HTMLButtonElement | null = document.getElementById(
    "undo"
  ) as HTMLButtonElement;
  readonly rectangle: HTMLButtonElement | null = document.getElementById(
    "rectangle"
  ) as HTMLButtonElement;

  //For state tracking
  private isDrawing: boolean;
  private isErasing: boolean;
  private isMovingAndResizing: boolean;

  private shouldDraw: boolean;
  private shouldErase: boolean;
  private shouldMoveAndResize: boolean;

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
      //IF any elements are passed
      //THEN loop through each element and reassign element props
      // options.elements.forEach((element) => this.storeElements(element));
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

  //Since element props are read only we have to have method
  private setElement(
    propName: PropKey,
    element: HTMLElement & HTMLButtonElement & HTMLInputElement
  ) {
    (this as WritableDrawingCanvas)[propName] = element;
  }

  //Runs for each element passed to options
  private storeElements = (currentElement: CanvasElement) => {
    //Loop through class props
    Object.keys(this).map((currentProp) => {
      //IF elements type is same as prop
      if (currentElement.type === currentProp) {
        //THEN store THAT prop to be used as a index accessor when assigning value to this.(prop)
        const propName = currentProp as PropKey;

        //Check if current has a classname and query corresponding element
        if (currentElement.className) {
          const element = document.querySelector(
            "." + currentElement.className
          ) as HTMLElement & HTMLButtonElement & HTMLInputElement;

          //Same as saying this.element = element
          this.setElement(propName, element);
        }
        if (currentElement.id) {
          const element = document.getElementById(
            currentElement.id
          ) as HTMLElement & HTMLButtonElement & HTMLInputElement;

          this.setElement(propName, element);
        }
      }
    });
  };

  //Controller Change handler
  private changeHandler = (e: Event) => {
    const colorPicker = this.colorPicker;
    const lineWidthPicker = this.lineWidthPicker;

    const target = e.target as HTMLInputElement;
    const context = this.context;

    //IF any element can be found
    if (colorPicker) {
      if (
        (target.id && target.id === colorPicker.id) ||
        (target.className && target.className === colorPicker.className)
      ) {
        context.strokeStyle = target.value;
      }
    }

    if (lineWidthPicker) {
      if (
        (target.id && target.id === lineWidthPicker.id) ||
        (target.className && target.className === lineWidthPicker.className)
      ) {
        context.lineWidth = Number(target.value);
      }
    }
  };

  //Controller click handler
  private clickHandler = (e: MouseEvent) => {
    const pen = this.pencil;
    const eraser = this.eraser;
    const clearCanvas = this.clearCanvas;
    const moveAndResize = this.moveAndResize;
    const undo = this.undo;
    const rectangle = this.rectangle;

    const context = this.context;

    //We know that controller expects buttons for click functions
    const target = e.target as HTMLButtonElement;

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
        } else {
          //Remove last data and re render
          this.index -= 1;
          this.drawingData.pop();
          context.putImageData(this.drawingData[this.index], 0, 0);
        }
      });
    }

    if (pen) {
      this.compareTargetToElement(target, pen, () => {
        eraser?.classList.remove("active");
        moveAndResize?.classList.remove("active");
        rectangle?.classList.remove("active");

        this.shouldErase = false;
        this.shouldMoveAndResize = false;

        this.shouldDraw = true;

        //Add classList to indicate active tool
        pen?.classList.add("active");
      });
    }

    if (eraser) {
      this.compareTargetToElement(target, eraser, () => {
        pen?.classList.remove("active");
        moveAndResize?.classList.remove("active");
        rectangle?.classList.remove("active");

        this.shouldDraw = false;
        this.shouldMoveAndResize = false;

        this.shouldErase = true;

        eraser?.classList.add("active");
      });
    }

    if (moveAndResize) {
      this.compareTargetToElement(target, moveAndResize, () => {
        pen?.classList.remove("active");
        eraser?.classList.remove("active");
        rectangle?.classList.remove("active");

        this.shouldErase = false;
        this.shouldDraw = false;

        this.shouldMoveAndResize = true;

        moveAndResize?.classList.add("active");
      });
    }

    if (rectangle) {
      this.compareTargetToElement(target, rectangle, () => {
        pen?.classList.remove("active");
        eraser?.classList.remove("active");
        moveAndResize?.classList.remove("active");

        this.shouldErase = false;
        this.shouldDraw = false;
        this.shouldMoveAndResize = true;

        rectangle?.classList.add("active");
      });
    }
  };

  //Listen for events on given canvas
  private listen() {
    const canvas = this.canvas;

    const controller = this.controller;

    canvas.addEventListener("mousedown", this.start);
    canvas.addEventListener("mouseup", this.stop);
    canvas.addEventListener("mousemove", this.draw);

    canvas.addEventListener("touchstart", this.start);
    canvas.addEventListener("touchend", this.stop);
    canvas.addEventListener("touchmove", this.draw);

    controller?.addEventListener("change", this.changeHandler);
    controller?.addEventListener("click", this.clickHandler);
  }

  //Runs whenever mouse is clicked
  private start = (e: MouseEvent | TouchEvent) => {
    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    const mouseY = evtType.clientY - this.canvas.offsetTop;
    const mouseX = evtType.clientX - this.canvas.offsetLeft;

    //If eraser has been selected
    if (this.shouldErase) {
      this.context.globalCompositeOperation = "destination-out";

      this.isErasing = true;

      this.isDrawing = false;
      this.isMovingAndResizing = false;
    } else if (this.shouldDraw) {
      this.context.globalCompositeOperation = "source-over";

      this.isDrawing = true;

      this.isErasing = false;
      this.isMovingAndResizing = false;
    } else {
      this.isMovingAndResizing = true;

      this.isDrawing = false;
      this.isErasing = false;
    }
    //Begin new path
    this.context.beginPath();
  };

  //Runs whenever mouse is released
  private stop = () => {
    this.isDrawing = false;
    this.isErasing = false;
    this.isMovingAndResizing = false;

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
  private draw = (e: MouseEvent | TouchEvent) => {
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
    if (!this.isDrawing && !this.isErasing && !this.isMovingAndResizing) return;

    this.context.lineCap = "round";
    this.context.lineTo(
      evtType.clientX - this.canvas.offsetLeft,
      evtType.clientY - this.canvas.offsetTop
    );
    //Save stroke
    this.context.stroke();
  };

  private compareTargetToElement(
    target: HTMLButtonElement,
    element: HTMLButtonElement,
    callBack: () => void
  ) {
    if (
      (target.id && target.id === element.id) ||
      (target.className && target.className === element.className)
    ) {
      callBack();
    }
  }
}
interface CanvasElement {
  type: DrawingElementType;
  className?: string;
  id?: string;
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
