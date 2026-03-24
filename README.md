# SHAKA

## Goals

- [ ] Create CMAF (Common Media Application Format) packages using Shaka Packager
  - [x] Basic packaging is done (both hls & dash)
  - [ ] MP4 deep dive - sk
  - [ ] CMAF deep dive
- [ ] Playback with shaka-player
  - [x] Basic dash playback
  - [x] Basic hls playback
  - [ ] Understand Shaka player APIs
    - [x] UI, Configuring UI
    - [x] Configuring text displayer
    - [ ] Screen resolution detection
      - Not applicable for browser based player, won't do
    - [ ] Error Handling - kk
    - [ ] Creating accessible buttons - sk
      - This is more of UI, so probably won't do
    - [ ] Monetization with Ads - kk
    - [ ] Plugins and Customizing the Build - sk
      - Do we have usecase of rebuild ? Won't do for now
    - [ ] Manifest Parser Plugins
      - Mostly needed for live, won't do for now
    - [ ] Architecture Diagrams
      - These are not well documented, so won't do for now
    - [ ] Service Worker Caching
    - [ ] Offline Storage and Playback
    - [ ] Widevine Service Certificates
      - Looks like it's applicable if you have a custom license server, won't
      do for now
    - [ ] FairPlay support
    - [ ] Application-Level Redirects
    - [ ] Blob URL
    - [ ] Selenium Grid Config
    - [ ] Frequently Asked Questions
    - [ ] Upgrade Guide
    - [ ] ManifestParser Upgrade Guide
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

## REFS

- [Shaka Packager Tutorials](https://shaka-project.github.io/shaka-packager/html/tutorials/tutorials.html)
- [Shaka Player Tutorial](https://shaka-player-demo.appspot.com/docs/api/tutorial-welcome.html)
- [Shaka Test Assets](https://shaka-player-demo.appspot.com/demo/#audiolang=en-US;uilang=en-US;assetBase64=eyJuYW1lIjoiQW5nZWwgT25lIChtdWx0aWNvZGVjLCBtdWx0aWxpbmd1YWwpIiwic2hvcnROYW1lIjoiQW5nZWwgT25lIiwiaWNvblVyaSI6Imh0dHBzOi8vc3RvcmFnZS5nb29nbGVhcGlzLmNvbS9zaGFrYS1hc3NldC1pY29ucy9hbmdlbF9vbmUucG5nIiwibWFuaWZlc3RVcmkiOiJodHRwczovL3N0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vc2hha2EtZGVtby1hc3NldHMvYW5nZWwtb25lL2Rhc2gubXBkIiwic291cmNlIjoiU2hha2EiLCJmb2N1cyI6ZmFsc2UsImRpc2FibGVkIjpmYWxzZSwiZXh0cmFUZXh0IjpbXSwiZXh0cmFUaHVtYm5haWwiOltdLCJleHRyYUNoYXB0ZXIiOltdLCJjZXJ0aWZpY2F0ZVVyaSI6bnVsbCwiZGVzY3JpcHRpb24iOiJBIGNsaXAgZnJvbSBhIGNsYXNzaWMgU3RhciBUcmVrIFRORyBlcGlzb2RlLCBwcmVzZW50ZWQgaW4gTVBFRy1EQVNILiIsImlzRmVhdHVyZWQiOnRydWUsImRybSI6WyJObyBEUk0gcHJvdGVjdGlvbiJdLCJmZWF0dXJlcyI6WyJEQVNIIiwiRG93bmxvYWRhYmxlIiwiTVA0IiwiTXVsdGlwbGUgbGFuZ3VhZ2VzIiwiU3VidGl0bGVzIiwiVk9EIiwiV2ViTSJdLCJsaWNlbnNlU2VydmVycyI6eyJfX3R5cGVfXyI6Im1hcCJ9LCJvZmZsaW5lTGljZW5zZVNlcnZlcnMiOnsiX190eXBlX18iOiJtYXAifSwibGljZW5zZVJlcXVlc3RIZWFkZXJzIjp7Il9fdHlwZV9fIjoibWFwIn0sInJlcXVlc3RGaWx0ZXIiOm51bGwsInJlc3BvbnNlRmlsdGVyIjpudWxsLCJjbGVhcktleXMiOnsiX190eXBlX18iOiJtYXAifSwiZXh0cmFDb25maWciOm51bGwsImV4dHJhVWlDb25maWciOm51bGwsImFkVGFnVXJpIjpudWxsLCJpbWFWaWRlb0lkIjpudWxsLCJpbWFBc3NldEtleSI6bnVsbCwiaW1hQ29udGVudFNyY0lkIjpudWxsLCJpbWFNYW5pZmVzdFR5cGUiOm51bGwsIm1lZGlhVGFpbG9yVXJsIjpudWxsLCJtZWRpYVRhaWxvckFkc1BhcmFtcyI6bnVsbCwidXNlSU1BIjp0cnVlLCJtaW1lVHlwZSI6bnVsbH0=;panel=HOME;build=uncompiled;customContextMenu)
- [Sample Video Assets](https://gist.github.com/jsturgis/3b19447b304616f18657?permalink_comment_id=3814125)
- [Python http.server address CORS](https://fpira.com/blog/2020/05/python-http-server-with-cors)
- [Netflix cadmium player](https://github.com/hoonseokkim/netflix-cadmium-player)
