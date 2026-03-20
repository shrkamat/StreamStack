const isDebug: boolean = true;

const shaka = isDebug
  ? (await import("shaka-player/dist/shaka-player.compiled.debug.js")).default
  : (await import("shaka-player/dist/shaka-player.ui.js")).default;
// Debug version of the player
import { useState, useRef, useEffect } from "react";

// Define the shape of the props the component accepts
interface ShakaPlayerProps {
  src: string;
}

function ShakaPlayer({ src }: ShakaPlayerProps) {
  const [videoSrc] = useState<string>(src);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<shaka.Player | null>(null);

  function onErrorEvent(event: any) {
    console.error("Shaka Player error event:", event);
  }

  useEffect(() => {
    const initPlayer = async () => {
      if (isDebug) {
        (shaka as any).log.setLevel((shaka as any).log.Level.V1);
      }

      console.log("Initializing Shaka Player with source:", videoSrc);
      shaka.polyfill.installAll();

      // Check if the browser supports the Shaka Player
      if (shaka.Player.isBrowserSupported()) {
        console.log("Shaka Player is supported in this browser.");

        const player = new shaka.Player(videoRef.current);
        await player.attach(videoRef.current!);

        player.addEventListener("error", onErrorEvent);

        player.configure({
          preferredAudioLanguage: "el",
          streaming: {
            bufferingGoal: 60,
            retryParameters: {
              maxAttempts: 2,
              baseDelay: 500,
              backoffFactor: 2,
              fuzzFactor: 0.5,
            },
          },
          drm: {
            servers: {
              "com.widevine.alpha":
                "https://license.uat.widevine.com/cenc/getcontentkey/widevine_test",
            },
          },
        });

        try {
          await player.load(videoSrc);
        } catch (err) {
          console.error("Error loading video:", err);
        }

        // TODO: autoplay
        // if (videoRef.current?.autoplay) {
        //   player.play().catch((error: any) => {
        //     console.error("Error playing video:", error);
        //   });
        // }
        playerRef.current = player;

        if (isDebug) {
          window.player = player; // Expose player for debugging
        }
      } else {
        console.error("Shaka Player is not supported in this browser.");
      }
    };

    initPlayer();

    return () => {
      // cleanup here
      console.log("Cleaning up Shaka Player resources.");
      playerRef.current?.destroy().catch((error: any) => {
        console.error("Error destroying Shaka Player:", error);
      });
    };
  }, []);

  return (
    <div>
      <h4>Shaka player, {videoSrc}</h4>
      <video
        ref={videoRef}
        width="100%"
        poster="/shaka_logo.png"
        controls
        autoPlay
      ></video>
    </div>
  );
}

export default ShakaPlayer;
