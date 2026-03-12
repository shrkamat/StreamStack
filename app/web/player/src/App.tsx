import "./App.css";
import ShakaPlayer from "./components/ShakaPlayer";

function App() {
  return (
    <>
      {/* <ShakaPlayer src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" /> */}
      <ShakaPlayer src="https://dash.akamaized.net/dash264/TestCasesUHD/2b/11/MultiRate.mpd" />
    </>
  );
}

export default App;
