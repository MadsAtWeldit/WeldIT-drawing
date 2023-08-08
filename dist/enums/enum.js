//Values for different types of elements
export var DrawingElementType;
(function (DrawingElementType) {
    DrawingElementType["CONTROLLER"] = "CONTROLLER";
    DrawingElementType["PENCIL"] = "PENCIL";
    DrawingElementType["ERASER"] = "ERASER";
    DrawingElementType["COLOR"] = "COLOR";
    DrawingElementType["WIDTH"] = "WIDTH";
    DrawingElementType["CLEARCANVAS"] = "CLEARCANVAS";
    DrawingElementType["MOVEANDRESIZE"] = "MOVEANDRESIZE";
    DrawingElementType["UNDO"] = "UNDO";
    DrawingElementType["TEXT"] = "TEXT";
    DrawingElementType["LINE"] = "LINE";
    DrawingElementType["RECTANGLE"] = "RECTANGLE";
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