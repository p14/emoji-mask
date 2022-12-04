import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import Loader from './components/loader';
import { drawEmoji } from './utils/drawEmoji';
import './styles/app.css';

const App = () => {

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const loadModels = async () => {
    const modelUrl = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.load(modelUrl),
      faceapi.nets.faceExpressionNet.load(modelUrl),
    ]);
  };

  const handleLoadWaiting = async () => {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const conditions = (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        );

        if (conditions) {
          resolve(true);
          clearInterval(timer);
        }
      }, 500);
    });
  };

  const faceDetectHandler = async () => {
    await loadModels();
    await handleLoadWaiting();

    const refConditions = (canvasRef.current && webcamRef.current);

    if (refConditions && webcamRef.current.video) {
      setIsLoaded(true);

      const webcam = webcamRef.current.video;
      webcam.width = webcam.videoWidth;
      webcam.height = webcam.videoHeight;

      const canvas = canvasRef.current;
      canvas.width = webcam.videoWidth;
      canvas.height = webcam.videoHeight;

      const video = webcamRef.current.video;

      const draw = async () => {
        if (video) {
          const detectionsWithExpressions = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions(),
          ).withFaceExpressions();
        
          if (refConditions && detectionsWithExpressions.length) {
            drawEmoji({ detectionsWithExpressions, canvas: canvasRef.current });
          }

          requestAnimationFrame(draw);
        }
      };

      draw();
    }
  };

  useEffect(() => {
    faceDetectHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='container'>
      <header className='header'>
        <h1>
          EmojiFace
        </h1>
      </header>

      {!isLoaded && <Loader />}

      <main className='main'>
        <Webcam audio={false} ref={webcamRef} className={!isLoaded ? 'video' : 'video frame'} />
        <canvas ref={canvasRef} className='video' />
      </main>
    </div>
  );
}

export default App;
