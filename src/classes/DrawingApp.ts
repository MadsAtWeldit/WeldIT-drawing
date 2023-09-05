import { assert } from "console";
import { createPersonalElement } from "../utils/common.js";
import { Cursor } from "./Cursor.js";
import { DrawingCanvas } from "./DrawingCanvas.js"
import { FreeDrawShape, LineShape, SHAPE_TYPE, ShapeProvider, Shapes, TextShape } from "./Shape.js";
import { ToolBar, Tool, TargetTool, ActiveTool } from "./ToolBar.js";


type FindByType<Shapes, Type> = Shapes extends { type: Type } ? Shapes : never;
type ShapeOf<Type extends SHAPE_TYPE> = FindByType<Shapes, Type>;
type Result = ShapeOf<SHAPE_TYPE.TEXT>;

export class DrawingApp {
  //Elements
  private canvasElement: HTMLCanvasElement;
  private toolBarElement?: HTMLElement;

  private cursor: Cursor;

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
    },
  }

  constructor(canvasId: string, toolBar?: { id: string, tools: Tool[] }) {
    this.canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvasElement) throw new Error(`Could not find a canvasElement with id of: ${canvasId}`);

    //Create a new cursor for canvasElement
    this.cursor = new Cursor(this.canvasElement);
    //Create a new drawing canvas
    this.canvas = new DrawingCanvas(this.canvasElement);

    this.canvasElement.addEventListener("mousedown", this.mousedownHandler);

    this.canvasElement.addEventListener("mousemove", (e: TouchEvent | MouseEvent) => {
      const evtType = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent);

      this.cursor.currentPos = { x: evtType.clientX - this.canvasElement.offsetLeft, y: evtType.clientY - this.canvasElement.offsetTop }

      this.cursor.isDown ? (this.isDragging = true) : (this.isDragging = false);

      if (this.isDragging && this.currentShape.type === SHAPE_TYPE.FREEDRAW) {
        (this.actions.should.draw) && (this.actions.is.drawing = true);
        (this.actions.should.erase) && (this.actions.is.erasing = true);

        this.canvas.contextStyles(this.currentShape);//Set context styles based on current shape

        this.currentShape.xCoords.push(this.cursor.currentPos.x);
        this.currentShape.yCoords.push(this.cursor.currentPos.y);

        //Create line to current current cursor position
        this.currentShape.path.lineTo(this.cursor.currentPos.x, this.cursor.currentPos.y);
        //Stroke the currentShape path
        this.canvas.stroke(this.currentShape.path);
      }

      if (this.actions.should.line && this.currentShape.type === SHAPE_TYPE.LINE) {
        this.canvas.redraw();

        this.actions.is.lining = true;

        this.canvas.drawLine(this.currentShape, this.cursor.startPos.x, this.cursor.startPos.y, this.cursor.currentPos.x, this.cursor.currentPos.y);

      }
    })

    this.canvasElement.addEventListener("mouseup", this.mouseupHandler);

    //If toolbar was passed to constructor
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

        //Redraw the canvas
        this.canvas.redraw();

      })

      this.toolBarElement.addEventListener("change", (e: Event) => {
        this.toolBar.handleEvent(e);
        this.targetTool = this.toolBar.target;

        //Set the width and color so that next shape provided will have those props
        if (this.targetTool.name === "width") ShapeProvider.shapeWidth = Number(this.targetTool.element.value);
        if (this.targetTool.name === "color") ShapeProvider.shapeColor = this.targetTool.element.value;

      })
    }
  }

  //Handle for mousedown/touchstart
  private mousedownHandler = (e: MouseEvent | TouchEvent) => {
    this.cursor.isDown = true;
    this.cursor.style = "crosshair";

    if (this.actions.is.writing) return;

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
      this.currentShape = ShapeProvider.freedraw;

      //Set composite operation based on if eraser or pencil
      name === "eraser" ? (this.currentShape.operation = "destination-out", this.actions.should.erase = true) : (this.currentShape.operation = "source-over", this.actions.should.draw = true);

      //Push cursor position
      this.currentShape.xCoords.push(this.cursor.startPos.x);
      this.currentShape.yCoords.push(this.cursor.startPos.y);
    }

    if (name === "text") {
      this.currentShape = ShapeProvider.text;

      const canvasContainer = document.querySelector<HTMLElement>(".drawing-board");

      if (!canvasContainer) return;

      const textInput = createPersonalElement("input", canvasContainer, {
        position: "fixed",
        top: `${evtType.clientY}px`,
        left: `${evtType.clientX}px`,
        outline: "none",
        background: "none",
        border: "none",
        "font-size": "30pt",
        "font-family": "sans-serif",
      });

      this.actions.is.writing = true;

      window.setTimeout(() => textInput.focus(), 0);

      canvasContainer.appendChild(textInput);

      //On unfocus
      textInput.addEventListener("blur", () => {
        if (this.currentShape.type !== SHAPE_TYPE.TEXT) return;

        this.currentShape.text = textInput.value;

        this.canvas.contextStyles(this.currentShape);

        const { width, height } = this.canvas.measureText(textInput.value);

        this.currentShape.coords = {
          x1: this.cursor.startPos.x,
          y1: this.cursor.startPos.y,
          x2: Math.round(this.cursor.startPos.x + width),
          y2: Math.round(this.cursor.startPos.y + height)
        }

        this.canvas.fillText(this.currentShape.text, this.currentShape.coords.x1 ?? 0, this.currentShape.coords.y1 ?? 0);

        this.canvas.shapesIndex += 1;
        this.canvas.addShape(this.currentShape);

        canvasContainer.removeChild(textInput);

        this.actions.is.writing = false;

      })

      //Call blur when hitting enter
      textInput.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          textInput.blur();
        }
      })
    }

    if (name === "line") {
      if (this.actions.is.lining) return;

      this.currentShape = ShapeProvider.line;//Get a line shape

      this.actions.should.line = true;

      this.currentShape.path.moveTo(this.cursor.startPos.x, this.cursor.startPos.y);
      this.currentShape.coords = { startX: this.cursor.startPos.x, startY: this.cursor.startPos.y };
    }
  }

  private mouseupHandler = () => {
    console.log("ran");
    //Cursor is no longer down so reset to initial state
    this.cursor.reset();

    if ((this.actions.is.drawing) || (this.actions.is.erasing)) {

      this.actions.should.draw = false;
      this.actions.is.drawing = false;

      this.actions.should.erase = false;
      this.actions.is.erasing = false;

      //Save
      this.canvas.shapesIndex += 1;
      this.canvas.addShape(this.currentShape);
    }

    if (this.actions.is.lining) {
      this.actions.should.line = false;
      this.actions.is.lining = false;
      (this.currentShape as LineShape).coords.endX = this.cursor.currentPos.x;
      (this.currentShape as LineShape).coords.endY = this.cursor.currentPos.y;

      (this.currentShape as LineShape).path.lineTo(this.cursor.currentPos.x, this.cursor.currentPos.y);

      this.canvas.shapesIndex += 1;
      this.canvas.addShape(this.currentShape);
    }

    //Redraw the canvas
    this.canvas.redraw()
  }

}
