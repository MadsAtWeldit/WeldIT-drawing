interface PathElement {
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

interface TextElement {
  type: "text";
  text: string;
  font: string;
  resizedFont: string;
  baseline: string;
  coords: SelectionCoords;
  resizedCoords: ResizedSelectionCoords;
  operation: "source-over" | "destination-out";
}

interface LineElement {
  type: "line";
  path: Path2D;
  resizedPath: Path2D | null;
  lineWidth: number;
  strokeStyle: string;
  operation: "source-over" | "destination-out";
  coords: LineSelectionCoords;
  resizedCoords: ResizedLineSelectionCoords;
}
type DrawingElements = PathElement | TextElement | LineElement;
