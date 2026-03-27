#!/bin/bash

# check if .bin directory exists, if not create it
if [ ! -f ".bin/packager" ]; then
    mkdir .bin
    wget https://github.com/shaka-project/shaka-packager/releases/download/v3.5.0/packager-linux-x64 -O .bin/packager
    chmod +x .bin/packager
    echo "Downloaded packager to .bin/packager"
else
    echo "packager is already installed, skipping download"
fi

echo "run below command to add it to your PATH"
echo "export PATH=$(pwd)/.bin:\$PATH"

# check if assets are downloaded, if not download them
if [ ! -f "assets/BigBuckBunny.mp4" ]; then
    wget http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 -O assets/BigBuckBunny.mp4
    echo "Downloaded sample mp4(s) to assets folder"
else
    echo "assets are already downloaded, skipping download"
fi

source .devenv
make -C assets

python3 scripts/media-server.py assets
