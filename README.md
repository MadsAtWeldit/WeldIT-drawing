# WeldIT Drawing App Demo :pencil2:

###### This app is made to be used in the CMS of WeldIT

https://github.com/MadsAtWeldit/WeldIT-drawing/assets/127091473/813c774e-e497-4247-9db3-3f89ac6c0f3b


> This is just to show the functionality. I have not been assigned the task to make this look good. I'll leave that up to the css nerds :stuck_out_tongue_closed_eyes:

----------
## About
This is a drawing **demo** app using HTML-canvas running in the browser, written in Typescript with as little dependencies as possible. It's not meant to be a full production version, only a.. if I might say so myself a solid foundation to build upon.

This is something I have been working on for the last few months during my internship for [WeldIT](https://www.weldit.no/). So please don't be too harsh as I have only been doing development for less than a year and this is also my first "big" project in Typescript/Javascript :blush:!. 



#### How did I start making this?
I started off making this knowing almost nothing about HTML-canvas and using Typescript to draw different strokes and shapes. So I kind of just learned it as I went. Starting off with very basic stuff such as drawing a simple line by passing in hardcoded values and changing color of said line and then gradually made things more advanced. Did many refactors along the way and learned alot of things about what you can do with Typescript and HTML-canvas. Event though I enjoy doing backend stuff more this was still a nice thing to learn. So it has definitely been an experience that I will take with me further down the road.

#### Things that were challenging but also rewarding about this project
So obviously one of the challenges I faced was learning HTML-canvas from scratch while coding such a big application (for me atleast :smirk:). But that wasn't the biggest challenge. The biggest challenge was having a balance between this app being dynamic, readable, typesafe and scalable. Most of the challenges I faced was the Typescript part as it's being very strict and I refused to take the easy way and cast things to any as that would just defeat the whole purpose of using it in the first place. And it seems that I made the right choice as it helped alot during the development process with not needing to deal with errors that come up for no apparent reason.

I learned a few things to-do and not-to-do and will continue to when you guys start roasting how bad my code is :sweat_smile: /s.

#### Some of the things I learned
- How to use the Canvas API to draw graphics via Typescript
- How to use Canvas API interfaces such as Path2D and CanvasRenderingContext2D
- How to use the MouseEvent interface and it's props to get information about the user's pointing device
- How to use the TouchEvent interface for determining whether or not the user is touching the screen
- How to use the data from event's to modify the graphics drawn on the canvas
- How to refactor Typescript code into more generic functions


## Features

### What this application includes as of now
- [x] **Pencil** for free-drawing
- [x] **Text** tool for drawing text
- [x] **Eraser** for erasing drawn shapes
- [x] **Line** tool for drawing straight lines
- [x] **Selection** tool for selection and or moving/resizing drawn shapes
- [x] **ColorPicker** for changing color of freehand strokes
- [x] **LinewidthPicker** for changing width of freehand strokes
- [x] **Clear** tool for resetting canvas
- [x] **Undo** tool for undoing previous actions applied to the canvas


### Things that can be implemented in the future if needed
> These are just some of the features that can be implemented, but really the possibilities are almost endless if enough time and effort is spent.
- [ ] **Drag and drop image upload** Add ability to drag and drop an image for upload and then saving after drawing on uploaded image.
- [ ] **More shapes** One of the things I would like to implement is the ability to draw more shapes such as rectangles and circles.
- [ ] **Redo tool** Another thing that can also be implemented is the abilty to redo actions done on the canvas.
- [ ] **Extend color and linewidth pickers** Extend the functionality of the existing picker tools to also apply to all other shapes instead of just freehand strokes.
- [ ] **Add breakpoints to selection of line shape** So when you draw a line using the line tool add the ability to modify it by adding an extra point in the middle of the shape selection highlight.
- [ ] **Dashed lines** When you select a shape add ability to select between normal and dashed.
- [ ] **Drag and drop icons** Add a menu to the toolbar where you can drag and drop icons.
- [ ] **PDF drawing** Add ability to draw on a PDF. (A separate program that extends this)

----------
### Things to note
*This is only the foundation for the logic moving forward with this application. It would have been extremely hard to implement everything within the period of time I've had and with my level of experience. I expect it to go alot faster when an actual team continues to work on it instead of just little me :grimacing:. Here are some things I would do before pushing this to production:*

1. **Find the best way to structure the code**

Since the code is written in Typescript without any frameworks, I found the best way to structure my code was by using a class as this (no pun intended) can be easily looked at like a React or Vue component.

I don't know what framework will be used, but to my knowledge it will be Vue.js and Laravel.php. So try to think of the class as a big component and then split some of that logic into smaller child components. Or simply instantiate the class inside the Vue component. Up to you how you guys wanna do it.

----------
2. **Drag and drop image**

The drag and drop image function should be implemented before pushing this to production.

----------
3. **Better CSS**

Write some better CSS as the currently written styles are simply ugly.

----------
3. **Download**

Download button should be added so the user can download the drawing.

----------
4. **Server requests and storage**

When you draw on the canvas and a user wants to save the drawing, they will then send a POST request with the drawing object to be saved for their user. And when they log back into WeldIT to use the drawing app, they will fetch the last saved drawing, and also maybe add an option to load previous drawings. 

Look into the most efficient ways to send and store the drawing data. 

So for example an alternative to the raw object is to use something like the CanvasRenderingContext2D: getImageData() method to save the current drawing and then send that via POST instead.

----------
5. **Testing**

Obviously you need to test every aspect of this app and make sure there are as little bugs (preferably none) as possible. Since I've been working solo on this project so far I might have missed a few or forgotten to fix them.

----------
6. **Use Typescript (optional)**

Since this is written in Typescript I recommend using that, but of course that is also up to you. So if not then just look at the compiled code and modify that. I have already pitched the idea to add Typescript support to the WeldIT repo.

----------

7. **Ask questions (optional)**

If you have any questions about anything, don't be afraid to ask. I want this to be a good addition to WeldIT so don't hesitate to contact me :smiley:. You can send me a mail on: mads@weldit.no, or on Slack and Teams.

----------
##### So now on to some refactors that I haven't had the time to implement yet, these are just a few examples to make the code better and more readable:

###### Taken from the mouseMoveHandler switch case on line 573
```typescript
selectionPosition === "middle"
  ? (this.canvas.style.cursor = "move")
  : selectionPosition === "top-left" || selectionPosition === "bottom-right"
    ? (this.canvas.style.cursor = "nwse-resize")
    : (this.canvas.style.cursor = "nesw-resize");
```
> Instead of repeating this you could maybe move it to a function instead.


###### Taken from the mouseMoveHandler switch case on line 639
```typescript
  selectedDrawing.coords.x1 += dx;
  selectedDrawing.coords.y1 += dy;
  selectedDrawing.coords.x2 += dx;
  selectedDrawing.coords.y2 += dy;

  this.startX = mouseX;
  this.startY = mouseY;
```
> This code is repeating aswell and might be turned into something like this to make it more reusable:
```typescript 
for (const [k,v] of Object.entries(selectedDrawing.coords)){
    k.includes("x") ? v += dx : v += dy;
}
```
So yeah there are some things that can be better that I am aware of but haven't had the time to do yet. Those are just a few examples to show how easily it can be better.

## Usage
First clone the repo
`git clone --depth 1 https://github.com/MadsAtWeldit/WeldIT-drawing.git`

Then run this command
`cd WeldIT-drawing && npm i && npx tsc && live-server`

And that's it. The application should now be running in your browser and you are free to experiment and test things out on your local copy. 

Also feel free to contribute if you have any good ideas!. If you don't know how to contribute then please refer to [this](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors).
