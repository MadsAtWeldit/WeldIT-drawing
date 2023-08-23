import { DrawingCanvas } from "./DrawingCanvas.js"
import { ToolBar, Tool } from "./ToolBar.js";

export class DrawingApp {
  private canvasElement: HTMLCanvasElement;
  private toolBarElement?: HTMLElement;

  private canvas: DrawingCanvas;
  private toolBar: ToolBar;

  constructor(canvasId: string, toolBar?: { id: string, tools: Tool[] }) {
    this.canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvasElement) throw new Error(`Could not find a canvasElement with id of: ${canvasId}`);

    this.canvas = new DrawingCanvas(this.canvasElement);

    if (toolBar) {
      this.toolBarElement = document.getElementById(toolBar.id) as HTMLElement;
      if (!this.toolBarElement) throw new Error(`Could not find a toolBarElement with id of: ${toolBar.id}`);

      this.toolBar = new ToolBar(this.toolBarElement, toolBar.tools);
      this.toolBar.handleEvents();
    }
  }
}

