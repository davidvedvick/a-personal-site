#!/usr/bin/env bash

rm rsync-log

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src \
  -v "$(realpath "${PROJECTS_LOCATION}")":/projects -e PROJECTS_LOCATION=/projects \
  -v "$(realpath "${BIO_LOCATION}")":/bio \
  -e BIO_PATH=/bio/bio.md \
  -e BIO_AUTHOR_PICTURE="/bio/profile-pic.jpg" \
  -e RESUME_LOCATION="/bio/resume.md" \
  -w /src -u "$(id -u)":"$(id -g)" \
  npm run build-release

EXIT_CODE=${PIPESTATUS[0]}

if [ "$EXIT_CODE" -ne 0 ]; then
  exit "${EXIT_CODE}"
fi

rsync -avzh --delete --log-file=rsync-log --exclude=node_modules --exclude app-config.json \
  ./build/ "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app

EXIT_CODE=$?

if [ "$EXIT_CODE" -ne 0 ]; then
  exit "${EXIT_CODE}"
fi

cat rsync-log

if grep -q -E '<f[\.tp]+[[:blank:]]app-release.js' rsync-log; then
  ssh "$SSH_USERNAME"@"$SSH_HOST" \
  -t "cd /home/protected/app/ \
    && chmod +x start-server.sh \
    && nfsn signal-daemon Node hup",
fi

EXIT_CODE=$?

exit "${EXIT_CODE}"
