import { semejanzaCromática, puntoCentral } from "./utils.js";
import { Obstacle } from "./obstacle.js";

export class Theremin {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");

    this.colorDelMarcador = { r: 0, g: 0, b: 255 };
    this.objetivo = { x: canvas.width / 2, y: canvas.height / 2 };
    this.umbral = 20; //umbral de distancia para el punto objetivo
    this.jumpHeight = 10; //altura de cada "salto"
    this.currentTop = 5; //posición inicial del cuadrado
    this.streakCounter = 0; //contador de tiempo en el objetivo

    this.jumpingSquare = document.getElementById("jumpingSquare"); // Cuadrado en el DOM

    this.obstacle = new Obstacle(this.canvas);

    this.#animate();
  }

  #animate() {
    const { ctx, canvas, video } = this;

    // Dibujar el video en el canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(
      imageData,
      this.colorDelMarcador
    );

    // Dibujar el punto objetivo en el canvas
    ctx.beginPath();
    ctx.fillStyle = "white"; // Color del punto objetivo
    ctx.arc(
      this.objetivo.x,
      this.objetivo.y,
      10 /*radio del circulo*/,
      0,
      Math.PI * 2
    ); //para dibujar el circulo
    ctx.fill();
    ctx.closePath();

    // Dibujar el obstáculo
    this.obstacle.draw(ctx);

    if (puntos.length > 0) {
      const centro = puntoCentral(puntos);

      // Verificar si el marcador está cerca del punto objetivo
      const distancia = Math.sqrt(
        (centro.x - this.objetivo.x) ** 2 + (centro.y - this.objetivo.y) ** 2
      ); //dist entre el punto marcador y el objetivo

      if (distancia < this.umbral) {
        const square = document.getElementById("square");
        // Mover el cuadrado a la posición superior
        square.classList.add("arriba");
      } else {
        // Mover el cuadrado a la posición inferior
        const square = document.getElementById("square");
        square.classList.remove("arriba");
      }

      // Dibujar el marcador de rojo
      ctx.beginPath();
      ctx.fillStyle = "red";
      ctx.arc(centro.x, centro.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
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
