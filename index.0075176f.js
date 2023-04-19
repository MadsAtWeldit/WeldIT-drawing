"use strict";const toolBar=document.getElementById("toolbar");var DrawingElementType;!function(e){e.controller="controller",e.pencil="pencil",e.eraser="eraser",e.colorPicker="colorPicker",e.lineWidth="lineWidth",e.clearCanvas="clearCanvas"}(DrawingElementType||(DrawingElementType={}));class DrawingCanvas{constructor(e,t){this.changeHandler=e=>{let t=document.getElementById("color"),i=document.getElementById("lineWidth");const s=e.target,n=this.context;this.colorPicker&&(t=this.colorPicker),this.pencilWidthPicker&&(i=this.pencilWidthPicker),s.id===t.id&&(n.strokeStyle=s.value),s.id===i.id&&(n.lineWidth=Number(s.value))},this.clickHandler=e=>{let t=document.getElementById("pen"),i=document.getElementById("eraser"),s=document.getElementById("clear");const n=this.context,c=e.target;this.pencil&&(t=this.pencil),this.eraser&&(i=this.eraser),this.clearCanvas&&(s=this.clearCanvas),c.id===s.id&&n.clearRect(0,0,this.canvas.width,this.canvas.height),c.id===t.id&&(console.log(c.id),null==i||i.classList.remove("active"),this.shouldErase=!1,this.shouldDraw=!0,null==t||t.classList.add("active")),c.id===i.id&&(null==t||t.classList.remove("active"),this.shouldDraw=!1,this.shouldErase=!0,null==i||i.classList.add("active"))},this.start=e=>{const t=e.touches?e.touches[0]:e;this.shouldErase?(this.context.globalCompositeOperation="destination-out",this.isErasing=!0,this.isDrawing=!1):(this.context.globalCompositeOperation="source-over",this.isDrawing=!0,this.isErasing=!1);t.clientX,this.canvas.offsetLeft,t.clientY,this.canvas.offsetTop},this.stop=()=>{this.isDrawing=!1,this.isErasing=!1,this.context.stroke(),this.context.beginPath()},this.draw=e=>{if(!this.isDrawing&&!this.isErasing)return;const t=e.touches?e.touches[0]:e;this.context.lineWidth=this.lineWidth,this.context.lineCap="round",this.context.lineTo(t.clientX-this.canvas.offsetLeft,t.clientY-this.canvas.offsetTop),this.context.stroke()};const i=document.getElementById(e),s=i.getContext("2d");(null==t?void 0:t.elements)&&t.elements.forEach((e=>{switch(e.type){case"controller":if(e.className){const t=document.querySelector(e.className);this.controller=t}if(e.id){const t=document.getElementById(e.id);this.controller=t}if(e.className&&e.id){const t=document.getElementById(e.id);this.controller=t}break;case"pencil":if(e.className){const t=document.querySelector(e.className);this.pencil=t}if(e.id){const t=document.getElementById(e.id);this.pencil=t}if(e.className&&e.id){const t=document.getElementById(e.id);this.pencil=t}break;case"eraser":if(e.className){const t=document.querySelector(e.className);this.eraser=t}if(e.id){const t=document.getElementById(e.id);this.eraser=t}if(e.className&&e.id){const t=document.getElementById(e.id);this.eraser=t}break;case"colorPicker":if(e.className){const t=document.querySelector(e.className);this.colorPicker=t}if(e.id){const t=document.getElementById(e.id);this.colorPicker=t}if(e.className&&e.id){const t=document.getElementById(e.id);this.colorPicker=t}break;case"lineWidth":if(e.className){const t=document.querySelector(e.className);this.pencilWidthPicker=t}if(e.id){const t=document.getElementById(e.id);this.pencilWidthPicker=t}if(e.className&&e.id){const t=document.getElementById(e.id);this.pencilWidthPicker=t}break;case"clearCanvas":if(e.className){const t=document.querySelector(e.className);this.clearCanvas=t}if(e.id){const t=document.getElementById(e.id);this.clearCanvas=t}if(e.className&&e.id){const t=document.getElementById(e.id);this.clearCanvas=t}}})),(null==t?void 0:t.width)?i.width=t.width:i.width=window.innerWidth-i.offsetLeft,(null==t?void 0:t.height)?i.height=t.height:i.height=window.innerHeight-i.offsetTop,this.canvas=i,this.context=s,this.context.lineWidth=5,this.context.strokeStyle="black",this.listen()}listen(){const e=this.canvas;let t=document.getElementById("toolbar");this.controller&&(t=this.controller),e.addEventListener("mousedown",this.start),e.addEventListener("mouseup",this.stop),e.addEventListener("mousemove",this.draw),e.addEventListener("touchstart",this.start),e.addEventListener("touchend",this.stop),e.addEventListener("touchmove",this.draw),t.addEventListener("change",this.changeHandler),t.addEventListener("click",this.clickHandler)}log(){return console.log(this.canvas)}}new DrawingCanvas("drawing-board");
//# sourceMappingURL=index.0075176f.js.map
