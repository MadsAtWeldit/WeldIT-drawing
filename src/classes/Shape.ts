export enum SHAPE_TYPE {
  FREEDRAW = "freedraw",
  TEXT = "text",
  LINE = "line"
}

export type Shapes = FreeDrawShape | LineShape | TextShape;

export interface FreeDrawShape {
  type: SHAPE_TYPE.FREEDRAW;
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  xCoords: number[];
  yCoords: number[];
  resizedXCords: number[];
  resizedYCoords: number[];
  coords: SelectionCoords;
  resizedCoords: ResizedCoords;
  operation: GlobalCompositeOperation;
}

export interface LineShape {
  type: SHAPE_TYPE.LINE;
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  coords: LineSelectionCoords;
  resizedCoords: ResizedCoords;
  operation: GlobalCompositeOperation;
};

export interface TextShape {
  type: SHAPE_TYPE.TEXT;
  text: string;
  font: string;
  resizedFont: string;
  baseline: CanvasTextBaseline;
  fillStyle: string;
  coords: SelectionCoords;
  resizedCoords: ResizedCoords;
  operation: GlobalCompositeOperation;
}


export class ShapeProvider {
  private static width: number = 5;
  private static color: string = "black";

  public static get freedraw(): FreeDrawShape {
    return {
      type: SHAPE_TYPE.FREEDRAW,
      path: new Path2D,
      resizedPath: null,
      lineWidth: this.width,
      strokeStyle: this.color,
      xCoords: [],
      yCoords: [],
      resizedXCords: [],
      resizedYCoords: [],
      coords: {},
      resizedCoords: {},
      operation: "source-over",
    }
  }
  public static get line(): LineShape {
    return {
      type: SHAPE_TYPE.LINE,
      path: new Path2D(),
      resizedPath: null,
      lineWidth: this.width,
      strokeStyle: this.color,
      coords: {},
      resizedCoords: {},
      operation: "source-over",
    }
  }
  public static get text(): TextShape {
    return {
      type: SHAPE_TYPE.TEXT,
      text: "",
      font: "30pt sans-serif",
      resizedFont: "",
      baseline: "top",
      fillStyle: this.color,
      coords: {},
      resizedCoords: {},
      operation: "source-over",
    }
  }

  public static set shapeWidth(width: number) {
    this.width = width;
  }

  public static set shapeColor(color: string) {
    this.color = color;
  }
}
