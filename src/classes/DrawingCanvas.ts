import { DrawingElements } from "../types/elements";
import { Cursor } from "./Cursor.js";
export class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private drawings: DrawingElements[];
  private selectedDrawingIndex: number | null;

  private cursor: Cursor;

  constructor(canvas: HTMLCanvasElement, options?: { width?: number, height?: number }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;

    //Set width and height if passed to options
    canvas.width = options?.width ?? window.innerWidth - canvas.offsetLeft;
    canvas.height = options?.height ?? window.innerHeight - canvas.offsetTop;

    this.cursor = new Cursor(canvas);
    //Start listening for events on the canvas
    this.init();
  }
  init() {
    this.canvas.addEventListener("mousedown", () => {
      this.cursor.style = "crosshair";
      this.cursor.isDown = true;
    })
    this.canvas.addEventListener("mouseup", () => {
      this.cursor.reset();

    })
    this.canvas.addEventListener("mousemove", () => {
      console.log("moving")
    })
    this.canvas.addEventListener("touchstart", () => {
      this.cursor.style = "crosshair";
      this.cursor.isDown = true;
    });
    this.canvas.addEventListener("touchend", () => {
      this.cursor.reset();
    });
    this.canvas.addEventListener("touchmove", () => {
      console.log("moving")
    });

  }
}
