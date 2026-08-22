#!/usr/bin/env bash

rm rsync-log

docker compose build && docker compose up --rm \
  -v "$(pwd)":/src \
  -v "$(realpath "${PROJECTS_LOCATION}")":/projects -e PROJECTS_LOCATION=/projects \
  -v "$(realpath "${BIO_LOCATION}")":/bio \
  -e BIO_PATH=/bio/bio.md \
  -e BIO_AUTHOR_PICTURE="/bio/profile-pic.jpg" \
  -e RESUME_LOCATION="/bio/resume.md" \
  -w /src -u "$(id -u)":"$(id -g)" \
  -p "3000:3000"
  npm run release

EXIT_CODE=$?

exit "${EXIT_CODE}"
