import { semejanzaCromática, puntoCentral } from "./utils.js";

export class Theremin {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");

    this.colorDelMarcador = { r: 0, g: 255, b: 0 };

    const audioCtx = new AudioContext();
    this.osc = audioCtx.createOscillator();
    this.osc.connect(audioCtx.destination);
    this.freq = 0;
    this.osc.frequency.value = this.freq;
    this.osc.start();

    this.#animate();
  }

  #animate() {
    const { ctx, canvas, video } = this;

    // Localiza en el canvas los puntos cuyo color se asemeja al color del marcador
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(imageData, this.colorDelMarcador);

    // console.log("Puntos detectados:", puntos);

    if (puntos.length > 0) {
      // Calcula un punto central representativo de todos los puntos localizados
      const centro = puntoCentral(puntos);

      // Asociación de la altura a la que se encuentra el marcador
      // con la frecuencia del sonido que se emitirá
      const p = 1 - centro.y / canvas.height;
      this.freq = 200 + 500 * p;
      this.osc.frequency.value = this.freq;

      // Dibuja una línea horizontal a la altura del centro calculado
      ctx.beginPath();
      ctx.strokeStye = "blue";
      ctx.lineWidth = 5;
      ctx.moveTo(0, centro.y);
      ctx.lineTo(canvas.width, centro.y);
      ctx.stroke();
      ctx.closePath();
    } else {
      // Si no se detecta el marcador, no se emitirá sonido
      this.freq = 0;
      this.osc.frequency.value = this.freq;
    }

    // Acceso a la leyenda para mostrar la por pantalla la frecuencia emitida
    const freqNode = document.getElementById("freq");
    const valorFreq = Math.floor(this.freq);
    freqNode.innerText = valorFreq.toString();

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
