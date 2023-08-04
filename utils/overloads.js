import { assertRequired } from "./common.js";
//Returns coordinates based on if we are resizing or not
export function getCorrectCoords(drawing, resizing) {
    let coords;
    //Make sure that coords are not undefined
    resizing ? assertRequired(drawing.resizedCoords) : assertRequired(drawing.coords);
    if (drawing.type === "line") {
        coords = {
            startX: resizing ? drawing.resizedCoords.resizedStartX : drawing.coords.startX,
            startY: resizing ? drawing.resizedCoords.resizedStartY : drawing.coords.startY,
            endX: resizing ? drawing.resizedCoords.resizedEndX : drawing.coords.endX,
            endY: resizing ? drawing.resizedCoords.resizedEndY : drawing.coords.endY,
        };
    }
    else {
        coords = {
            x1: resizing ? drawing.resizedCoords.resizedX1 : drawing.coords.x1,
            y1: resizing ? drawing.resizedCoords.resizedY1 : drawing.coords.y1,
            x2: resizing ? drawing.resizedCoords.resizedX2 : drawing.coords.x2,
            y2: resizing ? drawing.resizedCoords.resizedY2 : drawing.coords.y2,
        };
    }
    return coords;
}
//# sourceMappingURL=overloads.js.map