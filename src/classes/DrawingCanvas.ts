import { DrawingElements } from "../types/elements";
import { Cursor } from "./Cursor.js";
import { Shapes } from "./Shape";
export class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private shapes: Shapes[];
  private selectedShapeIndex: number | null;

  //Last shape index
  private index = -1;

  private cursor: Cursor;

  constructor(canvas: HTMLCanvasElement, options?: { width?: number, height?: number }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;

    //Set width and height if passed to options
    canvas.width = options?.width ?? window.innerWidth - canvas.offsetLeft;
    canvas.height = options?.height ?? window.innerHeight - canvas.offsetTop;

    // this.cursor = new Cursor(canvas);

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

  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.index = -1;
    this.shapes = [];

  }

  public undo() {
    if (this.index <= 0) {
      this.clear()
    } else {
      this.index = -1;
      this.shapes.pop();
    }
  }

  //Strokes the provided path
  public stroke(path: Path2D) {
    this.context.stroke(path);
  }
}
