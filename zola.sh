#!/usr/bin/env bash

if [ "$1" == "" ] || [ $# -gt 1 ]; then
    docker run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app balthek/zola:0.13.0 build
elif [ "$1" = "build" ]; then
    docker run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app balthek/zola:0.13.0 build
elif [ "$1" = "serve" ]; then
    echo 'Serving Zola on port 8080'
    docker run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app -p 8080:8080 -p 1024:1024 balthek/zola:0.13.0 serve --interface 0.0.0.0 --port 8080 --base-url localhost
else
    echo 'Unknown parameter'
fi