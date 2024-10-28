export class Obstacle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = canvas.width; // Empieza desde el borde derecho
    this.y = canvas.height - 20; // Altura fija en la parte inferior del canvas
    this.speed = 3; // Velocidad del obstáculo
    this.width = 20; // Ancho del obstáculo
    this.height = 20; // Alto del obstáculo
  }

  move() {
    this.x -= this.speed; // Mueve el obstáculo hacia la izquierda
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2); //hay que cambiarlo por un cuadrado
    ctx.fill();
    ctx.closePath();
  }
}
