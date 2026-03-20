#!/usr/bin/env bash

set -xe

if [ $# -ne 1 ]; then
    echo "Usage: $0 <input_mp4>"
    exit 1
fi

ARG=$1
INPUT=$(realpath "$ARG")

if [ ! -f "$INPUT" ]; then
    echo "File not found: $INPUT"
    exit 1
fi

BASENAME=$(basename "$INPUT")
NAME="${BASENAME%.*}"

OUTDIR="./$NAME"
mkdir -p "$OUTDIR"

echo "Output directory: $OUTDIR"

cd "$OUTDIR"

echo "Transcoding to 360p..."
ffmpeg -i "$INPUT" -c:a copy \
  -vf "scale=-2:360" \
  -c:v libx264 -profile:v baseline -level:v 3.0 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 600k -maxrate 600k -bufsize 600k -b:v 600k \
  -y h264_baseline_360p_600.mp4

echo "Transcoding to 480p..."
ffmpeg -i "$INPUT" -c:a copy \
  -vf "scale=-2:480" \
  -c:v libx264 -profile:v main -level:v 3.1 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 1000k -maxrate 1000k -bufsize 1000k -b:v 1000k \
  -y h264_main_480p_1000.mp4

echo "Transcoding to 720p..."
ffmpeg -i "$INPUT" -c:a copy \
  -vf "scale=-2:720" \
  -c:v libx264 -profile:v main -level:v 4.0 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 3000k -maxrate 3000k -bufsize 3000k -b:v 3000k \
  -y h264_main_720p_3000.mp4


echo "Transcoding to 1080p..."
ffmpeg -i "$INPUT" -c:a copy \
  -vf "scale=-2:1080" \
  -c:v libx264 -profile:v high -level:v 4.2 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 6000k -maxrate 6000k -bufsize 6000k -b:v 6000k \
  -y h264_high_1080p_6000.mp4

echo "Extracting audio..."
ffmpeg -y -i "$INPUT" \
  -vn \
  -c:a aac -b:a 128k \
  audio.mp4

echo "Packaging with Shaka Packager..."

# Below command is taken from https://shaka-project.github.io/shaka-packager/html/tutorials/dash.html
# Section: Output DASH + HLS with dash_only and hls_only options:
packager \
  'in=h264_baseline_360p_600.mp4,stream=audio,init_segment=audio/init.mp4,segment_template=audio/$Number$.m4s' \
  'in=h264_baseline_360p_600.mp4,stream=video,init_segment=h264_360p/init.mp4,segment_template=h264_360p/$Number$.m4s' \
  'in=h264_main_480p_1000.mp4,stream=video,init_segment=h264_480p/init.mp4,segment_template=h264_480p/$Number$.m4s' \
  'in=h264_main_720p_3000.mp4,stream=video,init_segment=h264_720p/init.mp4,segment_template=h264_720p/$Number$.m4s' \
  'in=h264_high_1080p_6000.mp4,stream=video,init_segment=h264_1080p/init.mp4,segment_template=h264_1080p/$Number$.m4s' \
  # --enable_widevine_encryption \
  # --content_id 746573745f636f6e74656e745f6964 \
  # --key_server_url https://license.uat.widevine.com/cenc/getcontentkey/widevine_test \
  --generate_static_live_mpd --mpd_output h264.mpd \
  --hls_master_playlist_output h264_master.m3u

echo ""
echo "Packaging complete."
echo "Output located in: $OUTDIR"

