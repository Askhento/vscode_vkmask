#!/bin/bash

# "package-win32-x64": "npx vsce package --target win32-x64 --ignoreFile .win32-x64.vscodeignore --out ./vsix-packages",
# "package-darwin-x64": "npx vsce package --target darwin-x64 --ignoreFile .darwin-x64.vscodeignore --out ./vsix-packages",
# "package-darwin-arm64": "npx vsce package --target darwin-arm64 --ignoreFile .darwin-arm64.vscodeignore --out ./vsix-packages",
    
platforms=$@

function packExt {
    ignoreFile=".$1.vscodeignore"
    npx vsce ls --ignoreFile "$ignoreFile"

    if [ "$RELEASE" == "true" ]; then
        echo Normal release
        npx vsce package --target "$1" --ignoreFile "$ignoreFile" --out ./vsix-packages
     else
        echo Pre release
        npx vsce package --pre-release --target "$1" --ignoreFile "$ignoreFile" --out ./vsix-packages
     fi
}

for p in $platforms;
do
    packExt $p
done