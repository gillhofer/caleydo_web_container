#!/usr/bin/env bash

echo "--- pull container ---"
git pull
echo "--- pull plugins ---"

find . -name .git -type d -prune | while read d; do
   cd $d/..
   echo "--- pull plugin $PWD"
   git pull
   cd $OLDPWD
done

echo "--- done ---"