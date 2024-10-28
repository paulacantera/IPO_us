export class Obstacle {
  constructor(canvas, yPosition, speed = 3, width = 20, height = 20) {
    this.canvas = canvas;
    this.x = canvas.width; // Empieza desde el borde derecho
    this.y = yPosition; // Posición y determinada en el constructor
    this.speed = speed; // Velocidad del obstáculo
    this.width = width; // Ancho del obstáculo
    this.height = height; // Alto del obstáculo
  }

  move() {
    this.x -= this.speed; // Mueve el obstáculo hacia la izquierda
    if (this.x + this.width <= 0) { // Cuando el obstáculo sale del canvas
      this.x = this.canvas.width; // Lo reinicia en el borde derecho
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height); // Dibujar un cuadrado
    ctx.closePath();
  }
}
