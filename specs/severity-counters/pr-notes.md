# Module L01 — severity counters + перший прогін рев'юверів

## Що зроблено (ДЗ)
У `FindingsPanel` (тіло розгорнутого прогону на вкладці **Agent runs**) додано рядок лічильників
`N CRITICAL · N WARNING · N SUGGESTION`. Клік по рівню лишає у списку тільки його знахідки, клік по іншому рівню
переносить фільтр, повторний клік по активному — знімає. Активний рівень має рамку й фон кольору `SEV[level]`, решта
приглушені (стан видно і без наведення курсора).

Демо (64 с, з озвучкою): [`specs/severity-counters/demo.mp4`](https://github.com/Donetello/dev-digest/blob/Module-L01/specs/severity-counters/demo.mp4)

Файли (`client/`): `FindingsPanel/{SeverityCounters.tsx, helpers.ts, constants.ts, styles.ts, FindingsPanel.tsx,
FindingsPanel.test.tsx}`, `messages/en/prReview.json` (`panel.severityFilter`).

Цей PR також містить роботу з лабораторної: cost-бейдж (`specs/cost/`) і `CLAUDE.md` / `INSIGHTS.md` + скіл
`engineering-insights`.

## Критерії
- **P1** — лічильники за трьома рівнями; числа збігаються зі списком; клік фільтрує; фільтр знімається. Усе видно у відео.
- **P2** — клік не шле запитів (лічильники рахуються з пропсів `findings`; перевірено в браузері — запитів до API під час
  кліків немає); працює разом із *Hide low confidence* (обидві умови); кольори **й підписи** з `SEV`; підрахунок і фільтр
  покриті тестами; `pnpm test` (60 passed) і `pnpm typecheck` у `client/` зелені.
- **P3** — виділення активного рівня кольором severity, один активний рівень, повторний клік знімає.

## П'ять фаз
1. **Initiation** — прочитано `CLAUDE.md`, `client/INSIGHTS.md`; знайдено потік даних: `usePrReviews` →
   `ReviewRunAccordion` → `FindingsPanel` (`review.findings`; після accept/dismiss — `invalidateQueries(["reviews", prId])`).
2. **Planning** — чисті функції `countBySeverity` / `visibleFindings(…, severity)`, компонент лічильників, стан фільтра
   у `FindingsPanel` (там уже живе `hideLow`), тести.
   **Викинуто з плану:** окремий хук/запит до сервера (дані вже завантажені), зміни `vendor/ui` і `vendor/shared`,
   рівень `INFO` (у контракті `Severity` його немає), дубль підписів рівнів у `prReview.json` (беремо `SEV[level].label`).
3. **Implementation** — файли вище.
4. **Validation** — `pnpm test`, `pnpm typecheck`; вручну в браузері на PR #482 (сідовий прогін: 1 CRITICAL, 1 WARNING):
   лічильники, фільтр, перенос, зняття, відсутність запитів; демо-відео.
5. **Completion** — запис у `client/INSIGHTS.md`. Скіл `engineering-insights` **сам не спрацював**: сесію було відкрито
   в батьківській теці, а хуки лежать у `dev-digest/.claude/` — тому `INSIGHTS.md` читався і дописувався вручну.
   Сам хук робочий (ручний запуск `insights-context.mjs` віддає блок контексту).

## Рішення за неоднозначностями
- Лічильники рахують знахідки після *Hide low confidence* і до фільтра severity → завжди збігаються зі списком;
  dismissed-знахідки лишаються у списку, тож рахуються.
- Рівень без знахідок показує `0` (формат із P1).

## Прогін рев'юверів (до L02, без знань про проєкт)
Модель для всіх трьох агентів — `deepseek/deepseek-v4-flash` (OpenRouter), промпти — стартові з `docs/agent-prompts/`.

| PR | Агент | Прогонів | Вхідні токени | Знахідки | Verdict / score | Вартість |
|---|---|---|---|---|---|---|
| acme/payments-api #482 (demo) | General / Security / Performance | 1 | 2 657 / 1 642 / 1 862 | 0 / 0 / 0 | approve / 100 | ≈ $0.0001–0.0002 |
| Donetello/pomrok #3 (ESLint/Vitest/Sonar, 10 файлів) | General / Security / Performance | 1 | 5 522 / 4 399 / 5 844 | 0 / 0 / 0 | approve / 100 | ≈ $0.0001–0.0008 |
| Donetello/pomrok #1 (бойовий рушій + Telegram-бот, 14 файлів, +2606) | General / Security / Performance | 2 (той самий промпт) | 37 775 / 37 985 / 38 097 | 0 / 0 / 0 в обох | approve / 100 | $0.001–0.005 |

Спостереження:
1. **Базовий агент на слабкій моделі не знаходить нічого.** 12 прогонів — 12 `approve` з нулем знахідок, зокрема на PR
   з 2606 рядками нового коду. Grounding нічого не відсікав (`0/0 passed`) — модель сама повертає `findings: []`.
2. **Demo-PR #482 має порожній diff** (`clone_path: null`, патчів немає): агенти пишуть «diff is empty» і ставлять
   approve/100, хоча сідове рев'ю цього PR містить hardcoded Stripe-ключ. Порожній вхід → вакуумний approve, а не помилка.
3. **Той самий промпт двічі (pomrok #1):** verdict і кількість знахідок однакові, вхідні токени ідентичні; відрізняються
   вихідні токени (Performance: 1919 проти 868), час (20 с проти 10 с) і вартість (Security: $0.0011 проти $0.0052).
4. **Score розходиться з відповіддю моделі:** модель повертає `score: 95`, у БД і UI — 100 (застосунок перераховує score
   зі знахідок).
5. **Два репозиторії, один промпт:** на pomrok вхід у ~20 разів більший, ніж на demo-PR, а результат той самий — отже
   тут вирішує не розмір контексту. `repo_map`, `skills`, `specs`, `memory` у зібраному промпті — `null`: агент не знає про
   проєкт нічого, крім diff. Це база для порівняння після L02.
6. **Що я сам помітив би на pomrok #1, а агент пропустив** — не оцінено: потрібне ручне рев'ю цього PR.

Не зроблено (чесно):
- зміна system prompt агента і повторний прогін;
- той самий прогін через Claude Code для порівняння;
- прогін на сильнішій моделі (свідомо лишено стартову — тому демо показано на сідовому прогоні).
