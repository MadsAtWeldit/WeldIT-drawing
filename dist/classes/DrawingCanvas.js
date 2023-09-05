import { SHAPE_TYPE } from "./Shape.js";
export class DrawingCanvas {
    canvas;
    context;
    //All shapes that are to be drawn on canvas
    shapes = [];
    //Index of selected shape
    selectedShapeIndex;
    //Shapes index
    index = -1;
    cursor;
    constructor(canvas, options) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        //Set width and height if passed to options
        canvas.width = options?.width ?? window.innerWidth - canvas.offsetLeft;
        canvas.height = options?.height ?? window.innerHeight - canvas.offsetTop;
    }
    init() {
        this.canvas.addEventListener("mousedown", () => {
            this.cursor.style = "crosshair";
            this.cursor.isDown = true;
        });
        this.canvas.addEventListener("mouseup", () => {
            this.cursor.reset();
        });
        this.canvas.addEventListener("mousemove", () => {
            console.log("moving");
        });
        this.canvas.addEventListener("touchstart", () => {
            this.cursor.style = "crosshair";
            this.cursor.isDown = true;
        });
        this.canvas.addEventListener("touchend", () => {
            this.cursor.reset();
        });
        this.canvas.addEventListener("touchmove", () => {
            console.log("moving");
        });
    }
    //Clear the canvas
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.index = -1;
        this.shapes = [];
    }
    //Undo the drawn shape
    undo() {
        this.index -= 1;
        this.shapes.pop();
    }
    //Strokes the provided path
    stroke(path) {
        this.context.stroke(path);
    }
    fillText(text, x, y) {
        this.context.fillText(text, x, y);
    }
    drawLine(lineShape, startX, startY, endX, endY) {
        this.contextStyles(lineShape);
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
        this.context.closePath();
        this.context.stroke();
    }
    //Set the index
    set shapesIndex(index) {
        this.index = index;
    }
    //Get the index
    get shapesIndex() {
        return this.index;
    }
    //Method for adding shape to shapes array
    addShape(shape) {
        this.shapes.push(shape);
    }
    //Return shapes array
    getShapes() {
        return this.shapes;
    }
    measureText(text) {
        return {
            width: this.context.measureText(text).width,
            height: parseInt(this.context.font)
        };
    }
    //Loop and redraw all shapes
    redraw() {
        //Clear the rect
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //Return if there are no shapes
        if (this.shapes.length <= 0)
            return;
        this.shapes.forEach((shape) => {
            this.contextStyles(shape);
            if (shape.type === SHAPE_TYPE.TEXT) {
                this.context.fillText(shape.text, shape.coords.x1 ?? 0, shape.coords.y1 ?? 0);
                return;
            }
            //Stroke the current shapes path
            this.context.stroke(shape.path);
        });
    }
    //Update context with styles from current shape
    contextStyles(shape) {
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
//# sourceMappingURL=DrawingCanvas.js.map