interface Tools {
  pencil: HTMLButtonElement | null;
  eraser: HTMLButtonElement | null;
  moveAndResize: HTMLButtonElement | null;
  text: HTMLButtonElement | null;
  line: HTMLButtonElement | null;
}

//States of tools if they are toggled or not
type ToolStates = ToBool<Tools>;

interface ToolModifiers {
  color: HTMLInputElement | null;
  width: HTMLInputElement | null;
}

interface CanvasModifiers {
  clear: HTMLButtonElement | null;
  undo: HTMLButtonElement | null;
}

interface SelectedTool {
  element?: HTMLButtonElement;
  name?: keyof ToolStates;
}

interface Actions {
  drawing: boolean;
  erasing: boolean;
  moving: boolean;
  resizing: boolean;
  writing: boolean;
  lining: boolean;
}
