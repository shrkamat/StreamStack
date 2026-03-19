import "./App.css";
import ShakaPlayer from "./components/ShakaPlayer";

function App() {
  return (
    <>
      {/* <ShakaPlayer src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" /> */}
      {/* <ShakaPlayer src="https://dash.akamaized.net/dash264/TestCasesUHD/2b/11/MultiRate.mpd" /> */}
      {/* <ShakaPlayer src="http://localhost:8080/BigBuckBunny/h264.mpd" /> */}
      {/* <ShakaPlayer src="https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.m3u8" /> */}
      {/* <ShakaPlayer src="http://localhost:8080/BigBuckBunny/h264_master.m3u8" /> */}
      <ShakaPlayer src="https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mp" />
    </>
  );
}

export default App;
