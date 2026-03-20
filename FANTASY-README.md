# HLTV Fantasy Integration

## Обзор

Добавлен полный функционал для работы с HLTV Fantasy через MCP сервер. Теперь можно:
- Получать список доступных Fantasy турниров
- Просматривать доступных игроков для турнира
- Создавать и управлять своей Fantasy командой
- Смотреть таблицу лидеров

## ⚠️ Требуется авторизация

**ВАЖНО**: Fantasy функционал требует авторизации на HLTV.org. При авторизации появляется капча, которую нужно пройти один раз вручную.

## Быстрый старт

### Шаг 1: Авторизация

Запустите скрипт авторизации:

```bash
npm run login
```

**Что произойдет:**
1. Откроется браузер на странице входа HLTV
2. Поля логин/пароль будут заполнены автоматически (vlafoy:k9TijYTH)
3. **ВЫ ДОЛЖНЫ ПРОЙТИ КАПЧУ ВРУЧНУЮ**
4. Нажмите кнопку "Login"
5. После успешного входа cookies сохранятся в файл `.hltv-cookies.json`
6. Браузер автоматически закроется

**Примечание**: Авторизацию нужно пройти только один раз. Cookies будут использоваться для всех последующих запросов.

### Шаг 2: (Опционально) Исследование API

Если нужно узнать точные endpoints Fantasy API, запустите:

```bash
npm run research-fantasy
```

Этот скрипт:
1. Откроет авторизованный браузер на странице Fantasy
2. Будет отслеживать все HTTP запросы
3. Сохранит найденные endpoints в `fantasy-api-endpoints.json`

**Как использовать:**
1. Скрипт откроет браузер и покажет страницу Fantasy
2. Взаимодействуйте со страницей (создавайте команды, смотрите игроков и т.д.)
3. Все HTTP запросы будут логироваться в консоль
4. Нажмите Ctrl+C когда закончите
5. Endpoints сохранятся в JSON файл

### Шаг 3: Обновление MCP сервера

После исследования API вам может потребоваться обновить endpoints. Они находятся в:
- `src/endpoints/getFantasyTournaments.ts`
- `src/endpoints/getFantasyPlayers.ts`
- `src/endpoints/getFantasyTeam.ts`
- `src/endpoints/getFantasyLeaderboard.ts`

После изменений перекомпилируйте проект:

```bash
npm run build
```

### Шаг 4: Использование в Claude Code

После авторизации и компиляции, Fantasy tools доступны в Claude Code через MCP:

```
hltv_fantasy_get_tournaments - Получить доступные турниры
hltv_fantasy_get_players - Получить игроков для турнира
hltv_fantasy_get_team - Получить свою команду
hltv_fantasy_create_team - Создать/обновить команду
hltv_fantasy_get_leaderboard - Посмотреть таблицу лидеров
```

## Примеры использования

### В Claude Code

```
Покажи мне доступные Fantasy турниры на HLTV
```

Claude вызовет `hltv_fantasy_get_tournaments` и покажет список.

```
Получи список игроков для турнира 12345
```

Claude вызовет `hltv_fantasy_get_players` с tournamentId: 12345

```
Создай команду для турнира 12345 с игроками [1001, 1002, 1003, 1004, 1005]
```

Claude вызовет `hltv_fantasy_create_team` с указанными параметрами

### В коде (если используете библиотеку напрямую)

```javascript
import { HLTV } from 'hltv'

// Fantasy endpoints требуют авторизации - убедитесь что запустили npm run login

// Получить турниры
const tournaments = await HLTV.getFantasyTournaments()
console.log(tournaments)

// Получить игроков
const players = await HLTV.getFantasyPlayers({ tournamentId: 12345 })
console.log(players)

// Получить свою команду
const myTeam = await HLTV.getFantasyTeam(12345)
console.log(myTeam)

// Создать команду
const newTeam = await HLTV.createFantasyTeam({
  tournamentId: 12345,
  playerIds: [1001, 1002, 1003, 1004, 1005]
})
console.log(newTeam)

// Таблица лидеров
const leaderboard = await HLTV.getFantasyLeaderboard({
  tournamentId: 12345,
  page: 1
})
console.log(leaderboard)
```

## Структура файлов

```
src/
├── auth/
│   ├── login.ts                      # Авторизация и сохранение cookies
│   └── authenticated-load-page.ts    # HTTP клиент с авторизацией
├── endpoints/
│   ├── getFantasyTournaments.ts      # Получение турниров
│   ├── getFantasyPlayers.ts          # Получение игроков
│   ├── getFantasyTeam.ts             # Управление командой
│   └── getFantasyLeaderboard.ts      # Таблица лидеров
└── mcp-server.ts                     # MCP сервер с Fantasy tools

login-cli.ts                          # CLI для авторизации
research-fantasy-api.ts               # Скрипт исследования API
.hltv-cookies.json                    # Сохраненные cookies (создается после login)
fantasy-api-endpoints.json            # Найденные endpoints (создается после research)
```

## Технические детали

### Авторизация

- Используется Puppeteer для открытия браузера
- Капча проходится вручную пользователем
- Cookies сохраняются в `.hltv-cookies.json`
- Срок жизни cookies: обычно несколько недель/месяцев

### HTTP запросы

- Используется `got-scraping` для имитации реального браузера
- Cookies автоматически добавляются ко всем запросам
- Поддержка HTTP/2 для лучшей совместимости

### Обработка ошибок

Если Fantasy endpoints возвращают ошибки:
1. **401/403** - Авторизация истекла, запустите `npm run login` снова
2. **404** - Неправильный tournamentId или endpoint URL
3. **Cloudflare error** - Попробуйте через некоторое время

### Безопасность

**⚠️ ВАЖНО**:
- Файл `.hltv-cookies.json` содержит сессионные cookies
- НЕ коммитьте этот файл в git
- Добавьте `.hltv-cookies.json` в `.gitignore`

Уже добавлено в `.gitignore`:
```
.hltv-cookies.json
fantasy-api-endpoints.json
```

## Следующие шаги

1. ✅ Авторизация реализована
2. ✅ Базовые Fantasy endpoints созданы
3. ⏳ **НУЖНО**: Запустить `npm run research-fantasy` для исследования реальных API endpoints
4. ⏳ **НУЖНО**: Обновить HTML парсеры в endpoints на основе реальной структуры
5. ⏳ **НУЖНО**: Протестировать все Fantasy функции

## Известные проблемы

1. **HTML парсеры - заглушки**: Текущие endpoints используют предполагаемые селекторы. После исследования API нужно обновить их на реальные.

2. **API endpoints могут быть другими**: URL endpoints (например `/api/fantasy/team/get`) нужно будет обновить после исследования.

3. **Структура данных**: Форматы response могут отличаться от ожидаемых.

## Решение: Исследование API

Запустите `npm run research-fantasy` и:
1. Изучите какие HTTP запросы делает сайт
2. Обновите endpoints в файлах `src/endpoints/getFantasy*.ts`
3. Исправьте HTML селекторы и API URLs
4. Пересоберите проект: `npm run build`

## FAQ

**Q: Как часто нужно логиниться заново?**
A: Обычно cookies живут несколько недель. Когда они истекут, вы получите 401/403 ошибки - тогда запустите `npm run login` снова.

**Q: Что делать если капча не появляется?**
A: Это хорошо! Просто нажмите "Login". HLTV не всегда показывает капчу.

**Q: Можно ли автоматизировать прохождение капчи?**
A: Технически возможно через сервисы вроде 2captcha, но это дорого и против ToS HLTV. Проще пройти один раз вручную.

**Q: Безопасно ли хранить cookies в файле?**
A: Cookies дают доступ к вашему аккаунту. Не делитесь файлом `.hltv-cookies.json`. Он в .gitignore, чтобы случайно не закоммитить.

**Q: Endpoints не работают - что делать?**
A: Запустите `npm run research-fantasy`, изучите реальные HTTP запросы и обновите код endpoints.

## Поддержка

Если возникли проблемы:
1. Проверьте что авторизация прошла успешно (должен быть файл `.hltv-cookies.json`)
2. Проверьте что проект скомпилирован (`npm run build`)
3. Запустите исследование API (`npm run research-fantasy`)
4. Обновите endpoints на основе найденной информации
