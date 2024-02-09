#!/bin/bash

platforms=$@

function genIgnore {
    regexp=".*$1"
    newFile=".$1.vscodeignore"
    cat .vscodeignore  > $newFile

    echo "\n" >> $newFile

    for i in $(find ./node_modules/@img -type d -maxdepth 1 -regex "$regexp"); 
    do
        echo "!$i" >> $newFile
    done
}

for p in $platforms;
do
    genIgnore $p
done


