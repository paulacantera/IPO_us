import { semejanzaCromática, puntoCentral } from "./utils.js";
import { Obstacle } from "./obstacle.js";

export class Theremin {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");

    this.colorDelMarcador = { r: 255, g: 0, b: 0 };
    this.whiteDot = { x: canvas.width / 2, y: canvas.height / 2 };
    this.umbral = 20; // Umbral de distancia para el punto objetivo

    // Propiedades del cuadrado saltarín
    this.blueSquare = {
      x: 50,
      y: canvas.height - 30,
      size: 20,
      isJumping: false,
    };
    this.jumpHeight = 40;
    this.groundPosition = canvas.height - 30;

    // Inicialización de los obstáculos
    this.groundObstacle = new Obstacle(
      this.canvas,
      canvas.width,
      canvas.height - 30
    );

    this.obstacleDifference = 160;
    this.skyObstacle = new Obstacle(
      this.canvas,
      canvas.width + this.obstacleDifference,
      410
    );

    this.#animate();
  }

  #animate() {
    const { ctx, canvas, video } = this;

    // Limpiar el canvas en cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el video en el canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(
      imageData,
      this.colorDelMarcador
    );

    // Dibujar el punto blanco en el canvas
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.whiteDot.x, this.whiteDot.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Dibujar y mover obstáculos
    this.groundObstacle.draw(ctx);
    this.groundObstacle.move();

    this.skyObstacle.draw(ctx);
    this.skyObstacle.move();

    //Hacer que no coincidan los obstaculos
    if (
      Math.abs(
        this.skyObstacle.getPositionX() - this.groundObstacle.getPositionX()
      ) <= 80
    ) {
      if (
        this.skyObstacle.getPositionX() < this.groundObstacle.getPositionX()
      ) {
        this.skyObstacle.moveInX(160);
      } else {
        this.groundObstacle.moveInX(160);
      }
    }

    if (puntos.length > 0) {
      const redDot = puntoCentral(puntos);

      // Verificar si el marcador está cerca del punto objetivo
      const distanceBetweenRedAndWhiteDot = Math.sqrt(
        (redDot.x - this.whiteDot.x) ** 2 + (redDot.y - this.whiteDot.y) ** 2
      );

      if (distanceBetweenRedAndWhiteDot < this.umbral) {
        this.blueSquare.isJumping = true;
      } else {
        this.blueSquare.isJumping = false;
      }

      // Dibujar el marcador de color detectado
      ctx.beginPath();
      ctx.fillStyle = "red";
      ctx.arc(redDot.x, redDot.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    // Actualizar la posición del cuadrado saltarín
    if (this.blueSquare.isJumping) {
      this.blueSquare.y = this.groundPosition - this.jumpHeight;
    } else {
      this.blueSquare.y = this.groundPosition;
    }

    // Dibujar el cuadrado saltarín
    ctx.fillStyle = "blue";
    ctx.fillRect(
      this.blueSquare.x,
      this.blueSquare.y,
      this.blueSquare.size,
      this.blueSquare.size
    );

    if (
      (Math.abs(this.groundObstacle.getPositionX() - this.blueSquare.x) <= 15 &&
        this.blueSquare.isJumping === false) ||
      (Math.abs(this.skyObstacle.getPositionX() - this.blueSquare.x) <= 15 &&
        this.blueSquare.isJumping === true)
    ) {
      alert("perdiste!!");
      this.groundObstacle.reset();
      this.skyObstacle.reset(this.obstacleDifference);
    }

    requestAnimationFrame(this.#animate.bind(this));
  }

  #obtenPuntosSegunColor(imageData, color) {
    const puntos = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixel = {
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2],
      };

      if (semejanzaCromática(pixel, color)) {
        const pixelIndex = i / 4;
        const localizacionPixel = {
          x: pixelIndex % imageData.width,
          y: Math.floor(pixelIndex / imageData.width),
        };

        puntos.push(localizacionPixel);
      }
    }
    return puntos;
  }
}
