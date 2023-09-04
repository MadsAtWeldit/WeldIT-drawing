export class Cursor {
    element;
    startPosition;
    currentPosition;
    cursorIsDown = false;
    constructor(element) {
        this.element = element;
        element.style.cursor = "default";
    }
    set style(value) {
        this.element.style.cursor = value;
    }
    get isDown() {
        return this.cursorIsDown;
    }
    set isDown(value) {
        this.cursorIsDown = value;
    }
    set startPos(pos) {
        this.startPosition = pos;
    }
    get startPos() {
        return this.startPosition;
    }
    set currentPos(pos) {
        this.currentPosition = pos;
    }
    get currentPos() {
        return this.currentPosition;
    }
    reset() {
        this.style = "default";
        this.isDown = false;
    }
}
//# sourceMappingURL=Cursor.js.map