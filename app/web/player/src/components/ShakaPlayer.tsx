import { useState, useRef, useEffect } from "react";
type ShakaUiModule = typeof import("shaka-player/dist/shaka-player.ui").default;
type ShakaPlayerInstance = InstanceType<ShakaUiModule["Player"]>;

// Extend Window interface
declare global {
  interface Window {
    player?: ShakaPlayerInstance;
  }
}

const isDebug: boolean = true;
const useShakaUI: boolean = true;

const shaka: ShakaUiModule & {
  log?: { Level: { V1: number }; setLevel(level: number): void };
} = (isDebug
  ? // ? (await import("shaka-player/dist/shaka-player.compiled.debug.js")).default
    (await import("shaka-player/dist/shaka-player.ui.debug.js")).default
  : (await import("shaka-player/dist/shaka-player.ui.js"))
      .default) as unknown as ShakaUiModule & {
  log?: { Level: { V1: number }; setLevel(level: number): void };
};

// Define the shape of the props the component accepts
interface ShakaPlayerProps {
  src: string;
}

function ShakaPlayer({ src }: ShakaPlayerProps) {
  const [videoSrc] = useState<string>(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ShakaPlayerInstance | null>(null);

  function onErrorEvent(event: unknown) {
    console.error("Shaka Player error event:", event);
  }

  useEffect(() => {
    const initPlayer = async () => {
      if (isDebug && shaka.log) {
        shaka.log.setLevel(shaka.log.Level.V1);
      }

      console.log("Initializing Shaka Player with source:", videoSrc);
      shaka.polyfill.installAll();

      // Check if the browser supports the Shaka Player
      if (shaka.Player.isBrowserSupported()) {
        console.log("Shaka Player is supported in this browser.");

        const player = new shaka.Player(videoRef.current);
        await player.attach(videoRef.current!);

        if (useShakaUI) {
          const overlayCtor = shaka.ui?.Overlay;
          if (overlayCtor && containerRef.current && videoRef.current) {
            new overlayCtor(player, containerRef.current, videoRef.current);
          }
        }

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
      playerRef.current?.destroy().catch((error: unknown) => {
        console.error("Error destroying Shaka Player:", error);
      });
    };
  }, [videoSrc]);

  return (
    <div>
      <h4>Shaka player, {videoSrc}</h4>
      <div id="video-bar" className="hidden">
        <div
          ref={containerRef}
          data-shaka-player-container
          className="video-container"
        >
          <video
            id="video"
            ref={videoRef}
            width="100%"
            height="100%"
            poster="/shaka_logo.png"
            data-shaka-player
            playsInline
            controls={!useShakaUI}
            autoPlay
            crossOrigin="anonymous"
          ></video>
        </div>
      </div>
    </div>
  );
}

export default ShakaPlayer;
