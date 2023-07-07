import { DrawingElements, LineElement } from "../types/elements";
import { assertRequired } from "./common.js";

//Return coords based on drawing type
export function getCorrectCoords<T extends DrawingElements>(
  drawing: T,
  resizing: Actions["resizing"]
): T extends LineElement ? Required<LineSelectionCoords> : Required<SelectionCoords>;

//Returns coordinates based on if we are resizing or not
export function getCorrectCoords(drawing: DrawingElements, resizing: Actions["resizing"]) {
  let coords: Required<LineSelectionCoords> | Required<SelectionCoords>;

  //Make sure that coords are not undefined
  resizing ? assertRequired(drawing.resizedCoords) : assertRequired(drawing.coords);

  if (drawing.type === "line") {
    coords = {
      startX: resizing ? drawing.resizedCoords.resizedStartX : drawing.coords.startX,
      startY: resizing ? drawing.resizedCoords.resizedStartY : drawing.coords.startY,
      endX: resizing ? drawing.resizedCoords.resizedEndX : drawing.coords.endX,
      endY: resizing ? drawing.resizedCoords.resizedEndY : drawing.coords.endY,
    } as Required<LineSelectionCoords>;
  } else {
    coords = {
      x1: resizing ? drawing.resizedCoords.resizedX1 : drawing.coords.x1,
      y1: resizing ? drawing.resizedCoords.resizedY1 : drawing.coords.y1,
      x2: resizing ? drawing.resizedCoords.resizedX2 : drawing.coords.x2,
      y2: resizing ? drawing.resizedCoords.resizedY2 : drawing.coords.y2,
    } as Required<SelectionCoords>;
  }

  return coords;
}
