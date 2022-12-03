import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import Head from 'next/head';
import Loader from './components/Loader';
import { drawEmoji } from './utils/drawEmoji';
import './styles/home.module.css';

const Home = () => {

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
    const timerConditions = (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    );

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (timerConditions) {
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
    <>
      <div className='container'>
        <Head>
          <title>
            Face Emotes
          </title>
          <meta name='description' content='Mask Emoji to your face' />
          <meta property='og:image' key='ogImage' content='/emojis/happy.png' />
          <link rel='icon' href='/emojis/happy.png' />
        </Head>
        <header className='header'>
          <h1 className='title'>
            Face Emotes
          </h1>
        </header>
        <main className='main'>
          <Webcam audio={false} ref={webcamRef} className='video' />
          <canvas ref={canvasRef} className='video' />
        </main>
      </div>
      {!isLoaded && <Loader />}
    </>
  );
}

export default Home;
