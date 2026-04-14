import { useRef, useEffect } from "react";
type ShakaUiModule = typeof import("shaka-player/dist/shaka-player.ui").default;
type ShakaPlayerInstance = InstanceType<ShakaUiModule["Player"]>;

const IMA_SDK_SRC = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
// Google IMA sample VMAP tag (pre/mid/post via ad rules). Replace with your own GAM VMAP tag.
// Tip: keep `correlator=` at the end; we append a timestamp to avoid caching.
const IMA_AD_TAG_URI =
  "https://pubads.g.doubleclick.net/gampad/ads?" +
  "sz=640x480&" +
  "iu=/124319096/external/ad_rule_samples&" +
  "ciu_szs=300x250&" +
  "ad_rule=1&" +
  "impl=s&" +
  "gdfp_req=1&" +
  "env=vp&" +
  "output=vmap&" +
  "unviewed_position_start=1&" +
  "cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&" +
  "cmsid=496&" +
  "vid=short_onecue&" +
  "correlator=";

function loadImaSdk(): Promise<void> {
  if ((window as any).google?.ima?.AdsLoader) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-ima-sdk="true"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = IMA_SDK_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.imaSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google IMA SDK"));
    document.head.appendChild(script);
  });
}

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
  const adContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ShakaPlayerInstance | null>(null);

  function onErrorEvent(event: unknown) {
    console.error("Shaka Player error event:", event);
  }

  useEffect(() => {
    let isMounted: boolean = true;
    // TODO: understand this type definition, isn't there a Shaka provided type ?
    let uiOverlay: { destroy: () => void } | null = null;
    let removeImaRetryListener: (() => void) | null = null;

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

        // Client-side ads via Google IMA SDK.
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

          const adContainer = adContainerRef.current;
          if (!adContainer) {
            console.warn("[ads] ad container is missing; IMA ads disabled");
          } else {
            // Required for IMA client-side ads in Shaka 5.x.
            adManager.setContainers(adContainer, adContainer);

            const requestAds = async () => {
              await loadImaSdk();

              const googleIma = (window as any).google?.ima;
              if (!googleIma?.AdsRequest) {
                throw new Error("Google IMA SDK loaded but google.ima missing");
              }

              const imaRequest = new googleIma.AdsRequest();
              // Add a changing correlator to avoid cached ad responses.
              imaRequest.adTagUrl = `${IMA_AD_TAG_URI}${Date.now()}`;

              const videoEl = videoRef.current;
              const width = videoEl?.clientWidth || 640;
              const height = videoEl?.clientHeight || 360;
              imaRequest.linearAdSlotWidth = width;
              imaRequest.linearAdSlotHeight = height;
              imaRequest.nonLinearAdSlotWidth = width;
              imaRequest.nonLinearAdSlotHeight = Math.floor(height / 3);

              adManager.requestClientSideAds(imaRequest, null);
              console.log("[ads] requested IMA ads", { adTagUrl: imaRequest.adTagUrl });
            };

            try {
              // Best-effort: may fail if the browser requires a user gesture.
              await requestAds();
            } catch (e) {
              console.warn(
                "[ads] IMA ad request failed (often needs user gesture); will retry on first interaction",
                e,
              );

              const onFirstGesture = () => {
                requestAds().catch((err: unknown) => {
                  console.error("[ads] IMA retry failed", err);
                });
              };
              containerRef.current?.addEventListener("pointerdown", onFirstGesture, {
                once: true,
              });
              removeImaRetryListener = () => {
                containerRef.current?.removeEventListener("pointerdown", onFirstGesture);
              };
            }
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
      if (removeImaRetryListener) {
        try {
          removeImaRetryListener();
        } catch {
          // ignore
        }
        removeImaRetryListener = null;
      }
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
  }, [src, drmConfig]);

  return (
    <div>
      <h4>Shaka player, {src}</h4>
      <div id="video-bar" className="hidden">
        <div
          ref={containerRef}
          data-shaka-player-container
          className="video-container"
        >
          <div
            ref={adContainerRef}
            className="shaka-ad-container"
            aria-hidden="true"
          />
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
