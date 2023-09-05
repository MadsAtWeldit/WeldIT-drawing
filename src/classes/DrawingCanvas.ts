import { Cursor } from "./Cursor.js";
import { LineShape, SHAPE_TYPE, Shapes } from "./Shape.js";
export class DrawingCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  //All shapes that are to be drawn on canvas
  private shapes: Shapes[] = [];

  //Index of selected shape
  private selectedShapeIndex: number | null;

  //Shapes index
  private index = -1;

  private cursor: Cursor;

  constructor(canvas: HTMLCanvasElement, options?: { width?: number, height?: number }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;

    //Set width and height if passed to options
    canvas.width = options?.width ?? window.innerWidth - canvas.offsetLeft;
    canvas.height = options?.height ?? window.innerHeight - canvas.offsetTop;

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
    this.index -= 1;
    this.shapes.pop();
  }

  public stroke(path: Path2D) {
    this.context.stroke(path);
  }

  public fillText(text: string, x: number, y: number) {
    this.context.fillText(text, x, y);
  }

  public drawLine(lineShape: LineShape, startX: number, startY: number, endX: number, endY: number) {
    this.contextStyles(lineShape);

    this.context.beginPath();

    this.context.moveTo(startX, startY);

    this.context.lineTo(endX, endY);

    this.context.closePath();
    this.context.stroke();

  }

  //Set the index
  public set shapesIndex(index: number) {
    this.index = index;
  }

  //Get the index
  public get shapesIndex(): number {
    return this.index;
  }

  public addShape(shape: Shapes) {
    this.shapes.push(shape);
  }

  public getShapes() {
    return this.shapes;
  }

  public measureText(text: string) {
    return {
      width: this.context.measureText(text).width,
      height: parseInt(this.context.font)
    };
  }

  //Loop and redraw all shapes
  public redraw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.shapes.length <= 0) return;

    this.shapes.forEach((shape) => {
      this.contextStyles(shape);

      if (shape.type === SHAPE_TYPE.TEXT) {
        this.context.fillText(shape.text, shape.coords.x1 ?? 0, shape.coords.y1 ?? 0);
        return;
      }

      this.context.stroke(shape.path);

    })
  }

  public contextStyles(shape: Shapes) {
    this.context.globalCompositeOperation = shape.operation;
    this.context.lineCap = "round";

    if (shape.type === SHAPE_TYPE.TEXT) {
      this.context.textBaseline = shape.baseline;
      this.context.font = shape.font;
      this.context.fillStyle = shape.fillStyle;
      return;
    }

    this.context.lineWidth = shape.lineWidth;
    this.context.strokeStyle = shape.strokeStyle;
  }
}
