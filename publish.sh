#!/bin/bash

publish=$1

export RELEASE=$(node -e "const {version} = require('./package.json'); console.log(version.split('.')[1] % 2 == 0)")
echo "version is release: ${RELEASE}"

npm run generateIgnoreFiles

npm run package-all

cmd=(--packagePath $(find ./vsix-packages -iname *.vsix))

if [[ -n $VSCE_PAT ]]; then
    cmd+=("-p $VSCE_PAT")
fi

if [[ $RELEASE == "false" ]]; then
    cmd+=("--pre-release")
fi

if [[ $publish == "true" ]]; then
    echo "will publish"
    npx vsce publish "${cmd[@]}"
else
    echo "dry run"
    echo "npx vsce publish ${cmd[@]}"
fi

