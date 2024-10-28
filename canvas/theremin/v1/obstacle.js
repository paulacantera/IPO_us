class Obstacle {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = canvas.width; // Empieza desde el borde derecho
      this.y = canvas.height - 20; // Altura fija en la parte inferior del canvas
      this.speed = speed || 3; // Velocidad del obstáculo
      this.width = 20; // Ancho del obstáculo
      this.height = 20; // Alto del obstáculo\
    
    }
  
    move() {
      this.x -= this.speed; // Mueve el obstáculo hacia la izquierda
    }
  
    draw(ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  