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

class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  //For controlling the canvas context props
  private controller: HTMLElement;

  private isDrawing: boolean;
  private isErasing: boolean;
  private shouldErase: boolean;

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
    if (target.id === "color") {
      context.strokeStyle = target.value;
    }
    if (target.id === "lineWidth") {
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
    if (target.id === "eraser") {
      this.shouldErase = true;

      // context.globalCompositeOperation = "destination-out";
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

    controller.addEventListener("change", this.changeHandler);
    controller.addEventListener("click", this.clearCanvas);
  }

  //Runs whenever mouse is clicked
  private start = (e: MouseEvent | TouchEvent) => {
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    if (this.shouldErase) {
      this.context.globalCompositeOperation = "destination-out";
      this.isErasing = true;
      this.isDrawing = false;
    } else {
      this.context.globalCompositeOperation = "source-over";
      this.isDrawing = true;
      this.isErasing = false;
    }

    const mouseX = evtType.clientX - this.canvas.offsetLeft;
    const mouseY = evtType.clientY - this.canvas.offsetTop;
  };

  //Runs whenever mouse is released
  private stop = () => {
    this.isDrawing = false;
    this.isErasing = false;
    //Save stroke
    this.context.stroke();
    //New Path
    this.context.beginPath();
  };

  //Runs whenever mouse moves
  private draw = (e: MouseEvent | TouchEvent) => {
    //IF we are not drawing or erasing
    if (!this.isDrawing && !this.isErasing) return;

    //Check if event has touch or mouse and assign accordingly
    const evtType = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);

    this.context.lineWidth = this.lineWidth;
    this.context.lineCap = "round";

    this.context.lineTo(
      evtType.clientX - this.canvas.offsetLeft,
      evtType.clientY - this.canvas.offsetTop
    );

    //Save stroke
    this.context.stroke();
  };

  public log() {
    return console.log(this.canvas);
  }
}

new DrawingCanvas("drawing-board", {
  controllerId: "toolbar",
});
