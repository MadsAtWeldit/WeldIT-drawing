import { Cursor } from "./Cursor.js";
import { SHAPE_TYPE, Shapes } from "./Shape.js";
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

  //Clear the canvas
  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.index = -1;
    this.shapes = [];

  }

  //Undo the drawn shape
  public undo() {
    this.index -= 1;
    this.shapes.pop();
  }

  //Strokes the provided path
  public stroke(path: Path2D) {
    this.context.stroke(path);
  }

  public fillText(text: string, x: number, y: number){
    this.context.fillText(text, x, y);
  }

  //Set the index
  public set shapesIndex(index: number) {
    this.index = index;
  }

  //Get the index
  public get shapesIndex(): number {
    return this.index;
  }

  //Method for adding shape to shapes array
  public addShape(shape: Shapes) {
    this.shapes.push(shape);
  }

  //Return shapes array
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
    //Clear the rect
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //Return if there are no shapes
    if (this.shapes.length <= 0) return;
    this.shapes.forEach((shape) => {
      this.contextStyles(shape);

      if (shape.type === SHAPE_TYPE.TEXT) {
        this.context.fillText(shape.text, shape.coords.x1 ?? 0, shape.coords.y1 ?? 0);
        return;
      }

      //Stroke the current shapes path
      this.context.stroke(shape.path);

    })
  }

  //Update context with styles from current shape
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
