//Values for different types of elements
export enum DrawingElementType {
  controller = "controller",
  pencil = "pencil",
  eraser = "eraser",
  color = "color",
  width = "width",
  clearCanvas = "clearCanvas",
  moveAndResize = "moveAndResize",
  undo = "undo",
  text = "text",
  line = "line",
  rectangle = "rectangle",
}

export enum SelectionPosition {
  TOP_LEFT = "TOP_LEFT",
  TOP_RIGHT = "TOP_RIGHT",
  BOTTOM_LEFT = "BOTTOM_LEFT",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
  START = "START",
  END = "END",
  MIDDLE = "MIDDLE",
  NONE = "NONE",
}
