#!/usr/bin/env bash

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src \
  -v "$(realpath "${BIO_LOCATION}")":/bio \
  -w /src -u "$(id -u)":"$(id -g)" \
  -e RESUME_LOCATION="/bio/resume.md" \
  npm run build-resume

EXIT_CODE=${PIPESTATUS[0]}

rsync -avzh \
  --include='*.html' \
  --include='*.pdf' \
  --include='*/' \
  --exclude='*' \
  --prune-empty-dirs \
  ./build/public/ "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app/public

EXIT_CODE=${PIPESTATUS[0]}

exit "${EXIT_CODE}"
