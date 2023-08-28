export interface CursorPosition {
  x: number;
  y: number;
}
export class Cursor {
  private element: HTMLElement

  private startPosition: CursorPosition;

  private currentPosition: CursorPosition;

  private cursorIsDown: boolean = false;

  constructor(element: HTMLElement) {
    this.element = element;
    element.style.cursor = "default";
  }

  public set style(value: string) {
    this.element.style.cursor = value;
  }

  public get isDown(): boolean {
    return this.cursorIsDown;
  }

  public set isDown(value: boolean) {
    this.cursorIsDown = value;
  }

  public set startPos(pos: CursorPosition) {
    this.startPosition = pos;
  }

  public get startPos() {
    return this.startPosition;
  }

  public set currentPos(pos: CursorPosition) {
    this.currentPosition = pos;
  }

  public get currentPos(): CursorPosition {
    return this.currentPosition;
  }

  public reset() {
    this.style = "default";
    this.isDown = false;
  }
}
