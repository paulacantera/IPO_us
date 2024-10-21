import { semejanzaCromática, puntoCentral } from "./utils.js";

export class Theremin {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");

    this.colorDelMarcador = { r: 0, g: 0, b: 255 };

    this.#animate();
  }

  #animate() {
    //desconstruye el evento js
    const { ctx, canvas, video } = this;

    //cada vez q se ejecuta la funcion, pone el fotograma en el canvas
    // Localiza en el canvas los puntos cuyo color se asemeja al color del marcador
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //despues de tener el canvas en el fotograma podes tener el mapa de bits
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(imageData, this.colorDelMarcador);
    // console.log("Puntos detectados:", puntos);

    // Si detecta el marcador
    if (puntos.length > 0) {
      // Calcula un punto central representativo de todos los puntos localizados
      const centro = puntoCentral(puntos);

      // Dibujo un punto en el centro
      ctx.beginPath();
      ctx.fillStyle = "black"; // para el punto (es un path)
      ctx.arc(centro.x, centro.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    // OJO: La función bind() se necesita para solvnetar el problema de "pérdida" del objeto this
    // El objeto this de un método callback en una clase no es el mismo this de la clase
    // https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    requestAnimationFrame(this.#animate.bind(this));
  }

  #obtenPuntosSegunColor(imageData, color) {
    const puntos = [];

    // imageDatata almacena en .data el mapa de bits de la imagen mediante un array de números
    // organizados en cuatro valores RGBA (pixel). Los pixeles figuran consecutivamente
    // según su aparición según el orden primero fila y después columna.

    for (let i = 0; i < imageData.data.length; i += 4) {
      // Se recupera el pixel como combinación de tres valores RGB (el componente A es ignorado)
      const pixel = {
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2],
      };

      // Se comprueba si el pixel es semejante al color deseado
      if (semejanzaCromática(pixel, color)) {
        // Calcula la localización punto (x,y) del pixel en el mapa de bits
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
