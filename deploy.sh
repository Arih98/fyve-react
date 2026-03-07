#!/usr/bin/env bash
set -e
git add .
git commit -m "${1:-Update}" || true
git push
npm run build
ssh -i ~/.ssh/siteground_key -p 18765 u2499-f5szapuuzspy@ssh.fyvelondon.com "rm -rf ~/www/dev.fyvelondon.com/public_html/*"
scp -i ~/.ssh/siteground_key -P 18765 -r build/* u2499-f5szapuuzspy@ssh.fyvelondon.com:~/www/dev.fyvelondon.com/public_html/