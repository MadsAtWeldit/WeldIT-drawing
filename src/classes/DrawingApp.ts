import { Cursor } from "./Cursor.js";
import { DrawingCanvas } from "./DrawingCanvas.js"
import { SHAPE_TYPE, Shape, Shapes } from "./Shape.js";
import { ToolBar, Tool, TargetTool, ActiveTool } from "./ToolBar.js";

export class DrawingApp {
  //Elements
  private canvasElement: HTMLCanvasElement;
  private toolBarElement?: HTMLElement;

  private cursor: Cursor;

  //Prop for using shape methods
  private shape: Shape;
  //Prop for storing the current shape
  private currentShape: Shapes;

  //Canvas
  private canvas: DrawingCanvas;

  //ToolBar
  private toolBar: ToolBar;
  private targetTool: TargetTool;

  private isDragging = false;

  private actions = {
    should: {
      draw: false,
      erase: false,
      line: false,
      write: false,
      move: false
    },
    is: {
      drawing: false,
      erasing: false,
      lining: false,
      writing: false,
      moving: false
    }
  }

  constructor(canvasId: string, toolBar?: { id: string, tools: Tool[] }) {
    this.canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!this.canvasElement) throw new Error(`Could not find a canvasElement with id of: ${canvasId}`);

    //Create a new cursor for canvasElement
    this.cursor = new Cursor(this.canvasElement);

    //Create a new drawing canvas
    this.canvas = new DrawingCanvas(this.canvasElement);

    this.canvasElement.addEventListener("mousedown", (e: TouchEvent | MouseEvent) => {
      this.cursor.isDown = true;
      this.cursor.style = "crosshair";

      //Check if event is touch or mouse
      const evtType = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);

      //Set start position
      this.cursor.startPos = {
        x: evtType.clientX - this.canvasElement.offsetLeft,
        y: evtType.clientY - this.canvasElement.offsetTop
      };


      //Get the active tool
      const { name, element } = this.toolBar.active;

      if (name === "pencil" || name === "eraser") {
        this.shape = new Shape(SHAPE_TYPE.FREEDRAW);//Create a new shape object of type freedraw

        this.currentShape = this.shape.get();//Store the current shape

        //Set composite operation based on if  eraser or pencil
        name === "eraser" ?
          (this.shape.get().operation = "destination-out", this.actions.should.erase = true)
          : (this.shape.get().operation = "source-over", this.actions.should.draw);

        //Add startPos to shape
        this.shape.addCoords(this.cursor.startPos);
      }
    })

    this.canvasElement.addEventListener("mousemove", (e: TouchEvent | MouseEvent) => {
      //Check which type of event it is
      const evtType = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);

      //Store the current cursor position
      this.cursor.currentPos = { x: evtType.clientX - this.canvasElement.offsetLeft, y: evtType.clientY - this.canvasElement.offsetTop }

      //If cursor is down then that means we are dragging
      this.cursor.isDown ? (this.isDragging = true) : (this.isDragging = false);

      //If we should draw and we are dragging that means we are drawing
      if (this.isDragging) {
        (this.actions.should.draw) && (this.actions.is.drawing = true);
        (this.actions.should.erase) && (this.actions.is.erasing = true);

        //Add coords to current shape 
        this.shape.addCoords(this.cursor.currentPos);

        if (this.currentShape.type === SHAPE_TYPE.FREEDRAW) {
          //Create line to current current cursor position
          this.currentShape.path.lineTo(this.cursor.currentPos.x, this.cursor.currentPos.y);
          //Stroke the currentShape path
          this.canvas.stroke(this.currentShape.path);
        }
      }
    })

    if (toolBar) {
      this.toolBarElement = document.getElementById(toolBar.id) as HTMLElement;
      if (!this.toolBarElement) throw new Error(`Could not find a toolBarElement with id of: ${toolBar.id}`);

      this.toolBar = new ToolBar(this.toolBarElement, toolBar.tools);

      this.toolBarElement.addEventListener("click", (e: MouseEvent | TouchEvent) => {
        //Handle the event
        this.toolBar.handleEvent(e);

        //Store the target
        this.targetTool = this.toolBar.target;

        if (this.targetTool.name === "clear") this.canvas.clear()

        if (this.targetTool.name === "undo") this.canvas.undo();


      })
      this.toolBarElement.addEventListener("change", (e: Event) => {
        this.toolBar.handleEvent(e);

        this.targetTool = this.toolBar.target;

      })
    }
  }
}

