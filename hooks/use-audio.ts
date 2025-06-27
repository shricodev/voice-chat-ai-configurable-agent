import { useCallback, useRef, useState } from "react";

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(
    async (text: string) => {
      try {
        stopAudio();

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error("Failed to generate audio");

        const AudioContext =
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        const source = audioContext.createBufferSource();
        currentSourceRef.current = source;

        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        setIsPlaying(true);

        source.onended = () => {
          setIsPlaying(false);
          currentSourceRef.current = null;
        };

        source.start(0);
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        currentSourceRef.current = null;
      }
    },
    [stopAudio],
  );

  return { playAudio, stopAudio, isPlaying };
};
