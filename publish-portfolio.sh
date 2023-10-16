#!/usr/bin/env bash

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src/site \
  -v "$(realpath "${PROJECTS_LOCATION}")":/projects -e PROJECTS_LOCATION=/projects \
  -v "$(realpath ~/.ssh)":/home/node/.ssh:ro \
  -w /src/site -u "$(id -u)":"$(id -g)" \
  npm run build-portfolio

EXIT_CODE=${PIPESTATUS[0]}

scp ./build/public/**/*.html "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app/public
scp ./build/public/**/*.{png,jpg,svg} "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app/public

exit "${EXIT_CODE}"
