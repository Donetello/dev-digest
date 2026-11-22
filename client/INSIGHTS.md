# INSIGHTS — client

Живий журнал знахідок цього модуля: що неочевидно, що не спрацювало, що повторюється. Дописується skill'ом
`engineering-insights` (`.claude/skills/engineering-insights/`). Правила: тільки в потрібну секцію, один запис = одна
знахідка, дублі розширюємо, а не додаємо; застаріле видаляє людина під час консолідації. Остання ревізія: 2026-11-22.
Наскрізні знахідки проєкту (кілька модулів, Docker, CI, `vendor/shared`) — у [../INSIGHTS.md](../INSIGHTS.md).

Формат запису: `- **<назва>** · YYYY-MM-DD · confirmed|suspected` і 1-3 рядки «симптом → причина → що робити» + доказ.

## What Works
_Підходи й рішення, що спрацювали й неочевидні._

## What Doesn't Work
_Глухі кути й антипатерни: що пробували, чому не вийшло. Найцінніша секція._

## Codebase Patterns
_Конвенції й архітектурні рішення, яких немає в коді чи документації._

- **Лічильники severity рахують «після Hide low confidence, до фільтра severity»** · 2026-11-23 · confirmed
  Рахунок мусить збігатися зі списком, а список = `visibleFindings(findings, hideLow, severity)`; dismissed-знахідки в ньому
  лишаються (приглушені), тож рахуються теж, на відміну від `blockers` у шапці `ReviewRunAccordion` (CRITICAL без
  `dismissed_at`). Лічильники — з пропсів `findings`, після accept/dismiss `invalidateQueries(["reviews", prId])` оновлює їх
  без перезавантаження. Доказ: `FindingsPanel/{helpers.ts,FindingsPanel.tsx}`, `FindingsPanel.test.tsx`.
- **Контракт `Severity` без `INFO`, а `SEV`/`SEVERITY_ORDER` його мають** · 2026-11-23 · confirmed
  `z.enum(['CRITICAL','WARNING','SUGGESTION'])` у `vendor/shared/contracts/findings.ts`, тоді як `SEV` (vendor/ui tokens)
  і `SEVERITY_ORDER` містять `INFO`. Рядки за severity будуй по трьох рівнях контракту (`SEVERITY_LEVELS`), інакше типи
  `Record<Severity, …>` не зійдуться, а `INFO` ніколи не матиме знахідок.

## Tool & Library Notes
_Квірки залежностей, інструментів, версій, ОС._

## Recurring Errors & Fixes
_Повторювані помилки + фікс._

## Session Notes
_Датовані підсумки сесій (`### YYYY-MM-DD`)._

### 2026-11-23
Фіча «лічильники severity» у `FindingsPanel` (`SeverityCounters`, `helpers.countBySeverity`, фільтр поруч з «Hide low
confidence»). Скіл `engineering-insights` сам не спрацював: блок `[engineering-insights]` у контексті не з'явився, INSIGHTS
читав вручну за `CLAUDE.md`. Знахідки: (1) контракт `Severity` має лише CRITICAL/WARNING/SUGGESTION, а `SEV` ще й INFO —
рядок лічильників будуємо по трьох; (2) dismissed-знахідки лишаються в списку (приглушені), тож лічильники рахують їх теж,
інакше число розійдеться зі списком, а `blockers` у шапці їх виключає; (3) лічильники беруть дані після «Hide low
confidence» і до фільтра severity — тоді вони завжди збігаються зі списком; (4) спека суперечить собі: P3 вимагає «0» для
порожнього рівня, а останній скріншот каже «рівень з нулем не показується» — зроблено «0» (формат із P1); (5) на Windows
без python — правки CRLF-файлів робив node-скриптом, що нормалізує `\r\n`.
Seeded demo-PR `acme/payments-api#482` має порожній diff (`clone_path: null`, фейковий sha): всі три агенти повертають
`approve`/100 і «diff is empty», хоча сід-рев'ю бачить hardcoded Stripe-ключ — це не показник якості агентів.

## Open Questions
_Що лишилось нез'ясованим (з датою й наступним кроком)._

- **Рівень без знахідок: показувати «0» чи ховати?** · 2026-11-23 · open
  ТЗ «severity counters» суперечить собі: P1/P3 — формат з трьома рівнями й «0», а останній скріншот — «рівень з нулем не
  показується». Зараз показуємо `0`. Наступний крок: уточнити в ментора; якщо ховати — фільтр у `SeverityCounters.tsx`.
