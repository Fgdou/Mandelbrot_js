class Mandelbrot{
	constructor(obj){
		this.obj = obj;
		obj.width = obj.parentNode.offsetWidth
		obj.height = obj.parentNode.offsetHeight
		this.ctx = obj.getContext('2d');
		this.nMax = 300;
		this.lastMandelbrot = null
		this.pos = {
			x: 0,
			y: 0
		}
		this.obj.addEventListener("pointerdown", (e)=>{this.enterSquare(e)})
		this.obj.addEventListener("pointermove", (e)=>{this.moveSquare(e)})
		this.obj.addEventListener("pointerup", (e)=>{this.leaveSquare(e)})
		this.obj.addEventListener("pointerleave", (e)=>{this.leaveSquare(e)})
		this.obj.addEventListener("wheel", (e)=>{this.scroll(e)})
		this.obj.addEventListener("contextmenu", (e)=>{e.preventDefault(); e.stopPropagation(); return false;})
		this.selectRect = {
			enabled: false,
			start: {x: 0, y: 0},
			end: {x: 0, y: 0}
		}
		this.reset()
		this.createResetButton()
	}

	set height(height){
		this.obj.height = height;
	}
	set width(width){
		this.obj.width = width;
	}
	get height(){
		return this.obj.height;
	}
	get width(){
		return this.obj.width;
	}
	
	createResetButton(){
		let btn = document.createElement("button")
		btn.textContent = "Reset"
		btn.className = "mandelbrot-reset"
		btn.addEventListener("click", (e)=>{
			e.preventDefault()
			this.reset()
		})
		
		this.obj.parentNode.appendChild(btn)
	}

	clear(){
		this.ctx.fillStyle = '#000000';
		this.ctx.fillRect(0, 0, this.width, this.height);
	}
	reset(){
		this.pos = {x: 0, y: 0};
		this.scale = 1/this.width*2;
		this.draw();
	}
	draw(){
		let h = this.height;
		let w = this.width;
		let n, pos, y;

		let img = this.ctx.createImageData(w, h);
		for(let i=0; i<h; i++){
			y = i;
			for(let j=0; j<w; j++){
				pos = this.pixelToWorld({x: j, y: i})
				n = this.mandelbrot(pos.x, pos.y)*255/this.nMax;

				img.data[(j+i*w)*4 + 0] = n;
				img.data[(j+i*w)*4 + 1] = n;
				img.data[(j+i*w)*4 + 2] = n;
				img.data[(j+i*w)*4 + 3] = 255;
			}
		}

		this.ctx.putImageData(img, 0, 0);
		this.lastMandelbrot = img;
	}
	mandelbrot(x, y){
		let n = 0;
		let a, b;
		let x0 = x;
		let y0 = y;
		
		while(x*x+y*y < 4 && n < this.nMax){
			b = x;
			a = y;

			y = 2*a*b + y0;
			x = b*b-a*a + x0;
			n++;
		}

		return n;
	}
	pixelToWorld(pos){
		return {
			x: (pos.x-this.width/2)*this.scale*2+this.pos.x,
			y: (pos.y-this.height/2)*this.scale*2+this.pos.y,
		}
	}
	worldToPixel(pos){
		return {
			x: (pos.x-this.pos.x)/this.scale+this.width/2,
			y: (pos.y-this.pos.y)/this.scale+this.height/2
		}
	}

	enterSquare(e){
		if(e.button == 0){
			this.selectRect.start.x = e.clientX - this.obj.offsetLeft;
			this.selectRect.start.y = e.clientY - this.obj.offsetTop;
			this.selectRect.enabled = true;
		}else{
			this.reset()
		}
	}
	moveSquare(e){
		if(this.selectRect.enabled == false)
			return;
		this.selectRect.end.x = e.clientX - this.obj.offsetLeft;
		this.selectRect.end.y = e.clientY - this.obj.offsetTop;

		this.ctx.lineWidth = 4
		this.ctx.strokeStyle = 'rgba(255, 255, 255, 255)';
		this.ctx.putImageData(this.lastMandelbrot, 0, 0);
		this.ctx.strokeRect(this.selectRect.start.x, this.selectRect.start.y, this.selectRect.end.x - this.selectRect.start.x, (this.selectRect.end.x - this.selectRect.start.x)/this.width*this.height)
	}
	leaveSquare(e){
		if(this.selectRect.enabled == false)
			return;
		this.selectRect.end.x = e.clientX - this.obj.offsetLeft;
		this.selectRect.end.y = e.clientY - this.obj.offsetTop;
		this.selectRect.enabled = false;

		//TODO zoom
		let pos = this.pixelToWorld(this.selectRect.start)
		let pos2 = this.pixelToWorld(this.selectRect.end)

		this.pos = {
			x: (pos2.x+pos.x)/2,
			y: (pos2.y+pos.y)/2
		}
		this.scale = (this.selectRect.end.x - this.selectRect.start.x)/this.width*this.scale
		this.draw()
	}
	scroll(e){
		console.log("ok")
		if(e.deltaY < 0)
			this.nMax *= 1.5;
		else
			this.nMax /= 1.5;
		if(this.nMax > 1000)
			this.nMax = 1000
		if(this.nMax < 1)
			this.nMax = 1
		console.log(this.nMax)
		this.draw();
	}
}

window.addEventListener("DOMContentLoaded", ()=>{
	mandel = new Mandelbrot(document.getElementById("mandelbrot"));
})