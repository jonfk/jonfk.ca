#!/usr/bin/env bash

set -x
set -e

curl -o alegreya-sc.zip "https://google-webfonts-helper.herokuapp.com/api/fonts/alegreya-sc?download=zip&subsets=latin,latin-ext&variants=regular"
curl -o ubuntu-mono.zip "https://google-webfonts-helper.herokuapp.com/api/fonts/ubuntu-mono?download=zip&subsets=latin,latin-ext&variants=regular"
curl -o pt-sans.zip "https://google-webfonts-helper.herokuapp.com/api/fonts/pt-sans?download=zip&subsets=latin,latin-ext&variants=regular"

unzip alegreya-sc.zip -d static/fonts
unzip ubuntu-mono.zip -d static/fonts
unzip pt-sans.zip -d static/fonts

rm alegreya-sc.zip ubuntu-mono.zip pt-sans.zip
