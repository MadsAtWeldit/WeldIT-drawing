import { DrawingElementType } from "../enums/enum";
export interface PathElement {
  type: "stroke";
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
  coords: SelectionCoords;
  resizedCoords: ResizedSelectionCoords;
  xCords: number[];
  yCords: number[];
  resizedXCords: number[];
  resizedYCords: number[];
}

export interface TextElement {
  type: "text";
  text: string;
  font: string;
  resizedFont: string;
  baseline: string;
  coords: SelectionCoords;
  resizedCoords: ResizedSelectionCoords;
  operation: "source-over" | "destination-out";
}

export interface LineElement {
  type: "line";
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
  coords: LineSelectionCoords;
  resizedCoords: ResizedLineSelectionCoords;
}
export type DrawingElements = PathElement | TextElement | LineElement;

//Expected structure of element passed to options
export interface OptionElement {
  type: DrawingElementType;
  className?: string;
  id?: string;
}
