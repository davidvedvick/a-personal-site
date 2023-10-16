#!/usr/bin/env bash

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src/site \
  -w /src/site -u "$(id -u)":"$(id -g)" \
  npm run publish-projects

EXIT_CODE=${PIPESTATUS[0]}

exit "${EXIT_CODE}"
