/* SeverityCounters — "3 CRITICAL · 5 WARNING · 2 SUGGESTION" row. Each level is
   a toggle button: click keeps only that severity in the list, click on the
   active level clears the filter. Colors come from SEV (vendor/ui tokens). */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SEV } from "@devdigest/ui";
import type { Severity } from "@devdigest/shared";
import { SEVERITY_LEVELS } from "./constants";
import { s } from "./styles";

export function SeverityCounters({
  counts,
  active,
  onChange,
}: {
  counts: Record<Severity, number>;
  active: Severity | null;
  onChange: (next: Severity | null) => void;
}) {
  const t = useTranslations("prReview");
  return (
    <div style={s.counters} role="group" aria-label={t("panel.severityFilter")}>
      {SEVERITY_LEVELS.map((sev, i) => {
        const isActive = active === sev;
        const dimmed = active !== null && !isActive;
        return (
          <React.Fragment key={sev}>
            {i > 0 && <span aria-hidden style={s.counterSep}>·</span>}
            <button
              type="button"
              data-severity={sev}
              aria-pressed={isActive}
              onClick={() => onChange(isActive ? null : sev)}
              style={s.counter(SEV[sev].c, SEV[sev].bg, isActive, dimmed)}
            >
              <span className="tnum">{counts[sev]}</span> {t(`panel.severity.${sev}`)}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
