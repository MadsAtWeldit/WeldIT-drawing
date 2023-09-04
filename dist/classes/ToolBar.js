import { excludeNullishProps } from "../utils/common.js";
//All possible tools
export var ToolTypes;
(function (ToolTypes) {
    ToolTypes["PENCIL"] = "PENCIL";
    ToolTypes["ERASER"] = "ERASER";
    ToolTypes["COLOR_PICKER"] = "COLOR";
    ToolTypes["LINE_WIDTH_PICKER"] = "WIDTH";
    ToolTypes["CLEAR_CANVAS"] = "CLEARCANVAS";
    ToolTypes["MOVE_AND_RESIZE"] = "MOVEANDRESIZE";
    ToolTypes["UNDO"] = "UNDO";
    ToolTypes["TEXT"] = "TEXT";
    ToolTypes["LINE"] = "LINE";
    ToolTypes["RECTANGLE"] = "RECTANGLE";
})(ToolTypes || (ToolTypes = {}));
export class ToolBar {
    toolBar;
    //The current active tool
    activeTool;
    //The current targeted tool
    targetTool;
    tools = {
        activatable: {
            pencil: document.getElementById("pencil"),
            eraser: document.getElementById("eraser"),
            moveAndResize: document.getElementById("mv-rz"),
            text: document.getElementById("text"),
            line: document.getElementById("line"),
        },
        modifiers: {
            color: document.getElementById("color"),
            width: document.getElementById("lineWidth"),
        },
        canvas: {
            clear: document.getElementById("clear"),
            undo: document.getElementById("undo"),
        }
    };
    constructor(toolBar, tools) {
        this.toolBar = toolBar;
        //Loop through each tool and assign it to correct props 
        tools.forEach((tool) => {
            this.assignCorrectly(tool, this.tools.activatable);
            this.assignCorrectly(tool, this.tools.modifiers);
            this.assignCorrectly(tool, this.tools.canvas);
        });
        //Set a default active tool
        this.defaultActive();
    }
    //Find the first tool and set that as active
    defaultActive() {
        const activatable = excludeNullishProps(this.tools.activatable);
        const defaultActive = Object.entries(activatable).find(tool => tool);
        if (!defaultActive || Object.keys(activatable).length <= 0)
            return;
        this.active = { name: defaultActive[0], element: defaultActive[1] };
    }
    //Assigns tools passed to correct property
    assignCorrectly = (tool, prop) => {
        Object.keys(prop).map((key) => {
            if (tool.type === key.toUpperCase()) {
                const index = key;
                if (!tool.className && !tool.id)
                    throw new Error(`Please provide a class or id for element: ${tool.type}`);
                if (tool.className) {
                    const el = document.querySelector("." + tool.className);
                    if (el) {
                        prop[index] = el;
                    }
                    else {
                        throw new Error(`Could not find element with className: ${tool.className}`);
                    }
                }
                if (tool.id) {
                    const el = document.getElementById(tool.id);
                    if (el) {
                        prop[index] = el;
                    }
                    else {
                        throw new Error(`Could not find element with id: ${tool.id}`);
                    }
                }
            }
        });
    };
    //Runs when click event happens on the toolbar
    handleEvent = (e) => {
        //Check if the target is an Element
        if (e.target instanceof Element) {
            const target = e.target; //We know it's an element
            const targetTool = this.findTargetTool(target, this.tools); //Find target tool
            if (!targetTool)
                return; //Simply return
            //IF targetTool is activatable then set it as active aswell
            targetTool.name in this.tools.activatable && (this.active = targetTool);
            this.target = targetTool;
        }
    };
    findTargetTool = (target, tools) => {
        let tool = null;
        //Loop each category of tools and try to find the targeted element
        Object.keys(tools).forEach((category) => {
            const currentToolCategory = tools[category];
            const targetTool = Object.entries(currentToolCategory).find(([, element]) => element === target);
            targetTool && (tool = { name: targetTool[0], element: targetTool[1] });
        });
        return tool;
    };
    set target(tool) {
        this.targetTool = tool;
    }
    get target() {
        return this.targetTool;
    }
    //Method for setting the active tool
    set active(tool) {
        //Remove active class before applying it to a new one
        if (this.activeTool)
            this.activeTool.element.classList.remove("active");
        this.activeTool = tool;
        //Add active class for selectedTool
        this.activeTool.element.classList.add("active");
    }
    //Return the selected tool
    get active() {
        return this.activeTool;
    }
}
//# sourceMappingURL=ToolBar.js.map