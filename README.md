# Secret Garden

Сайт-визитка фотопространства Secret Garden с пастельной эстетикой и админ-панелью для галереи.

## Разделы

- О компании
- Наши работы (фотогалерея)
- Локации
- Оборудование
- Контакты
- Админ-панель `/admin` для добавления, редактирования и удаления работ

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Админ: [http://localhost:3000/admin](http://localhost:3000/admin)

## Переменные окружения

Скопируйте `.env.example` в `.env.local`:

```bash
ADMIN_PASSWORD=secretgarden
ADMIN_SECRET=change-me-to-a-long-random-string
```

## Стек

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Файловое хранилище галереи (`data/gallery.json` + `public/uploads`)
