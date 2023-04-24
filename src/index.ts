// const canvas = <HTMLCanvasElement>document.getElementById("drawing-board");
const toolBar = <HTMLElement>document.getElementById("toolbar");

//Get context of canvas
// const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// //Offset of canvas
// enum Offset {
//   X = canvas.offsetLeft,
//   Y = canvas.offsetTop,
// }

// //Set canvas width and height
// canvas.width = window.innerWidth - Offset.X;
// canvas.height = window.innerHeight - Offset.Y;

// let isDrawing: boolean;
// let lineWidth = 5;

// let startX: number;
// let startY: number;

// //Function runs whenever the mouse moves
// const draw = (e: MouseEvent) => {
//   if (!isDrawing) return;

//   console.log("drawing");

//   //Set linewidth and cap
//   ctx.lineWidth = lineWidth;

//   ctx.lineCap = "round";
//   //Create line based on client mouse position
//   ctx.lineTo(e.clientX - Offset.X, e.clientY);
//   //Set stroke
//   ctx.stroke();
// };

// //Listen for changes
// toolBar.addEventListener("change", (e) => {
//   //We know that target will be Input element so we type cast
//   const target = e.target as HTMLInputElement;

//   //IF Stroke
//   if (target.id === "stroke") {
//     //Set strokestyle
//     ctx.strokeStyle = target.value;
//   }

//   //IF Linewidth
//   if (target.id === "lineWidth") {
//     //Set linewidth
//     lineWidth = Number(target.value);
//   }
// });

// toolBar.addEventListener("click", (e) => {
//   const target = e.target as HTMLButtonElement;
//   if (target.id === "clear") {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//   }
// });

// //When mouse is held down
// canvas.addEventListener("mousedown", (e) => {
//   //Set drawing to true
//   isDrawing = true;

//   //Store starting point
//   startX = e.clientX;
//   startY = e.clientY;
//   console.log("starting point set");
// });

// //Whenever we let go of mouse
// canvas.addEventListener("mouseup", (e) => {
//   //No longer painting
//   isDrawing = false;

//   //Save stroke
//   ctx?.stroke();

//   //Set or begin new path
//   ctx?.beginPath();
// });

// //Listen for mousemove on canvas
// canvas.addEventListener("mousemove", draw);

enum DrawingElementType {
  controller = "controller",
  pencil = "pencil",
  eraser = "eraser",
  colorPicker = "colorPicker",
  lineWidth = "lineWidth",
  clearCanvas = "clearCanvas",
  moveAndResize = "moveAndResize",
}

class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private DrawingObjects: CanvasDrawing[];

  //Elements for controlling canvas props
  private controller: HTMLElement;
  private pencil: HTMLButtonElement;
  private eraser: HTMLButtonElement;
  private colorPicker: HTMLInputElement;
  private lineWidthPicker: HTMLInputElement;
  private clearCanvas: HTMLButtonElement;
  private moveAndResize: HTMLButtonElement;

  //For state tracking
  private isDrawing: boolean;
  private isErasing: boolean;
  private isMovingAndResizing: boolean;
  private isDragging: boolean[] = [];

  private shouldDraw: boolean;
  private shouldErase: boolean;
  private shouldMoveAndResize: boolean;

  private mousePosX: number[] = [];
  private mousePosY: number[] = [];

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

    //Try to save elements using hardcoded defaults
    this.defaultStore();

    //Check if any elements are passed
    if (options?.elements) {
      //IF any elements are passed
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
    this.pencil.classList.add("active");
    this.shouldDraw = true;
    this.loopAndDraw();
    //Add eventlisteners to canvas
    this.listen();
  }

  //Tries to select using default
  private defaultStore = () => {
    const controller = <HTMLElement | null>document.getElementById("toolbar");
    if (controller) this.controller = controller;

    const pen = <HTMLButtonElement | null>document.getElementById("pencil");
    if (pen) this.pencil = pen;

    const eraser = <HTMLButtonElement | null>document.getElementById("eraser");
    if (eraser) this.eraser = eraser;

    const colorPicker = <HTMLInputElement | null>(
      document.getElementById("color")
    );
    if (colorPicker) this.colorPicker = colorPicker;

    const lineWidthPicker = <HTMLInputElement | null>(
      document.getElementById("lineWidth")
    );
    if (lineWidthPicker) this.lineWidthPicker = lineWidthPicker;

    const clearCanvas = <HTMLButtonElement | null>(
      document.getElementById("clear")
    );
    if (clearCanvas) this.clearCanvas = clearCanvas;

    const moveAndResize = <HTMLButtonElement | null>(
      document.getElementById("mv-rz")
    );

    if (moveAndResize) this.moveAndResize = moveAndResize;
  };

  //Runs on each element in the options
  private storeElements = (element: CanvasElement) => {
    //Look for type
    switch (element.type) {
      //IF type is controller
      //THEN check if element has classname or id and query based on that
      case "controller":
        if (element.className) {
          const controller = document.querySelector(
            "." + element.className
          ) as HTMLElement;
          this.controller = controller;
        }

        if (element.id) {
          const controller = document.getElementById(element.id) as HTMLElement;
          this.controller = controller;
        }

        if (element.className && element.id) {
          const controller = document.getElementById(element.id) as HTMLElement;
          this.controller = controller;
        }

        break;

      case "pencil":
        if (element.className) {
          const pen = document.querySelector(
            "." + element.className
          ) as HTMLButtonElement;

          this.pencil = pen;
        }
        if (element.id) {
          const pen = document.getElementById(element.id) as HTMLButtonElement;
          this.pencil = pen;
        }
        if (element.className && element.id) {
          const pen = document.getElementById(element.id) as HTMLButtonElement;
          this.pencil = pen;
        }

        break;

      case "eraser":
        if (element.className) {
          const eraser = document.querySelector(
            "." + element.className
          ) as HTMLButtonElement;
          this.eraser = eraser;
        }
        if (element.id) {
          const eraser = document.getElementById(
            element.id
          ) as HTMLButtonElement;

          this.eraser = eraser;
        }
        if (element.className && element.id) {
          const eraser = document.getElementById(
            element.id
          ) as HTMLButtonElement;
          this.eraser = eraser;
        }
        break;

      case "colorPicker":
        if (element.className) {
          const colorPicker = document.querySelector(
            "." + element.className
          ) as HTMLInputElement;
          this.colorPicker = colorPicker;
        }
        if (element.id) {
          const colorPicker = document.getElementById(
            element.id
          ) as HTMLInputElement;
          this.colorPicker = colorPicker;
        }
        if (element.className && element.id) {
          const colorPicker = document.getElementById(
            element.id
          ) as HTMLInputElement;
          this.colorPicker = colorPicker;
        }
        break;

      case "lineWidth":
        if (element.className) {
          const lineWidthPicker = document.querySelector(
            "." + element.className
          ) as HTMLInputElement;
          this.lineWidthPicker = lineWidthPicker;
        }
        if (element.id) {
          const lineWidthPicker = document.getElementById(
            element.id
          ) as HTMLInputElement;
          this.lineWidthPicker = lineWidthPicker;
        }
        if (element.className && element.id) {
          const lineWidthPicker = document.getElementById(
            element.id
          ) as HTMLInputElement;
          this.lineWidthPicker = lineWidthPicker;
        }
        break;

      case "clearCanvas":
        if (element.className) {
          const clearCanvas = document.querySelector(
            "." + element.className
          ) as HTMLButtonElement;
          this.clearCanvas = clearCanvas;
        }
        if (element.id) {
          const clearCanvas = document.getElementById(
            element.id
          ) as HTMLButtonElement;
          this.clearCanvas = clearCanvas;
        }
        if (element.className && element.id) {
          const clearCanvas = document.getElementById(
            element.id
          ) as HTMLButtonElement;
          this.clearCanvas = clearCanvas;
        }
        break;

      case "moveAndResize":
        if (element.className) {
          const moveAndResize = document.querySelector(
            "." + element.className
          ) as HTMLButtonElement;
          this.moveAndResize = moveAndResize;
        }
        if (element.id) {
          const moveAndResize = document.getElementById(
            element.id
          ) as HTMLButtonElement;
          this.moveAndResize = moveAndResize;
        }
        if (element.className && element.id) {
          const moveAndResize = document.getElementById(
            element.id
          ) as HTMLButtonElement;
          this.moveAndResize = moveAndResize;
        }
        break;

      default:
        break;
    }
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

    const context = this.context;

    //We know that controller expects buttons for click functions
    const target = e.target as HTMLButtonElement;

    //Check if any element could be found from either options or default
    if (clearCanvas) {
      //IF it can THEN check if it has id or class that is equal to the target
      if (
        (target.id && target.id === clearCanvas.id) ||
        (target.className && target.className === clearCanvas.className)
      ) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.mousePosX = [];
        this.mousePosY = [];
        this.isDragging = [];
      }
    }

    if (pen) {
      if (
        (target.id && target.id === pen.id) ||
        (target.className && target.className === pen.className)
      ) {
        eraser?.classList.remove("active");
        moveAndResize?.classList.remove("active");

        this.shouldErase = false;
        this.shouldMoveAndResize = false;

        this.shouldDraw = true;

        //Add classList to indicate active tool
        pen?.classList.add("active");
      }
    }

    if (eraser) {
      if (
        (target.id && target.id === eraser.id) ||
        (target.className && target.className === eraser.className)
      ) {
        pen?.classList.remove("active");
        moveAndResize?.classList.remove("active");

        this.shouldDraw = false;
        this.shouldMoveAndResize = false;

        this.shouldErase = true;

        eraser?.classList.add("active");
      }
    }

    if (moveAndResize) {
      if (
        (target.id && target.id === moveAndResize.id) ||
        (target.className && target.className === moveAndResize.className)
      ) {
        pen?.classList.remove("active");
        eraser?.classList.remove("active");

        this.shouldErase = false;
        this.shouldDraw = false;

        this.shouldMoveAndResize = true;

        moveAndResize?.classList.add("active");
      }
    }
  };

  //Listen for events on given canvas
  private listen() {
    const canvas = this.canvas;

    const controller = this.controller;

    canvas.addEventListener("mousedown", this.pressDownHandler);
    canvas.addEventListener("mouseup", this.releaseHandler);
    canvas.addEventListener("mousemove", this.moveHandler);

    canvas.addEventListener("touchstart", this.pressDownHandler);
    canvas.addEventListener("touchend", this.releaseHandler);
    canvas.addEventListener("touchmove", this.moveHandler);

    controller?.addEventListener("change", this.changeHandler);
    controller?.addEventListener("click", this.clickHandler);
  }

  //Runs whenever mouse is clicked
  private pressDownHandler = (e: MouseEvent | TouchEvent) => {
    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    const startX = evtType.clientX - this.canvas.offsetLeft;
    const startY = evtType.clientY - this.canvas.offsetTop;

    this.isDragging.push(false);

    //Store client mouse positions
    this.mousePosX.push(startX);
    this.mousePosY.push(startY);

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
  };

  //Runs whenever mouse is released
  private releaseHandler = () => {
    this.isDrawing = false;
    this.isErasing = false;
    this.isMovingAndResizing = false;

    this.loopAndDraw();
  };

  //Runs whenever mouse moves
  private moveHandler = (e: MouseEvent | TouchEvent) => {
    //IF we are not drawing or erasing
    if (!this.isDrawing && !this.isErasing && !this.isMovingAndResizing) return;

    //Check if event is touch or mouse
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    const mouseX = evtType.clientX - this.canvas.offsetLeft;
    const mouseY = evtType.clientY - this.canvas.offsetTop;

    this.isDragging.push(true);
    this.mousePosX.push(mouseX);
    this.mousePosY.push(mouseY);

    this.context.lineCap = "round";

    this.loopAndDraw();
  };

  //Loop through current mouse position
  private loopAndDraw() {
    const mousePosX = this.mousePosX;
    const mousePosY = this.mousePosY;
    const isDragging = this.isDragging;
    const context = this.context;
    console.log(mousePosX);
    //Loop through each mouse position
    for (let i = 0; i < mousePosX.length; i++) {
      context.beginPath();
      //IF the current array value is true
      if (isDragging[i]) {
        //THEN move to position from array with always 1 behind current index
        context.moveTo(mousePosX[i - 1], mousePosY[i - 1]);
      }
      //AND Finally make a line and save
      context.lineTo(mousePosX[i], mousePosY[i]);

      context.stroke();
    }
    context.closePath();
  }
}

new DrawingCanvas("drawing-board", {
  elements: [{ type: DrawingElementType.pencil, className: "pen" }],
});

interface CanvasElement {
  type: DrawingElementType;
  className?: string;
  id?: string;
}

interface CanvasDrawing {
  strokeStyle: string;
  lineWidth: number;
  position: number[];
}
