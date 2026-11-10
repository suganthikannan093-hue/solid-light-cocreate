import type {AgentDecision, SearchBudget} from './engine.js';

export const LUMA_BUDGET: SearchBudget = {maxCandidates: 24, milliseconds: 800};

export const LUMA_LIMITS =
  'LUMA is a deterministic local search planner, not an LLM. It cannot see your intent. It only scores geometry against walkability, clearance, shelter and its fixed search budget.';

export function explainDecision(
  decision: AgentDecision | undefined,
  options: {strategy?: 'sturdy' | 'efficient'; budget?: SearchBudget} = {},
): string {
  const budget = options.budget ?? LUMA_BUDGET;
  const strategy = options.strategy ?? 'sturdy';
  const header = LUMA_LIMITS;
  if (!decision) {
    return `${header}\n\nNo test yet. Draw a closed loop and release; LUMA will search up to ${budget.maxCandidates} candidate depths for at most ${budget.milliseconds} ms and pick the best valid solid, or ask you to edit what only you can change.`;
  }
  const tested = decision.attempts.length;
  const passed = decision.attempts.filter((attempt) => attempt.pass);
  const best = passed.slice().sort((a, b) => b.score - a.score)[0];
  const elapsed = Math.max(0, Math.round(decision.elapsed));
  const lines = [
    header,
    '',
    `Search: ${tested} candidate side profile${tested === 1 ? '' : 's'} in ${elapsed} ms (budget ${budget.maxCandidates} candidates / ${budget.milliseconds} ms). Preference: ${strategy}.`,
  ];
  if (best) {
    lines.push(
      `Decision: commit depth ${best.width} wide at deck ${best.deck}. Score ${best.score} (higher is a leaner valid solid that still matches the preferred width).`,
    );
  } else {
    const failure = decision.report.failures[0] ?? 'no valid solid';
    const columns = decision.report.diagnostics[0]?.columns ?? [];
    const gap = columns.length ? ` Missing columns: ${columns.join(', ')}.` : '';
    lines.push(`Decision: request a human edit (${failure}). No candidate cleared every constraint.${gap}`);
    lines.push('Limit: LUMA can change amber depth, not cyan length or height. A short outline cannot be repaired from the side view.');
  }
  if (decision.report.cost != null && decision.report.budget != null) {
    lines.push(`Light used: ${decision.report.cost} / ${decision.report.budget}.`);
  }
  return lines.join('\n');
}
