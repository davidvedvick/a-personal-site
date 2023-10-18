#!/usr/bin/env bash

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src/site \
  -v "$(realpath "${PROJECTS_LOCATION}")":/projects -e PROJECTS_LOCATION=/projects \
  -w /src/site -u "$(id -u)":"$(id -g)" \
  npm run build-portfolio

EXIT_CODE=${PIPESTATUS[0]}

rsync -avzh \
  --include='*.html' \
  --include='*.png' \
  --include='*.svg' \
  --include='*.jpg' \
  --include='*/' \
  --exclude='*' \
  --prune-empty-dirs \
  ./build/public/ "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app/public

EXIT_CODE=${PIPESTATUS[0]}

exit "${EXIT_CODE}"