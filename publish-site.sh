#!/usr/bin/env bash

docker compose build && docker compose run --rm \
  -v "$(pwd)":/src \
  -v "$(realpath "${PROJECTS_LOCATION}")":/projects -e PROJECTS_LOCATION=/projects \
  -v "$(realpath "${BIO_PATH}")":/bio -e BIO_PATH=/bio \
  -e BIO_AUTHOR_PICTURE="/bio/${BIO_AUTHOR_PICTURE}" \
  -e RESUME_LOCATION="/bio/resume.md" \
  -w /src -u "$(id -u)":"$(id -g)" \
  npm run build-release

EXIT_CODE=${PIPESTATUS[0]}

rsync -avzh --delete --log-file=rsync-log \
  ./build/public/ "$SSH_USERNAME"@"$SSH_HOST":/home/protected/app/public

EXIT_CODE=${PIPESTATUS[0]}

if grep -q rsync-log ">f++++++ package.*\.json"; then
  ssh "$SSH_USERNAME"@"$SSH_HOST" \
  -t "cd /home/protected/app/
    && chmod +x start-server.sh
    && npm install --production
    && npm update --production
    && npm prune --production
    && npm dedupe
    && rm -rf /home/tmp/npm*
    && nfsn signal-daemon Node hup",
fi

exit "${EXIT_CODE}"
