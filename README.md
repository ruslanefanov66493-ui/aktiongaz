# АктионГаз — сайт (статическая сборка)

Самодостаточный статический сайт производителя газового оборудования «АктионГаз».
Дизайн в стиле Apple Liquid Glass. Все изображения лежат внутри `assets/`, пути относительные — сайт деплоится как есть.

## Структура
- `index.html`, `produkciya.html`, `sertifikaty.html`, `oprosnye.html`, `fotografii.html`, `kontakty.html` — страницы
- `assets/css/main.css` — стили (дизайн-система Liquid Glass, оптимизирована по производительности)
- `assets/js/main.js` — интерактив (меню, фильтры, лайтбокс, формы)
- `assets/img/` — логотипы, favicon
- `assets/content/` — фотографии, сертификаты, проекты, опросные листы
- `vercel.json` — конфиг деплоя (clean URLs + кэширование статики)

## Деплой на Vercel
Репозиторий готов к импорту: Vercel → New Project → Import этот репозиторий → Framework Preset: **Other** → Deploy. Сборка не требуется.
