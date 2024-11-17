import { semejanzaCromática, puntoCentral } from "./utils.js";
import { Obstacle } from "./obstacle.js";

export class Theremin {
  constructor(canvas, video, dino, bird, tuna, timer) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");
    this.dinoImage = dino;
    this.birdImage = bird;
    this.tunaImage = tuna;
    this.startTime = timer;
    this.elapsedTime = 0;

    this.colorDelMarcador = { r: 255, g: 0, b: 0 };
    this.whiteDot = { x: canvas.width / 2, y: canvas.height / 2 };
    this.umbral = 20; // Umbral de distancia para el punto objetivo

    // Propiedades del cuadrado saltarín
    this.dino = {
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
    this.#drawVideo();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(
      imageData,
      this.colorDelMarcador
    );

    // Dibujar el punto blanco en el canvas
    this.#drawWhiteDot();

    // Dibujar y mover obstáculos
    this.#drawObstacles();

    if (puntos.length > 0) {
      const redDot = puntoCentral(puntos);

      // Verificar si el marcador está cerca del punto objetivo
      const distanceBetweenRedAndWhiteDot = Math.sqrt(
        (redDot.x - this.whiteDot.x) ** 2 + (redDot.y - this.whiteDot.y) ** 2
      );

      if (distanceBetweenRedAndWhiteDot < this.umbral) {
        this.dino.isJumping = true;
      } else {
        this.dino.isJumping = false;
      }

      // Dibujar el punto rojo en el canvas
      this.#drawRedDot(redDot);
    }

    // Actualizar la posición del dino saltarín
    if (this.dino.isJumping) {
      this.dino.y = this.groundPosition - this.jumpHeight;
    } else {
      this.dino.y = this.groundPosition;
    }

    // Dibujar el dino saltarín

    ctx.drawImage(
      this.dinoImage,
      this.dino.x,
      this.dino.y,
      this.dino.size,
      this.dino.size
    );

    if (
      (Math.abs(this.groundObstacle.getPositionX() - this.dino.x) <= 15 &&
        this.dino.isJumping === false) ||
      (Math.abs(this.skyObstacle.getPositionX() - this.dino.x) <= 15 &&
        this.dino.isJumping === true)
    ) {
      alert("perdiste!! Tu tiempo fue de: " + this.elapsedTime + " segundos");
      this.groundObstacle.reset();
      this.#stopTimer();
      this.skyObstacle.reset(this.obstacleDifference);
    }

    this.#updateTimer();
    requestAnimationFrame(this.#animate.bind(this));
  }

  #drawWhiteDot() {
    const { ctx } = this;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.whiteDot.x, this.whiteDot.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  #drawRedDot(redDot) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(redDot.x, redDot.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  #drawVideo() {
    const { ctx, canvas, video } = this;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  #drawObstacles() {
    const { ctx } = this;

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

    this.groundObstacle.draw(ctx, this.tunaImage);
    this.groundObstacle.move();

    this.skyObstacle.draw(ctx, this.birdImage);
    this.skyObstacle.move();
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

  #updateTimer() {
    const { ctx, canvas } = this;
    this.elapsedTime = (Date.now() - this.startTime) / 1000;

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`Time: ${this.elapsedTime} seconds`, 20, 50);
  }

  #stopTimer() {
    this.startTime = Date.now();
  }
}
