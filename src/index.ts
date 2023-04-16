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

// class DrawingCanvas {
//   //Props
//   private canvas: HTMLCanvasElement;
//   private context: CanvasRenderingContext2D;
//   private isDrawing: boolean;
//   private dragging: boolean[] = [];
//   private lineWidth = 5;

//   //Canvas offset
//   public offsetX: number;
//   public offsetY: number;

//   public clickX: number[] = [];
//   public clickY: number[] = [];

//   ///On init
//   constructor(id: string, width?: number, height?: number) {
//     const canvas = document.getElementById(
//       "drawing-board"
//     ) as HTMLCanvasElement;
//     const context = canvas.getContext("2d") as CanvasRenderingContext2D;
//     context.lineWidth = this.lineWidth;
//     context.strokeStyle = "black";

//     //Set offset props
//     this.offsetX = canvas.offsetLeft;
//     this.offsetY = canvas.offsetTop;

//     width
//       ? (canvas.width = width)
//       : (canvas.width = window.innerWidth - this.offsetX);
//     height
//       ? (canvas.height = height)
//       : (canvas.height = window.innerHeight - this.offsetY);
//     //Set props
//     this.canvas = canvas;
//     this.context = context;

//     this.redraw();
//     this.init(width, height);
//   }

//   //Initialization function
//   private init(width?: number, height?: number) {
//     //Store provided canvas
//     const canvas = this.canvas;

//     //Listen for events on canvas
//     canvas.addEventListener("mousedown", this.pressEventHandler);
//     canvas.addEventListener("mousemove", this.dragEventHandler);
//     canvas.addEventListener("mouseup", this.releaseEventHandler);

//     //IF width is not set THEN
//     //Set canvas width and height to full available space
//   }

//   private redraw() {
//     const clickX = this.clickX;
//     const clickY = this.clickY;
//     const context = this.context;
//     const dragging = this.dragging;
//     for (let i = 0; i < clickX.length; i++) {
//       context.beginPath();
//       if (dragging[i] && i) {
//         context.moveTo(clickX[i - 1], clickY[i - 1]);
//       } else {
//         context.moveTo(clickX[i] - 1, clickY[i]);
//       }

//       context.lineTo(clickX[i], clickY[i]);
//       context.stroke();
//     }

//     context.closePath();
//   }

//   private storeClick(x: number, y: number, dragging: boolean) {
//     //Add mouse position to array
//     this.clickX.push(x);
//     this.clickY.push(y);
//     //Add boolean to dragging array
//     this.dragging.push(dragging);
//   }

//   //Start Drawing
//   private pressEventHandler = (e: MouseEvent) => {
//     console.log("ye");
//     let mouseX = (e as MouseEvent).pageX;
//     let mouseY = (e as MouseEvent).pageY;

//     mouseX -= this.offsetX;
//     mouseY -= this.offsetY;

//     this.isDrawing = true;
//     this.storeClick(mouseX, mouseY, false);
//     this.redraw();
//   };

//   private dragEventHandler = (e: MouseEvent | TouchEvent) => {
//     let mouseX = (e as MouseEvent).pageX;
//     let mouseY = (e as MouseEvent).pageY;

//     mouseX -= this.offsetX;
//     mouseY -= this.offsetY;

//     if (this.isDrawing) {
//       this.storeClick(mouseX, mouseY, true);
//       this.redraw();
//     }
//     e.preventDefault();
//   };

//   private releaseEventHandler = () => {
//     //Is no longer drawing
//     this.isDrawing = false;

//     this.redraw();
//   };
// }

// // //Create new drawing canvas
// new DrawingCanvas("drawing-board");

class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  //For controlling the canvas context props
  private controller: HTMLElement;

  private isDrawing: boolean;
  private lineWidth: number;
  private strokeStyle: string;

  constructor(
    elementId: string,
    options?: { controllerId?: string; width?: number; height?: number }
  ) {
    //Get element access based on id passed
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    //IF a controller is passed
    if (options?.controllerId) {
      const controller = document.getElementById(
        options.controllerId
      ) as HTMLElement;
      this.controller = controller;
    }

    //Check if width and height has been set
    options?.width
      ? (canvas.width = options.width)
      : (canvas.width = window.innerWidth - canvas.offsetLeft);
    options?.height
      ? (canvas.height = options.height)
      : (canvas.height = window.innerHeight - canvas.offsetTop);

    //Assign private props
    this.canvas = canvas;
    this.context = context;

    //Default values
    this.context.lineWidth = 5;
    this.context.strokeStyle = "black";
    //Add eventlisteners to canvas
    this.listen();
  }

  //Controller Change handler
  private changeHandler = (e: Event) => {
    const context = this.context;

    const target = e.target as HTMLInputElement;
    if (target.id === "stroke") {
      context.strokeStyle = target.value;
    }
    if (target.id === "lineWidth") {
      console.log(target.id);
      context.lineWidth = Number(target.value);
    }
  };

  //Controller Clear canvas
  private clearCanvas = (e: MouseEvent) => {
    const context = this.context;

    const target = e.target as HTMLButtonElement;

    if (target.id === "clear") {
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  //Listen for events on given canvas
  private listen() {
    const canvas = this.canvas;
    const controller = this.controller;

    canvas.addEventListener("mousedown", this.setDrawpoint);
    canvas.addEventListener("mouseup", this.stopDrawing);
    canvas.addEventListener("mousemove", this.draw);

    controller.addEventListener("change", this.changeHandler);
    controller.addEventListener("click", this.clearCanvas);
  }

  //Runs whenever mouse is clicked
  private setDrawpoint = (e: MouseEvent) => {
    this.isDrawing = true;
    const mouseX = e.clientX - this.canvas.offsetLeft;
    const mouseY = e.clientY - this.canvas.offsetTop;
  };

  //Runs whenever mouse is released
  private stopDrawing = () => {
    this.isDrawing = false;
    //Save stroke
    this.context.stroke();
    //New Path
    this.context.beginPath();
  };

  //Runs whenever mouse moves
  private draw = (e: MouseEvent) => {
    if (!this.isDrawing) return;

    this.context.lineWidth = this.lineWidth;
    this.context.lineCap = "round";

    this.context.lineTo(
      e.clientX - this.canvas.offsetLeft,
      e.clientY - this.canvas.offsetTop
    );

    //Save stroke
    this.context.stroke();
  };

  public setController() {
    return console.log(this.canvas);
  }
}

const drawing = new DrawingCanvas("drawing-board", { controllerId: "toolbar" });

//////////////////////////////////////////////////////////////////////////////////

// class DrawingApp {
//   private canvas: HTMLCanvasElement;
//   private context: CanvasRenderingContext2D;
//   private paint: boolean;

//   private clickX: number[] = [];
//   private clickY: number[] = [];
//   private clickDrag: boolean[] = [];

//   constructor() {
//     const canvas = document.getElementById(
//       "drawing-board"
//     ) as HTMLCanvasElement;
//     const context = canvas.getContext("2d") as CanvasRenderingContext2D;
//     context.lineCap = "round";
//     context.lineJoin = "round";
//     context.strokeStyle = "black";
//     context.lineWidth = 1;

//     this.canvas = canvas;
//     this.context = context;

//     this.redraw();
//     this.createUserEvents();
//   }

//   private createUserEvents() {
//     const canvas = this.canvas;

//     canvas.addEventListener("mousedown", this.pressEventHandler);
//     canvas.addEventListener("mousemove", this.dragEventHandler);
//     canvas.addEventListener("mouseup", this.releaseEventHandler);
//     canvas.addEventListener("mouseout", this.cancelEventHandler);

//     canvas.addEventListener("touchstart", this.pressEventHandler);
//     canvas.addEventListener("touchmove", this.dragEventHandler);
//     canvas.addEventListener("touchend", this.releaseEventHandler);
//     canvas.addEventListener("touchcancel", this.cancelEventHandler);
//   }

//   private redraw() {
//     console.log("redraw");
//     const clickX = this.clickX;
//     const context = this.context;
//     const clickDrag = this.clickDrag;
//     const clickY = this.clickY;
//     console.log(clickX);
//     for (let i = 0; i < clickX.length; ++i) {
//       context.beginPath();
//       if (clickDrag[i] && i) {
//         context.moveTo(clickX[i - 1], clickY[i - 1]);
//       } else {
//         context.moveTo(clickX[i] - 1, clickY[i]);
//       }

//       context.lineTo(clickX[i], clickY[i]);
//       context.stroke();
//     }
//     context.closePath();
//   }

//   private addClick(x: number, y: number, dragging: boolean) {
//     this.clickX.push(x);
//     this.clickY.push(y);
//     this.clickDrag.push(dragging);
//   }

//   private clearCanvas() {
//     this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
//     this.clickX = [];
//     this.clickY = [];
//     this.clickDrag = [];
//   }

//   private clearEventHandler = () => {
//     this.clearCanvas();
//   };

//   private releaseEventHandler = () => {
//     this.paint = false;
//     this.redraw();
//   };

//   private cancelEventHandler = () => {
//     this.paint = false;
//   };

//   private pressEventHandler = (e: MouseEvent | TouchEvent) => {
//     let mouseX = (e as TouchEvent).changedTouches
//       ? (e as TouchEvent).changedTouches[0].pageX
//       : (e as MouseEvent).pageX;
//     let mouseY = (e as TouchEvent).changedTouches
//       ? (e as TouchEvent).changedTouches[0].pageY
//       : (e as MouseEvent).pageY;
//     mouseX -= this.canvas.offsetLeft;
//     mouseY -= this.canvas.offsetTop;

//     this.paint = true;
//     this.addClick(mouseX, mouseY, false);
//     this.redraw();
//   };

//   private dragEventHandler = (e: MouseEvent | TouchEvent) => {
//     let mouseX = (e as TouchEvent).changedTouches
//       ? (e as TouchEvent).changedTouches[0].pageX
//       : (e as MouseEvent).pageX;
//     let mouseY = (e as TouchEvent).changedTouches
//       ? (e as TouchEvent).changedTouches[0].pageY
//       : (e as MouseEvent).pageY;
//     mouseX -= this.canvas.offsetLeft;
//     mouseY -= this.canvas.offsetTop;

//     if (this.paint) {
//       this.addClick(mouseX, mouseY, true);
//       this.redraw();
//     }

//     e.preventDefault();
//   };
// }

// new DrawingApp();
