# SHAKA

## Goals

- [ ] Create CMAF (Common Media Application Format) packages using Shaka Packager
  - [x] Basic packaging is done (both hls & dash)
  - [ ] MP4 deep dive - sk (In progress)
  - [ ] CMAF deep dive
- [ ] Playback with shaka-player
  - [x] Basic dash playback
  - [x] Basic hls playback
  - [ ] Understand Shaka player APIs
    - [x] UI, Configuring UI
    - [x] Configuring text displayer
    - [ ] Error Handling - kk
    - [ ] Monetization with Ads - kk
      - [x] Custom intestrials
      - [ ] CSAI (Client Side Ad Insertion)
        - [ ] IMA Google SDK
        - [ ] VAST
	- [ ] VMAP
      - [ ] SSAI (Server Side Ad Insterion)
    - [ ] Application-Level Redirects
    - [ ] Frequently Asked Questions
    - [ ] LCEVC Quick Start
    - [ ] Accessibility
- [ ] Diagnostics
- [ ] Trickplay
- [ ] Live streaming
- [x] DRM
  - [x] Widevine
  - [x] ClearKey

## Initialize the Environment

- Fetch the Shaka Packager
- Download sample assets to play around with
- Package with Shaka Packager

```bash
./scripts/init.sh
```

## MoQ

Currently this code is available only on `moq` branch


```bash
git submodule update --init --recursive
cd moqlivemock
make
make mlmpub
# Not sure if I am missing some step(s) here.
# I see mlmpub fails if its run from default out dir
cp out/mlmpub cmd/mlmpub
cd cmd/mlmpub
./generate-webtransport-cert.sh
./mlmpub -cert cert-fp.pem -key key-fp.pem -fingerprintport 8081
```

Facing issues with Shaka player (& support seems to be limited too). Will try
with [warp-player](https://github.com/Eyevinn/warp-player) to begin with.

```bash
cd app/web/warp-player
npm start
```

### Status

- With shaka-player both local and demo live playback fails
- With warp-player local playback is failing, but demo live `https://moqlivemock.demo.osaas.io/moq` is working.
  - seems to be some certificate / WSL2 networking related issue.

### Debug WebTransport

```js
// Fetch and convert fingerprint
const fpHex = await (await fetch('http://172.25.68.255:8081/fingerprint')).text();
const hexBytes = new Uint8Array(fpHex.trim().length / 2);
for (let i = 0; i < hexBytes.length; i++) {
  hexBytes[i] = parseInt(fpHex.slice(2 * i, 2 * i + 2), 16);
}

// Connect with fingerprint
const wt = new WebTransport("https://172.25.68.255:4443/moq", {
  serverCertificateHashes: [{ algorithm: "sha-256", value: hexBytes }]
});
wt.ready.then(() => console.log("Connected!")).catch(e => console.error("Failed:", e));
```


## REFS

- [Shaka Packager Tutorials](https://shaka-project.github.io/shaka-packager/html/tutorials/tutorials.html)
- [Shaka Player Tutorial](https://shaka-player-demo.appspot.com/docs/api/tutorial-welcome.html)
- [Shaka Test Assets](https://shaka-player-demo.appspot.com/demo/#audiolang=en-US;uilang=en-US;assetBase64=eyJuYW1lIjoiQW5nZWwgT25lIChtdWx0aWNvZGVjLCBtdWx0aWxpbmd1YWwpIiwic2hvcnROYW1lIjoiQW5nZWwgT25lIiwiaWNvblVyaSI6Imh0dHBzOi8vc3RvcmFnZS5nb29nbGVhcGlzLmNvbS9zaGFrYS1hc3NldC1pY29ucy9hbmdlbF9vbmUucG5nIiwibWFuaWZlc3RVcmkiOiJodHRwczovL3N0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vc2hha2EtZGVtby1hc3NldHMvYW5nZWwtb25lL2Rhc2gubXBkIiwic291cmNlIjoiU2hha2EiLCJmb2N1cyI6ZmFsc2UsImRpc2FibGVkIjpmYWxzZSwiZXh0cmFUZXh0IjpbXSwiZXh0cmFUaHVtYm5haWwiOltdLCJleHRyYUNoYXB0ZXIiOltdLCJjZXJ0aWZpY2F0ZVVyaSI6bnVsbCwiZGVzY3JpcHRpb24iOiJBIGNsaXAgZnJvbSBhIGNsYXNzaWMgU3RhciBUcmVrIFRORyBlcGlzb2RlLCBwcmVzZW50ZWQgaW4gTVBFRy1EQVNILiIsImlzRmVhdHVyZWQiOnRydWUsImRybSI6WyJObyBEUk0gcHJvdGVjdGlvbiJdLCJmZWF0dXJlcyI6WyJEQVNIIiwiRG93bmxvYWRhYmxlIiwiTVA0IiwiTXVsdGlwbGUgbGFuZ3VhZ2VzIiwiU3VidGl0bGVzIiwiVk9EIiwiV2ViTSJdLCJsaWNlbnNlU2VydmVycyI6eyJfX3R5cGVfXyI6Im1hcCJ9LCJvZmZsaW5lTGljZW5zZVNlcnZlcnMiOnsiX190eXBlX18iOiJtYXAifSwibGljZW5zZVJlcXVlc3RIZWFkZXJzIjp7Il9fdHlwZV9fIjoibWFwIn0sInJlcXVlc3RGaWx0ZXIiOm51bGwsInJlc3BvbnNlRmlsdGVyIjpudWxsLCJjbGVhcktleXMiOnsiX190eXBlX18iOiJtYXAifSwiZXh0cmFDb25maWciOm51bGwsImV4dHJhVWlDb25maWciOm51bGwsImFkVGFnVXJpIjpudWxsLCJpbWFWaWRlb0lkIjpudWxsLCJpbWFBc3NldEtleSI6bnVsbCwiaW1hQ29udGVudFNyY0lkIjpudWxsLCJpbWFNYW5pZmVzdFR5cGUiOm51bGwsIm1lZGlhVGFpbG9yVXJsIjpudWxsLCJtZWRpYVRhaWxvckFkc1BhcmFtcyI6bnVsbCwidXNlSU1BIjp0cnVlLCJtaW1lVHlwZSI6bnVsbH0=;panel=HOME;build=uncompiled;customContextMenu)
- [Sample Video Assets](https://gist.github.com/jsturgis/3b19447b304616f18657?permalink_comment_id=3814125)
- [Python http.server address CORS](https://fpira.com/blog/2020/05/python-http-server-with-cors)
- [Netflix cadmium player](https://github.com/hoonseokkim/netflix-cadmium-player)
- [Inspect PSSH](https://emarsden.github.io/pssh-box-wasm/decode/)
- [MoQT](https://moqlivemock.demo.osaas.io/warp-player/)
