# Severity counters — чернетка опису PR

## Що зроблено
У `FindingsPanel` (тіло розгорнутого прогону на вкладці Agent runs) додано рядок лічильників
`N CRITICAL · N WARNING · N SUGGESTION`. Клік по рівню лишає у списку тільки його знахідки; повторний клік знімає
фільтр, клік по іншому рівню переносить його. Активний рівень — рамка + фон кольору `SEV[level]`, решта приглушені.

Файли (`client/`): `FindingsPanel/{SeverityCounters.tsx, helpers.ts, constants.ts, styles.ts, FindingsPanel.tsx,
FindingsPanel.test.tsx}`, `messages/en/prReview.json` (`panel.severity.*`, `panel.severityFilter`).

## П'ять фаз
1. **Initiation** — прочитано `CLAUDE.md`, `client/INSIGHTS.md`; знайдено потік: `ReviewRunAccordion` → `FindingsPanel`
   (`review.findings`; після accept/dismiss — `invalidateQueries(["reviews", prId])`).
2. **Planning** — чисті функції `countBySeverity`/`visibleFindings(…, severity)`, компонент-лічильники, стан фільтра
   у `FindingsPanel` (там вже живе `hideLow`), тексти в `prReview.json`, тести.
   Викинуто з плану: окремий хук/запит до сервера (дані вже завантажені), зміни `vendor/ui` і `vendor/shared`.
3. **Implementation** — файли вище; правки CRLF-файлів node-скриптом (python на машині немає).
4. **Validation** — `pnpm test` (60 passed) і `pnpm typecheck` зелені; нові тести: підрахунок, фільтр, зняття/перенос,
   комбінація з Hide low confidence, empty state. У браузері не перевірено (скріншоти/відео — вручну).
5. **Completion** — запис у `client/INSIGHTS.md`; скіл `engineering-insights` сам не спрацював, читав вручну.

## Рішення за неоднозначностями
- Лічильники рахують знахідки після «Hide low confidence» і до фільтра severity → завжди збігаються зі списком;
  dismissed-знахідки лишаються в списку, тож рахуються.
- Рівень без знахідок показує `0` (P3); скріншот у ТЗ каже «не показується» — суперечність, обрано P3/P1-формат.
- `INFO` не показуємо: контракт `Severity` має три значення.

## Прогін рев'юверів (до L02, без знань про проєкт)
| PR | General | Security | Performance |
|---|---|---|---|
| acme/payments-api #482 (demo, seeded) | approve/100, 0 | approve/100, 0 | approve/100, 0 |
| Donetello/pomrok #3 (ESLint/Vitest/Sonar, 9 файлів) | approve/95, 0 | approve/**0**, 0 | approve/95, 0 |

Спостереження:
1. Demo-PR #482 має **порожній diff** (`clone_path: null`, фейковий sha) — усі агенти пишуть «diff is empty» і ставлять
   approve/100, не побачивши hardcoded Stripe-ключ зі сід-рев'ю. Порожній вхід → вакуумний approve замість помилки.
2. На реальному PR #3 (лише тулінг/CI) 0 знахідок правдоподібні; recall треба перевіряти на PR із вадами.
3. Security Reviewer: verdict `approve` зі score `0` — неузгодженість score і verdict.
4. Агенти не знають проєкту (конвенцій, стеку) — на L02 порівняти кількість знахідок і score.
5. Вартість ≈ $0.0001–0.0008 за прогін (deepseek-v4-flash), час 1–13 с.
