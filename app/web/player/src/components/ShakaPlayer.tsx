import { useRef, useEffect } from "react";
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
  log?: {
    Level: { V1: number; V2: number; DEBUG: number };
    setLevel(level: number): void;
  };
} = (isDebug
  ? // ? (await import("shaka-player/dist/shaka-player.compiled.debug.js")).default
    (await import("shaka-player/dist/shaka-player.ui.debug.js")).default
  : (await import("shaka-player/dist/shaka-player.ui.js"))
      .default) as unknown as ShakaUiModule & {
  log?: {
    Level: { V1: number; V2: number; DEBUG: number };
    setLevel(level: number): void;
  };
};

// Define the shape of the props the component accepts
export interface ShakaPlayerProps {
  src: string;
  drmConfig?: {
    servers?: Record<string, string>;
    clearKeys?: Record<string, string>;
  };
}

export function ShakaPlayer({ src, drmConfig }: ShakaPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ShakaPlayerInstance | null>(null);

  function onErrorEvent(event: unknown) {
    console.error("Shaka Player error event:", event);
  }

  useEffect(() => {
    let isMounted: boolean = true;
    // TODO: understand this type definition, isn't there a Shaka provided type ?
    let uiOverlay: { destroy: () => void } | null = null;

    const initPlayer = async () => {
      if (isDebug && shaka.log) {
        shaka.log.setLevel(shaka.log.Level.V2);
      }

      shaka.polyfill.installAll();

      // Check if the browser supports the Shaka Player
      if (shaka.Player.isBrowserSupported()) {
        console.log("Shaka Player is supported in this browser.");

        const player = new shaka.Player();
        playerRef.current = player; // Synchronously set ref for correct cleanup

        try {
          await player.attach(videoRef.current!);
        } catch (e) {
          if (isMounted) console.error("Error attaching player:", e);
          return;
        }

        if (!isMounted) return;

        if (useShakaUI) {
          const overlayCtor = shaka.ui?.Overlay;
          if (overlayCtor && containerRef.current && videoRef.current) {
            uiOverlay = new overlayCtor(
              player,
              containerRef.current,
              videoRef.current,
            );
          }
        }

        player.addEventListener("error", onErrorEvent);
        player.setVideoContainer(containerRef.current!);

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
            servers: drmConfig?.servers,
            clearKeys: drmConfig?.clearKeys,
            logLicenseExchange: true,
          },
          textDisplayer: {
            fontScaleFactor: 1.5,
            positionArea: shaka.config.PositionArea.CENTER,
          },
        });

        try {
          await player.load(src);
        } catch (err) {
          if (isMounted) console.error("Error loading video:", err);
        }

        if (isDebug && isMounted) {
          window.player = player; // Expose player for debugging
        }
      } else {
        console.error("Shaka Player is not supported in this browser.");
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      console.log("Cleaning up Shaka Player resources.");
      if (uiOverlay) {
        try {
          uiOverlay.destroy();
        } catch (err) {
          console.error("Failed to destroy Shaka ui overlay:", err);
        }
      }
      if (playerRef.current) {
        playerRef.current.destroy().catch((error: unknown) => {
          console.error("Error destroying Shaka Player:", error);
        });
        playerRef.current = null;
      }
    };
  });

  return (
    <div>
      <h4>Shaka player, {src}</h4>
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
            poster="https://shaka-player-demo.appspot.com/assets/poster.jpg"
            data-shaka-player
            playsInline
            controls={!useShakaUI}
            muted
            autoPlay
            crossOrigin="anonymous"
          ></video>
        </div>
      </div>
    </div>
  );
}
