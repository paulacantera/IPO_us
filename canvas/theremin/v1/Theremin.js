import { semejanzaCromática, puntoCentral } from "./utils.js";

export class Theremin {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = canvas.getContext("2d");

    this.colorDelMarcador = { r: 0, g: 0, b: 255 };

    // Definir el punto objetivo fijo en el centro del canvas
    this.objetivo = { x: canvas.width / 2, y: canvas.height / 2 };
    this.umbral = 20; // Umbral de distancia para considerar el objetivo alcanzado

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

    // Dibujar el video en el canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const puntos = this.#obtenPuntosSegunColor(imageData, this.colorDelMarcador);

    // Dibujar el punto objetivo en el canvas
    ctx.beginPath();
    ctx.fillStyle = "white"; // Color del punto objetivo
    ctx.arc(this.objetivo.x, this.objetivo.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    if (puntos.length > 0) {
      const centro = puntoCentral(puntos);

      // Verificar si el marcador está cerca del punto objetivo
      const distancia = Math.sqrt(
        (centro.x - this.objetivo.x) ** 2 + (centro.y - this.objetivo.y) ** 2
      );

      if (distancia < this.umbral) {
        // El usuario ha alcanzado el objetivo
        ctx.fillStyle = "green"; // Cambiar el color del punto objetivo para indicar el éxito
        this.freq = 440; // Emitir un sonido con una frecuencia específica para indicar éxito
        const successMessage = document.getElementById("successMessage");
        successMessage.style.display = "block";
      } else {
        this.freq = 0; // No emitir sonido si no se ha alcanzado el objetivo
        const successMessage = document.getElementById("successMessage");
        successMessage.style.display = "none";
      }
      this.osc.frequency.value = this.freq;

      // Dibujar el marcador del color detectado
      ctx.beginPath();
      ctx.fillStyle = "red";
      ctx.arc(centro.x, centro.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    } else {
      this.freq = 0; // No emitir sonido si no se detecta el marcador
      this.osc.frequency.value = this.freq;
      const successMessage = document.getElementById("successMessage");
      successMessage.style.display = "none";
    }

    const freqNode = document.getElementById("freq");
    const valorFreq = Math.floor(this.freq);
    freqNode.innerText = valorFreq.toString();

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
