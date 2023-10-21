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

rsync -avzh --delete --log-file=rsync-log --exclude=node_modules \
  ./staging/ "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app

EXIT_CODE=${PIPESTATUS[0]}

if grep -q -E '<f[\.tp]+[[:blank:]]package.*\.json' rsync-log; then
  ssh "$SSH_USERNAME"@"$SSH_HOST" \
  -t "cd /home/protected/app/ \
    && chmod +x start-server.sh \
    && npm install --omit=dev && npm prune --omit=dev && npm dedupe --omit=dev \
    && rm -rf /home/tmp/npm* \
    && nfsn signal-daemon Node hup",
fi

exit "${EXIT_CODE}"
