import { useCallback, useEffect, useRef, useState } from "react";
import * as FaceDetectionNS from "@tensorflow-models/face-detection";

export type FaceBoxPct = { x: number; y: number; w: number; h: number };

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFace, setHasFace] = useState(false);
  const [boxPct, setBoxPct] = useState<FaceBoxPct | null>(null);

  const detectorRef = useRef<FaceDetectionNS.FaceDetector | null>(null);
  const modelReadyRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tf = await import("@tensorflow/tfjs-core");
      await import("@tensorflow/tfjs-backend-webgl");
      const faceDetection = await import("@tensorflow-models/face-detection");

      await tf.setBackend("webgl");
      await tf.ready();

      detectorRef.current = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: "tfjs", // use TFJS, no external mediapipe asset needed
          maxFaces: 1,
          modelType: "short", // fastest; switch to 'full' if you need longer-range
        } satisfies FaceDetectionNS.MediaPipeFaceDetectorTfjsModelConfig,
      );

      modelReadyRef.current = true;
    } catch (e) {
      console.error(e);
      setError("Failed to initiate face detector");
      setLoading(false);
      return;
    }

    const tick = async () => {
      const v = videoRef.current;
      const det = detectorRef.current;

      if (!v || !det || v.videoWidth === 0 || v.paused || v.ended) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      try {
        const faces = await det.estimateFaces(v, { flipHorizontal: true });
        const face = faces?.[0];

        if (!face?.box) {
          setHasFace(false);
          setBoxPct(null);
        } else {
          // Convert the pixel box to percentage of the video frame
          const { xMin, yMin, width, height } = face.box;
          const w = v.videoWidth || 1;
          const h = v.videoHeight || 1;
          const pct: FaceBoxPct = {
            x: (xMin / w) * 100,
            y: (yMin / h) * 100,
            w: (width / w) * 100,
            h: (height / h) * 100,
          };

          setHasFace(true);
          setBoxPct(pct);
        }
      } catch {
        // ignore transient inference errors
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    stop(); // ensure no duplicate loop
    rafRef.current = requestAnimationFrame(tick);
    setLoading(false);
  }, [stop, videoRef]);

  useEffect(() => {
    return () => {
      stop();
      detectorRef.current?.dispose?.();
      detectorRef.current = null;
      modelReadyRef.current = false;
    };
  }, [stop]);

  return { loading, hasFace, boxPct, error, start, stop };
}
