import { useRef, useEffect } from "react";
import type ShakaTypes from "shaka-player/dist/shaka-player.ui.debug";

type AdInterstitial = ShakaTypes.extern.AdInterstitial;
type ShakaUiModule = typeof import("shaka-player/dist/shaka-player.ui").default;
type ShakaPlayerInstance = InstanceType<ShakaUiModule["Player"]>;

// temporarily disable ad support
const DASH_AD_URI: string = "";
const DASH_AD_MIME: string = "application/dash+xml";

// Extend Window interface
declare global {
  interface Window {
    player?: ShakaPlayerInstance;
  }
}

const isDebug: boolean = true;
const useShakaUI: boolean = true;

// IMPORTANT: MOQT support requires the experimental build
// Use experimental.debug.js for debug mode, experimental.js for production
const shaka: ShakaUiModule & {
  log?: {
    Level: { V1: number; V2: number; DEBUG: number };
    setLevel(level: number): void;
  };
} = (isDebug
  ? (await import("shaka-player/dist/shaka-player.experimental.debug.js"))
      .default
  : // Use experimental build (not UI) to support MOQT
    (await import("shaka-player/dist/shaka-player.experimental.js"))
      .default) as unknown as ShakaUiModule & {
  log?: {
    Level: { V1: number; V2: number; DEBUG: number };
    setLevel(level: number): void;
  };
};

// Define the shape of the props the component accepts
export interface ShakaPlayerProps {
  src: string;
  mimeType?: string;
  drmConfig?: {
    servers?: Record<string, string>;
    clearKeys?: Record<string, string>;
  };
  // For WebTransport with self-signed certs, provide fingerprint URL
  fingerprintUri?: string;
}

export function ShakaPlayer({
  src,
  mimeType,
  drmConfig,
  fingerprintUri,
}: ShakaPlayerProps) {
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

        // Register custom interstitial ad (DASH) + log ad lifecycle.
        const adManager = player.getAdManager();
        if (adManager) {
          adManager.addEventListener("ad-break-started", (e: unknown) => {
            console.log("[ads] ad-break-started", e);
          });
          adManager.addEventListener("ad-started", (e: unknown) => {
            console.log("[ads] ad-started", e);
          });
          adManager.addEventListener("ad-paused", (e: unknown) => {
            console.log("[ads] ad-paused", e);
          });
          adManager.addEventListener("ad-resumed", (e: unknown) => {
            console.log("[ads] ad-resumed", e);
          });
          adManager.addEventListener("ad-skipped", (e: unknown) => {
            console.log("[ads] ad-skipped", e);
          });
          adManager.addEventListener("ad-complete", (e: unknown) => {
            console.log("[ads] ad-complete", e);
          });
          adManager.addEventListener("ad-stopped", (e: unknown) => {
            console.log("[ads] ad-stopped", e);
          });
          adManager.addEventListener("ad-break-ended", (e: unknown) => {
            console.log("[ads] ad-break-ended", e);
          });
          adManager.addEventListener("ad-error", (e: unknown) => {
            console.error("[ads] ad-error", e);
          });

          const interstitial: AdInterstitial = {
            id: "dash-midroll-10s",
            groupId: null,
            startTime: 10,
            endTime: null,
            uri: DASH_AD_URI,
            mimeType: DASH_AD_MIME,
            isSkippable: true,
            skipOffset: 5,
            skipFor: null,
            canJump: false,
            resumeOffset: null,
            playoutLimit: null,
            once: true,
            pre: false,
            post: false,
            timelineRange: false,
            loop: false,
            overlay: null,
            displayOnBackground: false,
            currentVideo: null,
            background: null,
            clickThroughUrl: null,
            tracking: null,
          };

          try {
            adManager.addCustomInterstitial(interstitial);
            console.log("[ads] registered DASH interstitial", {
              startTime: interstitial.startTime,
              uri: interstitial.uri,
            });
          } catch (e) {
            console.error("[ads] failed to register interstitial", e);
          }
        } else {
          console.warn("[ads] player.getAdManager() returned null/undefined");
        }

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
          drm: drmConfig
            ? {
                servers: drmConfig.servers,
                clearKeys: drmConfig.clearKeys,
                logLicenseExchange: true,
                // Prefer ClearKey for MOQT streams
                preferredKeySystems: ["org.w3.clearkey"],
              }
            : {
                // Force no DRM - tell Shaka to not query any key systems
                servers: {},
                advanced: {},
                ignoreDuplicateInitData: true,
                // Skip key system queries entirely
                preferredKeySystems: [],
                keySystemsMapping: {},
                retryParameters: {
                  maxAttempts: 0, // Don't retry DRM at all
                },
              },
          // For MSF/MOQT configuration
          manifest: {
            dash: {
              ignoreDrmInfo: true,
            },
            msf: {
              // Fingerprint URI for WebTransport with self-signed certs
              fingerprintUri: fingerprintUri || "",
            },
          },
          textDisplayer: {
            fontScaleFactor: 1.5,
            positionArea: shaka.config.PositionArea.CENTER,
          },
        });

        try {
          await player.load(src, 0, mimeType);
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
  }, [src, drmConfig, fingerprintUri]);

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
