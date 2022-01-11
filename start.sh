#!/bin/sh
npm start &
cd bff
pipenv run sanic -d modules.server:app
