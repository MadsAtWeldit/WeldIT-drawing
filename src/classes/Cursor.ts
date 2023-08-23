export class Cursor {
  private element: HTMLElement

  private startPosition: {
    x: number;
    y: number;
  }
  private currentPosition: {
    x: number;
    y: number;
  }
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

  public reset() {
    this.style = "default";
    this.isDown = false;
  }
}
