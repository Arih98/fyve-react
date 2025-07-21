#!/usr/bin/env bash
git add .
git commit -m "${1:-Update}"
git push
npm run build
scp -i ~/.ssh/siteground_dev_key -P 18765 -r build/* u2499-f5szapuuzspy@ssh.fyvelondon.com:~/www/dev.fyvelondon.com/public_html/
