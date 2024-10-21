import { Theremin } from "./Theremin.js";


async function comienzo() {
  try {

    // Solicita el acceso a la cámara. El objeto devuelto facilita acceder al flujo (fotogramas) 
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
 
    // Crea un elemento video (no se incluye en el DOM) cuya fuente procede de mediaStream
    const video = document.createElement("video");
    video.srcObject = mediaStream;


    
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#events
    // Hay varios eventos asociados al elemento video    
    //   loadeddata se dispara cuando hay sufientes fotogramas para comenzar la reprodución aunque no 
    //               se asegura que pueden existir interrupciones

    video.addEventListener("loadeddata", () => {
      // Comienza la reproducción
      video.play();     
      
      // Ajustamos el tamaño del canvas y el video para que la proyección del video en el canvas sea proporcionada (no sea deforme)    
      const canvasApp = document.getElementById("canvasApp");
      canvasApp.width = video.videoWidth;
      canvasApp.height = video.videoHeight;
   
      new Theremin(canvasApp,video)
    })
        
    
    
  } catch (err) {
    // Manejo de errores, como problemas de acceso  a la cámara
    alert(err);
  }
}

comienzo()