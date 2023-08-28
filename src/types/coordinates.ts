//Interface for left right top and bottom of drawing that has it
interface SelectionCoords {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

//Type for resized coords for elements that use selection coords
type ResizedSelectionCoords = Prefix<SelectionCoords, "resized">;

//Type for line coords
type LineSelectionCoords = Rename<SelectionCoords, "startX" | "startY" | "endX" | "endY">;

//Type for resized coords for elements that use line selection coords
type ResizedLineSelectionCoords = Prefix<LineSelectionCoords, "resized">;
//Union of available coords
type Coords = SelectionCoords | LineSelectionCoords;

type ResizedCoords = ResizedSelectionCoords | ResizedLineSelectionCoords;
