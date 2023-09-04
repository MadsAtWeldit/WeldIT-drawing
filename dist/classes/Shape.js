export var SHAPE_TYPE;
(function (SHAPE_TYPE) {
    SHAPE_TYPE["FREEDRAW"] = "freedraw";
    SHAPE_TYPE["TEXT"] = "text";
    SHAPE_TYPE["LINE"] = "line";
})(SHAPE_TYPE || (SHAPE_TYPE = {}));
;
export class ShapeProvider {
    static width = 5;
    static color = "black";
    static get freedraw() {
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
        };
    }
    static get line() {
        return {
            type: SHAPE_TYPE.LINE,
            path: new Path2D(),
            resizedPath: null,
            lineWidth: this.width,
            strokeStyle: this.color,
            coords: {},
            resizedCoords: {},
            operation: "source-over",
        };
    }
    static get text() {
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
        };
    }
    static set shapeWidth(width) {
        this.width = width;
    }
    static set shapeColor(color) {
        this.color = color;
    }
}
//# sourceMappingURL=Shape.js.map