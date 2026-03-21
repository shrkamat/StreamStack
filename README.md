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
  - [ ] UI, Configuring UI - sk
  - [ ] Configuring text displayer - sk
  - [ ] Screen resolution detection - kk
  - [ ] Error Handling - kk
  - [ ] Creating accessible buttons - sk
  - [ ] Monetization with Ads - kk
  - [ ] Plugins and Customizing the Build - sk
  - [ ] Manifest Parser Plugins
  - [ ] Architecture Diagrams
  - [ ] Service Worker Caching
  - [ ] Offline Storage and Playback
  - [ ] Widevine Service Certificates
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
- [Sample Video Assets](https://gist.github.com/jsturgis/3b19447b304616f18657?permalink_comment_id=3814125)
- [Python http.server address CORS](https://fpira.com/blog/2020/05/python-http-server-with-cors)
