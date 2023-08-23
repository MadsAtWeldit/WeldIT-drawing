//All possible tools
export enum ToolTypes {
  PENCIL = "PENCIL",
  ERASER = "ERASER",
  COLOR_PICKER = "COLOR",
  LINE_WIDTH_PICKER = "WIDTH",
  CLEAR_CANVAS = "CLEARCANVAS",
  MOVE_AND_RESIZE = "MOVEANDRESIZE",
  UNDO = "UNDO",
  TEXT = "TEXT",
  LINE = "LINE",
  RECTANGLE = "RECTANGLE",
}

//Expected structure of tools passed to ToolBar
export interface Tool {
  type: ToolTypes;
  className?: string;
  id?: string;
}

//All tools that can be activated
interface ActivatableTools {
  pencil: HTMLButtonElement | null;
  eraser: HTMLButtonElement | null;
  moveAndResize: HTMLButtonElement | null;
  text: HTMLButtonElement | null;
  line: HTMLButtonElement | null;
}
//All tools that modify other tools
interface ToolModifiers {
  color: HTMLInputElement | null;
  width: HTMLInputElement | null;
}
//All tools that modifies the state of the canvas
interface CanvasModifiers {
  clear: HTMLButtonElement | null;
  undo: HTMLButtonElement | null;
}

//All the categories of tools
export type ToolCategories = ActivatableTools | ToolModifiers | CanvasModifiers;

//Gets keys of whatever type is passed in
export type KeysOfUnion<T> = T extends T ? keyof T : never;

//All names of tools that can't be activated
export type NonActivatableToolNames = KeysOfUnion<ToolModifiers | CanvasModifiers>;
//All names of tools that can be activated
export type ActivatableToolNames = keyof ActivatableTools;

export interface ActiveTool {
  name: ActivatableToolNames;
  element: HTMLButtonElement;
}

interface Tools {
  activatable: ActivatableTools;
  modifiers: ToolModifiers;
  canvas: CanvasModifiers;
}

export interface NonActivatableTool {
  name: NonActivatableToolNames;
  element: HTMLButtonElement | HTMLInputElement;
}

export interface TargetTool {
  name: KeysOfUnion<ToolCategories>;
  element: HTMLButtonElement | HTMLInputElement;
}

export class ToolBar {
  private toolBar: HTMLElement;

  //The current active tool
  private activeTool: ActiveTool;

  //The current targeted tool
  private targetTool: TargetTool;


  private tools: Tools = {
    activatable: {
      pencil: <HTMLButtonElement | null>document.getElementById("pencil"),
      eraser: <HTMLButtonElement | null>document.getElementById("eraser"),
      moveAndResize: <HTMLButtonElement | null>document.getElementById("mv-rz"),
      text: <HTMLButtonElement | null>document.getElementById("text"),
      line: <HTMLButtonElement | null>document.getElementById("line"),
    },
    modifiers: {
      color: <HTMLInputElement | null>document.getElementById("color"),
      width: <HTMLInputElement | null>document.getElementById("lineWidth"),
    },
    canvas: {
      clear: <HTMLButtonElement | null>document.getElementById("clear"),
      undo: <HTMLButtonElement | null>document.getElementById("undo"),
    }
  }

  constructor(toolBar: HTMLElement, tools: Tool[]) {
    this.toolBar = toolBar;
    //Loop through each tool and assign it to correct props 
    tools.forEach((tool) => {
      this.assignCorrectly(tool, this.tools.activatable);
      this.assignCorrectly(tool, this.tools.modifiers);
      this.assignCorrectly(tool, this.tools.canvas);
    })

    //Listen for events on the toolbar
    this.handleEvents();
  }

  //Assigns tools passed to correct property
  private assignCorrectly = <T extends ToolCategories, U extends Tool>(
    tool: U,
    prop: T
  ) => {
    Object.keys(prop).map((key) => {
      if (tool.type === key.toUpperCase()) {
        const index = key as keyof T;
        if (!tool.className && !tool.id)
          throw new Error(`Please provide a class or id for element: ${tool.type}`);

        if (tool.className) {
          const el = document.querySelector("." + tool.className) as T[keyof T];
          if (el) {
            prop[index] = el;
          } else {
            throw new Error(`Could not find element with className: ${tool.className}`);
          }
        }

        if (tool.id) {
          const el = document.getElementById(tool.id) as T[keyof T];
          if (el) {
            prop[index] = el;
          } else {
            throw new Error(`Could not find element with id: ${tool.id}`);
          }
        }
      }
    });
  };

  public handleEvents() {
    this.toolBar.addEventListener("click", this.toolSelectHandler);
    // this.toolBar.addEventListener("change", this.changeHandler);
  }

  //Runs when click event happens on the toolbar
  private toolSelectHandler = (e: MouseEvent | TouchEvent) => {
    //Check if the target is an Element
    if (e.target instanceof Element) {
      const target = e.target as Element;//We know it's an element
      const targetTool = this.findTargetTool(target, this.tools);//Find target tool

      if (!targetTool) return;//Simply return

      //IF targetTool is activatable then set it as active aswell
      targetTool.name in this.tools.activatable && (this.active = targetTool as ActiveTool);

      this.target = targetTool;

      console.log(this.targetTool);

    }
  }

  private findTargetTool = (target: Element, tools: Tools): TargetTool | null => {
    let tool: TargetTool | null = null;
    //Loop each category of tools and try to find the targeted element
    Object.keys(tools).forEach((category) => {
      const currentToolCategory = tools[category as keyof Tools];
      const targetTool = Object.entries(currentToolCategory).find(([, element]) => element === target);
      targetTool && (tool = { name: targetTool[0] as KeysOfUnion<ToolCategories>, element: targetTool[1] });
    })
    return tool;
  }

  // private changeHandler = (e: Event) => {
  //   const definedToolModifiers = excludeNullishProps(this.tools.modifiers);
  //
  //   if (e.target instanceof Element) {
  //     const target = e.target as Element;
  //
  //     Object.entries(definedToolModifiers).forEach(([name, element]) => {
  //       if (target === element) {
  //         this.current = { name: name as NonActivatableToolNames, element };
  //       }
  //     })
  //   }
  // }

  //////////////////Methods for current tool\\\\\\\\\\\\\\\\\\\\\
  public set target(tool: TargetTool) {
    this.targetTool = tool;
  }

  public get target(): TargetTool {
    return this.targetTool;
  }

  //////////////////Methods for activating a tool\\\\\\\\\\\\\\\\\\\\\
  //Method for setting the active tool
  public set active(tool: ActiveTool) {
    //Remove active class before applying it to a new one
    if (this.activeTool) this.activeTool.element.classList.remove("active");

    this.activeTool = tool;
    //Add active class for selectedTool
    this.activeTool.element.classList.add("active");
  }

  //Return the selected tool
  public get active(): ActiveTool {
    return this.activeTool;
  }
}
