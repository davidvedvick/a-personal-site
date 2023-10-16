#!/usr/bin/env bash

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src/site \
  -v "$(realpath "${PROJECTS_LOCATION}")":/projects \
  -e PROJECTS_LOCATION=/projects \
  -w /src/site -u "$(id -u)":"$(id -g)" \
  npm run publish-projects

EXIT_CODE=${PIPESTATUS[0]}

exit "${EXIT_CODE}"
