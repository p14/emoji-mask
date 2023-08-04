import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import Loader from './components/loader';
import { drawEmoji } from './utils/drawEmoji';
import './styles/app.css';

const App: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);

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

    const renderWebcam = () => (
        <>
            <Webcam audio={false} ref={webcamRef} className={!isLoaded ? 'video' : 'video frame'} />
            <canvas ref={canvasRef} className='video' />
        </>
    )

    useEffect(() => {
        if (webcamEnabled) {
            setIsLoaded(false);
            faceDetectHandler();
        }
    }, [webcamEnabled]);

    return (
        <div className='container'>
            <header className='header'>
                <h1>EmojiMask</h1>
                &nbsp;
                <label className='switch'>
                    <input type='checkbox' checked={webcamEnabled} onClick={() => setWebcamEnabled((previous) => !previous)} />
                    <span className='slider' />
                </label>
            </header>

            {!isLoaded && webcamEnabled && <Loader />}

            <main className='main'>
                {webcamEnabled && renderWebcam()}
            </main>

            <footer>
                <p>
                    Created by Joseph Perez - <a href='https://www.github.com/p14/emoji-mask' target='_blank' rel='noreferrer'>Source Code</a>
                </p>
            </footer>
        </div>
    );
}

export default App;
