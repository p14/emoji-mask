import { WithFaceExpressions } from 'face-api.js';
import { DetectionsWithExpressions } from '../typings/dependency.typings';

interface DrawEmojiProps {
  detectionsWithExpressions: WithFaceExpressions<DetectionsWithExpressions>[]
  canvas: HTMLCanvasElement
};

export const drawEmoji = async ({ detectionsWithExpressions, canvas }: DrawEmojiProps) => {
  detectionsWithExpressions.forEach((detectionsWithExpression) => {
    const ctx = canvas.getContext('2d');

    if (!ctx) { // base case
      return;
    }

    const Array = Object.entries(detectionsWithExpression.expressions);
    const scoresArray = Array.map((i) => i[1]);
    const expressionsArray = Array.map((i) => i[0]);

    const max = Math.max.apply(null, scoresArray);
    const index = scoresArray.findIndex((score) => score === max);
    const expression = expressionsArray[index];

    const image = document.createElement('img');

    image.onload = () => {
      const width = detectionsWithExpression.detection.box.height * 1.2;
      const height = detectionsWithExpression.detection.box.height * 1.2;
      const x = detectionsWithExpression.detection.box.x - width * 0.1;
      const y = detectionsWithExpression.detection.box.y - height * 0.2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, x, y, width, height);
    };

    image.src = `/emojis/${expression}.png`;
  });
};
