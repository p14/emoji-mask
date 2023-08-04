import { FaceDetection, FaceExpressions } from 'face-api.js';

export type DetectionsWithExpressions = {
    detection: FaceDetection
    expressions: FaceExpressions
};
