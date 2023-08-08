//Values for different types of elements
export var DrawingElementType;
(function (DrawingElementType) {
    DrawingElementType["controller"] = "controller";
    DrawingElementType["pencil"] = "pencil";
    DrawingElementType["eraser"] = "eraser";
    DrawingElementType["color"] = "color";
    DrawingElementType["width"] = "width";
    DrawingElementType["clearCanvas"] = "clearCanvas";
    DrawingElementType["moveAndResize"] = "moveAndResize";
    DrawingElementType["undo"] = "undo";
    DrawingElementType["text"] = "text";
    DrawingElementType["line"] = "line";
    DrawingElementType["rectangle"] = "rectangle";
})(DrawingElementType || (DrawingElementType = {}));
export var SelectionPosition;
(function (SelectionPosition) {
    SelectionPosition["TOP_LEFT"] = "TOP_LEFT";
    SelectionPosition["TOP_RIGHT"] = "TOP_RIGHT";
    SelectionPosition["BOTTOM_LEFT"] = "BOTTOM_LEFT";
    SelectionPosition["BOTTOM_RIGHT"] = "BOTTOM_RIGHT";
    SelectionPosition["START"] = "START";
    SelectionPosition["END"] = "END";
    SelectionPosition["MIDDLE"] = "MIDDLE";
    SelectionPosition["NONE"] = "NONE";
})(SelectionPosition || (SelectionPosition = {}));
//# sourceMappingURL=enum.js.map