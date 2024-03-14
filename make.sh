#!/bin/zsh

npx electron-forge make

rm ./out/mac_bonk_cp_app.zip
# cp ./out/make/zip/darwin/arm64/mac_bonk_cp_app-darwin-arm64-3.2.1.zip ./out/mac_bonk_cp_app.zip
src_dir="./out/make/zip/darwin/arm64"
src_file=($src_dir/*)
filename=$(basename "$src_file")
cp "$src_file" ./out/mac_bonk_cp_app.zip