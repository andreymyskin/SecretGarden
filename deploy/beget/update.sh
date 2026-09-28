#!/usr/bin/env bash
# Обновление сайта на Beget: подтянуть код, собрать, перезапустить Passenger.
# Запускать из Docker-окружения хостинга (ssh localhost -p 222), находясь в каталоге приложения:
#   cd ~/secretgarden62.ru/app && bash deploy/beget/update.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

# Контент, отредактированный через админку, живёт в data/content.json и не должен
# затираться версией из репозитория: сохраняем копию, обновляем код, возвращаем копию.
BACKUP="data/content.backup-$(date +%Y%m%d-%H%M%S).json"
if [ -f data/content.json ]; then
  cp data/content.json "$BACKUP"
  git checkout -- data/content.json
fi

echo "==> git pull"
git pull --ff-only

if [ -f "$BACKUP" ]; then
  cp "$BACKUP" data/content.json
  ls -1t data/content.backup-*.json | tail -n +6 | xargs -r rm -f
fi

echo "==> npm install"
npm install --no-audit --no-fund

echo "==> next build"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}" npm run build

echo "==> restart passenger"
mkdir -p tmp
touch tmp/restart.txt

echo "Готово. Откройте сайт в браузере и проверьте, что страница обновилась."
