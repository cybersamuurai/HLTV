# HLTV API - Инженерная документация

## Краткое описание

**Назначение:** Node.js библиотека для извлечения данных о CS:GO/CS2 матчах, турнирах, игроках и командах с сайта hltv.org через веб-скрапинг.

**Тип системы:** NPM пакет / библиотека (не автономный сервис)

**Текущее состояние:** 75% endpoints работают, 25% требуют обхода Cloudflare через Puppeteer

**Местоположение:** `C:\Users\vokku\git\mcp\HLTV`

## Состав системы

### Компоненты

- TypeScript библиотека - основной код в `src/`
- Скомпилированный код - CommonJS модули в `lib/`
- Puppeteer bypass - браузерная автоматизация для обхода Cloudflare
- Без баз данных - stateless библиотека
- Без фоновых процессов - вызывается синхронно

### Внешние зависимости

- **hltv.org** - источник данных (блокирует некоторые `/stats/*` endpoints через Cloudflare)
- **NPM registry** - для публикации пакета

### Структура репозитория

```
C:\Users\vokku\git\mcp\HLTV\
├── src/                          # TypeScript исходники
│   ├── endpoints/               # 23 endpoint файла
│   │   ├── getMatches.ts       # Список матчей
│   │   ├── getPlayerRanking.ts # Рейтинг игроков (Cloudflare)
│   │   ├── getPlayerStats.ts   # Статистика игрока (Cloudflare)
│   │   ├── getMatchStats.ts    # Статистика матча (Cloudflare)
│   │   ├── getTeamStats.ts     # Статистика команды (Cloudflare)
│   │   └── ...                 # Остальные endpoints
│   ├── shared/                  # Общие типы (GameMap, Team, Event, etc)
│   ├── config.ts               # HTTP конфигурация (got-scraping)
│   ├── scraper.ts              # Cheerio wrapper с helper методами
│   ├── utils.ts                # Retry logic, fetchPage, sleep
│   ├── puppeteer-loader.ts     # Cloudflare bypass (добавлен 2025-03-16)
│   └── index.ts                # Публичный API
├── lib/                         # Скомпилированный JS (git ignored, npm published)
├── test*.js                     # Тестовые скрипты
├── tsconfig.json               # TS config для разработки
├── tsconfig.release.json       # TS config для сборки
└── package.json                # Dependencies, scripts
```

> **UNKNOWN:** Назначение файлов в корне (playground.ts, некоторые .d.ts файлы)

### Критические файлы

- `src/config.ts:13` - got-scraping настройки, HTTP headers
- `src/utils.ts:94-145` - fetchPage с Cloudflare detection
- `src/puppeteer-loader.ts` - браузер для обхода Cloudflare
- `src/scraper.ts:103-123` - cheerio.toArray() с фиксом для cheerio 1.0.0

## Конфигурация

### Environment переменные

Нет env переменных. Все настройки hardcoded.

### HTTP конфигурация

**Файл:** `src/config.ts`

**Параметры:**
- `timeout: 60000ms` - request timeout
- `retry.limit: 3` (оптимизировано до 1 в utils.ts)
- `retry delays: 500-1000ms` (изначально было 1-10s)
- HTTP/2 enabled
- Browser fingerprinting: Chrome 120-122, Firefox 120-123, Edge 120

> Назначение некоторых headers: неизвестно, скопировано из реальных браузеров

### Puppeteer конфигурация

**Файл:** `src/puppeteer-loader.ts`

**Параметры:**
```javascript
headless: false  // VERIFY: может ли работать в headless для Cloudflare?
args: ['--start-maximized']
turnstile: true  // Cloudflare Turnstile solving
```

**Поведение:**
- Создает новую вкладку для каждого HTTP запроса
- Переиспользует один экземпляр браузера
- Очередь запросов (sequential execution)
- Wait 2000ms после загрузки страницы

## Запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Сборка TypeScript -> CommonJS
npm run build
# Альтернатива если lib/ существует:
rm -rf lib && npm run build

# Запуск тестов
node test-player-ranking-puppeteer.js           # Тест Cloudflare bypass
node test-blocked-endpoints-puppeteer.js        # Тест заблокированных endpoints
node all-endpoints-test.js                      # Полный тест (16 endpoints)
node quick-test.js                              # Быстрый тест базовых endpoints
```

### Использование как библиотеки

**Стандартный режим (без Cloudflare bypass):**
```javascript
const { HLTV } = require('./lib/index')
const matches = await HLTV.getMatches()
```

**Puppeteer режим (для обхода Cloudflare):**
```javascript
const { HLTV } = require('./lib/index')
const { createPuppeteerLoadPage, closePuppeteerBrowser } = require('./lib/puppeteer-loader')

const hltvPuppeteer = HLTV.createInstance({
  loadPage: createPuppeteerLoadPage()
})

const players = await hltvPuppeteer.getPlayerRanking()  // 1624 players, ~40s
await closePuppeteerBrowser()
```

### CI/CD

Нет настроенного CI/CD. Renovate bot видно из коммитов обновляет зависимости.

## Зависимости

### Критические зависимости

```json
{
  "got-scraping": "3.2.13",     // HTTP client (downgraded from 4.x - ESM incompatible)
  "cheerio": "^1.0.0",          // HTML парсинг (breaking changes from 0.x)
  "puppeteer-real-browser": "^1.3.8",  // Cloudflare bypass (добавлен 2025-03-16)
  "puppeteer-extra": "^3.3.6",
  "puppeteer-extra-plugin-stealth": "^2.11.2"
}
```

> **CRITICAL:** got-scraping 4.x несовместим (ESM only, проект использует CommonJS)

> **CRITICAL:** cheerio.default не существует в 1.0.0 (фикс в scraper.ts:107-110)

### Dev зависимости

```json
{
  "typescript": "5.8.2",
  "ts-jest": "29.2.6",
  "@types/node": "18.19.79"
}
```

## Внешние API

- **hltv.org** - единственный источник данных
  - Cloudflare protection на `/stats/*` endpoints
  - HTML структура меняется без версионирования
  - Нет официального API
  - Rate limiting: unknown (используется sleep 100-200ms между запросами)

## Мониторинг

### Метрики

Нет встроенных метрик.

### Логирование

Console.log в нескольких местах:
- `puppeteer-loader.ts:17` - "[Puppeteer] Launching browser..."
- `puppeteer-loader.ts:57` - "[Puppeteer] Cloudflare challenge detected..."
- `puppeteer-loader.ts:71` - "[Puppeteer] Error:"

> **UNKNOWN:** Система логирования в production не определена

## Тестирование

**Созданные тесты (не автоматизированы):**
- `all-endpoints-test.js` - 16 endpoints, ~10 минут
- `test-player-ranking-puppeteer.js` - 1 endpoint, ~40 секунд
- `test-blocked-endpoints-puppeteer.js` - 4 endpoints, ~90 секунд
- `quick-test.js` - 6 endpoints, <5 секунд

**Последние результаты (2025-03-16):**
- 12/16 endpoints работают без Puppeteer (75%)
- 3/4 заблокированных endpoints работают с Puppeteer (75%)
- getPlayerStats: partial failure (парсинг проблемы)

## Типовые проблемы

### 1. Cloudflare блокировки

**Endpoints блокированные Cloudflare:**
- `getPlayerRanking` ✓ решено через Puppeteer (~40s)
- `getPlayerStats` ⚠ частично работает
- `getMatchStats` ✓ решено через Puppeteer (~9s)
- `getTeamStats` ✓ решено через Puppeteer (~25s)

**Симптомы:**
```
Error: Access denied | www.hltv.org used Cloudflare to restrict access
```

**HTML содержит:**
```html
<title>Just a moment...</title>
"Checking your browser before accessing"
"Enable JavaScript and cookies to continue"
```

**Решение:** Использовать puppeteer-real-browser (см. раздел Запуск)

### 2. HTML структура изменилась

**Примеры сломанных селекторов:**
- `.liveMatch-container` → `[data-match-wrapper]` (fixed 2025-03-15)
- `.upcomingMatch` → `[data-match-wrapper]` (fixed 2025-03-15)
- `data-zonedgrouping-entry-unix` - отсутствует на featured results (fixed with null check)

**Решение:** Перехватывать HTML, сохранять в файлы, анализировать новую структуру

### 3. TypeScript compilation errors

**Проблема:**
```
error TS5055: Cannot write file 'lib/config.d.ts' because it would overwrite input file
```

**Причина:** `lib/` содержит старые .d.ts файлы

**Решение:**
```bash
rm -rf lib && npm run build
```

### 4. Puppeteer navigation conflicts

**Симптомы:**
```
Error: net::ERR_ABORTED at https://www.hltv.org/stats/...
```

**Причина:** Множественные одновременные вызовы `page.goto()`

**Решение:** Реализована очередь запросов в `puppeteer-loader.ts:37-42` + новая вкладка для каждого запроса (line 30)

### 5. Dependency incompatibilities

**got-scraping 4.x:**
```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined
```
**Решение:** Downgrade до 3.2.13

**cheerio 1.0.0:**
```
TypeError: cheerio.default is not a function
```
**Решение:** Переписан `scraper.ts:107-110`

## Неизвестные или странные части

### 1. generateRandomSuffix()

**Местоположение:** `utils.ts` (используется в getEvent, getPlayer, etc)

**Поведение:** Добавляет случайный суффикс к URL

**Назначение:** Предположительно для обхода кеша или rate limiting

> **TODO:** Проверить работает ли без него

### 2. Retry delays оптимизация

**Местоположение:** `utils.ts:102-108`

**Изменено:** 1-10s → 0.5-1s

**Причина изменения:** Таймауты на getResults (607s → <1s после оптимизации)

> **VERIFY:** Не вызывает ли это больше Cloudflare блокировок?

### 3. getResults pagination limit

**Код:** `getResults.ts:82`
```javascript
const maxPages = options.delayBetweenPageRequests !== undefined ? 100 : 1
```

**Поведение:** По умолчанию только 1 страница (100 results), если не указан delay

**Причина:** Исторически была бесконечная пагинация, вызывала таймауты

> **TODO:** Документировать это поведение для пользователей

### 4. Множественные HTTP запросы в getPlayerStats

**Код:** `getPlayerStats.ts:98-117`
```javascript
const [$, i$, m$] = await Promise.all([
  fetchPage('/stats/players/${id}/...'),
  fetchPage('/stats/players/individual/${id}/...'),
  fetchPage('/stats/players/matches/${id}/...')
])
```

**Назначение:** Загружает 3 разные страницы параллельно

> **UNKNOWN:** Почему данные разделены на 3 endpoints на hltv.org

### 5. .preload class в body

**Местоположение:** HTML hltv.org

> **UNKNOWN:** Назначение класса, удаляется ли он динамически?

### 6. Vulnerability count: 22-24

**Вывод npm install:**
```
22 vulnerabilities (2 low, 10 moderate, 7 high, 3 critical)
```

**Источник:** Предположительно Puppeteer и транзитивные зависимости

> **TODO:** Аудит безопасности перед production использованием

### 7. Два типа rating в getPlayerRanking

**Поле в результате:** `rating1: 1.27`

> **UNKNOWN:** Есть ли rating2? В чем разница? Почему только rating1?

---

## Дата фиксации

**Дата:** 2025-03-16

**Версия:** 3.5.0 (из package.json)

**Git branch:** master

**Last commit:** dd29189 (chore(deps): update dependency @types/node to v18.19.79)

**Статус репозитория:** Clean (no uncommitted changes)