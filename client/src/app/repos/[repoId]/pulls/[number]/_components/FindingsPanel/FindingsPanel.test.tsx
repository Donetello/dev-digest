import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";

vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useFindingAction: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { FindingsPanel } from "./FindingsPanel";
import { countBySeverity, visibleFindings } from "./helpers";

afterEach(cleanup);

const FINDINGS: FindingRecord[] = [
  {
    id: "f1",
    severity: "CRITICAL",
    category: "security",
    title: "Hardcoded secret",
    file: "src/config.ts",
    start_line: 11,
    end_line: 11,
    rationale: "A secret is committed.",
    suggestion: null,
    confidence: 0.95,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  },
];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("FindingsPanel (smoke)", () => {
  it("renders the toolbar + a finding card", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    expect(screen.getByText("Hide low confidence")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", () => {
    renderWithIntl(<FindingsPanel findings={[]} prId="pr1" />);
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});

const mk = (id: string, severity: FindingRecord["severity"], confidence = 0.9): FindingRecord => ({
  ...FINDINGS[0]!,
  id,
  severity,
  title: `finding ${id}`,
  confidence,
});
const MIXED: FindingRecord[] = [
  mk("c1", "CRITICAL"),
  mk("w1", "WARNING"),
  mk("w2", "WARNING", 0.3),
  mk("s1", "SUGGESTION"),
];
const counter = (sev: string) => document.querySelector(`button[data-severity="${sev}"]`) as HTMLElement;

describe("severity helpers", () => {
  it("counts per level, zero for missing levels", () => {
    expect(countBySeverity(MIXED)).toEqual({ CRITICAL: 1, WARNING: 2, SUGGESTION: 1 });
    expect(countBySeverity([])).toEqual({ CRITICAL: 0, WARNING: 0, SUGGESTION: 0 });
  });
  it("applies severity and confidence filters together", () => {
    expect(visibleFindings(MIXED, false, "WARNING").map((f) => f.id)).toEqual(["w1", "w2"]);
    expect(visibleFindings(MIXED, true, "WARNING").map((f) => f.id)).toEqual(["w1"]);
  });
});

describe("FindingsPanel severity counters", () => {
  it("renders counts that match the list", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    expect(counter("CRITICAL")).toHaveTextContent("1 CRITICAL");
    expect(counter("WARNING")).toHaveTextContent("2 WARNING");
    expect(counter("SUGGESTION")).toHaveTextContent("1 SUGGESTION");
  });

  it("filters by a level and clears on second click", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(counter("WARNING"));
    expect(screen.getByText("finding w1")).toBeInTheDocument();
    expect(screen.queryByText("finding c1")).not.toBeInTheDocument();
    expect(counter("WARNING")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(counter("CRITICAL")); // moves selection
    expect(counter("WARNING")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("finding c1")).toBeInTheDocument();
    expect(screen.queryByText("finding w1")).not.toBeInTheDocument();
    fireEvent.click(counter("CRITICAL")); // clears
    expect(screen.getByText("finding w1")).toBeInTheDocument();
    expect(screen.getByText("finding s1")).toBeInTheDocument();
  });

  it("combines with hide low confidence and shows the empty state", () => {
    renderWithIntl(<FindingsPanel findings={[mk("c1", "CRITICAL", 0.2)]} prId="pr1" />);
    expect(counter("CRITICAL")).toHaveTextContent("1 CRITICAL");
    fireEvent.click(counter("CRITICAL"));
    fireEvent.click(screen.getByRole("switch"));
    expect(counter("CRITICAL")).toHaveTextContent("0 CRITICAL");
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});
