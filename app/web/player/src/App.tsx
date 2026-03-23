import "./App.css";
import { ShakaPlayer, type ShakaPlayerProps } from "./components/ShakaPlayer";

const ASSETS: Record<string, ShakaPlayerProps> = {
  // 0
  "CDN BBB MP4": {
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  // 1
  "CDN BBB DASH": {
    src: "https://dash.akamaized.net/dash264/TestCasesUHD/2b/11/MultiRate.mpd",
  },
  // 2
  "Local BBB DASH": {
    src: "http://localhost:8080/BigBuckBunny/clear/h264.mpd",
  },
  // 3
  "CDN BBB HLS": {
    src: "https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8",
  },
  // 4
  "Local BBB HLS": {
    src: "http://localhost:8080/BigBuckBunny/clear/h264_master.m3u8",
  },
  // 5
  "Local BBB ClearKey HLS": {
    src: "http://localhost:8080/BigBuckBunny/clearkey/h264_master.m3u8",
    drmConfig: {
      clearKeys: {
        "00112233445566778899aabbccddeeff": "ffeeddccbbaa99887766554433221100",
      },
    },
  },
  // 6
  "Simulated Error": {
    src: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mp",
  },
  // 7
  "Local BBB DRM DASH": {
    src: "http://localhost:8080/BigBuckBunny/drm/h264.mpd",
    drmConfig: {
      servers: {
        "com.widevine.alpha":
          "https://proxy.uat.widevine.com/proxy?provider=widevine_test",
      },
    },
  },
  // 8
  "CDN HBO AD MP4": {
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  // 9
  "SHAKA CAPTION / MULTILANGUAGE": {
    src: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
  },
};

const ASSET_KEYS = Object.keys(ASSETS);
const DEFAULT_ASSET_KEY = ASSET_KEYS[9];

function App() {
  const asset: ShakaPlayerProps = ASSETS[DEFAULT_ASSET_KEY];
  return (
    <>
      <ShakaPlayer {...asset} />
    </>
  );
}

export default App;
