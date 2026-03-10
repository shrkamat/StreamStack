#!/bin/bash

packager \
  in=h264_baseline_360p_600.mp4,stream=audio,output=audio.mp4 \
  in=input_text.vtt,stream=text,output=output_text.vtt \
  in=h264_baseline_360p_600.mp4,stream=video,output=h264_360p.mp4 \
  in=h264_main_480p_1000.mp4,stream=video,output=h264_480p.mp4 \
  in=h264_main_720p_3000.mp4,stream=video,output=h264_720p.mp4 \
  in=h264_high_1080p_6000.mp4,stream=video,output=h264_1080p.mp4 \
  --mpd_output h264.mpd
