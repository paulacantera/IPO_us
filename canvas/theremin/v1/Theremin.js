import { semejanzaCromática, puntoCentral } from "./utils.js";
import { Obstacle } from "./obstacle.js";

export class Theremin {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");

    this.colorDelMarcador = { r: 0, g: 0, b: 255 };
    this.objetivo = { x: canvas.width / 2, y: canvas.height / 2 };
    this.umbral = 20; // Umbral de distancia para el punto objetivo

    // Propiedades del cuadrado saltarín
    this.square = { x: 50, y: canvas.height - 30, size: 20, isJumping: false };
    this.jumpHeight = 40; // Altura de salto
    this.groundPosition = canvas.height - 30;

    // Inicialización del obstáculo
    this.obstacle = new Obstacle(this.canvas);

    this.#animate();
  }

  #animate() {
    const { ctx, canvas, video } = this;

    // Limpiar el canvas en cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el video en el canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(imageData, this.colorDelMarcador);

    // Dibujar el punto objetivo en el canvas
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(this.objetivo.x, this.objetivo.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Dibujar el obstáculo y moverlo
    this.obstacle.draw(ctx);
    this.obstacle.move();

    if (puntos.length > 0) {
      const centro = puntoCentral(puntos);

      // Verificar si el marcador está cerca del punto objetivo
      const distancia = Math.sqrt(
        (centro.x - this.objetivo.x) ** 2 + (centro.y - this.objetivo.y) ** 2
      );

      if (distancia < this.umbral) {
        this.square.isJumping = true;
      } else {
        this.square.isJumping = false;
      }

      // Dibujar el marcador de color detectado
      ctx.beginPath();
      ctx.fillStyle = "red";
      ctx.arc(centro.x, centro.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    // Actualizar la posición del cuadrado saltarín
    if (this.square.isJumping) {
      this.square.y = this.groundPosition - this.jumpHeight;
    } else {
      this.square.y = this.groundPosition;
    }

    // Dibujar el cuadrado saltarín
    ctx.fillStyle = "blue";
    ctx.fillRect(this.square.x, this.square.y, this.square.size, this.square.size);

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
