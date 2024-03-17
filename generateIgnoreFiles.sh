#!/bin/bash

platforms=$@

function genIgnore {
    regexp=".*$1"
    newFile=".$1.vscodeignore"
    cat .vscodeignore  > $newFile

    echo -e "\n" >> $newFile

    for i in $(find node_modules/@img -maxdepth 1  -type d -regex "$regexp"); 
    do
        echo "!$i" >> $newFile
    done
}

for p in $platforms;
do
    genIgnore $p
done


