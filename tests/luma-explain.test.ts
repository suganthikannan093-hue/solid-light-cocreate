import {describe,it,expect} from 'vitest';
import {explainDecision,LUMA_LIMITS,LUMA_BUDGET} from '../src/game/luma-explain';
import {OfflineStrategyProvider,rectangle,goalFor} from '../src/game/engine';

describe('How LUMA thinks',()=>{
  it('explains a successful local-search decision without calling LUMA an LLM',()=>{
    const decision=new OfflineStrategyProvider().plan({revision:1,playerMask:rectangle(2,7,29,11,1),goal:goalFor(1),previousAttempts:[]});
    const text=explainDecision(decision,{strategy:'sturdy'});
    expect(text).toContain(LUMA_LIMITS);
    expect(text).toMatch(/not an LLM/i);
    expect(text.toLowerCase()).not.toMatch(/language model/);
    expect(text).toMatch(/Decision: commit depth/i);
    expect(text).toMatch(/candidate/i);
    expect(text).toContain(String(LUMA_BUDGET.maxCandidates));
    expect(decision.report.pass).toBe(true);
  });

  it('explains a disconnected-span failure as a human-owned length edit',()=>{
    const decision=new OfflineStrategyProvider().plan({revision:1,playerMask:rectangle(1,7,18,11,1),goal:goalFor(2),previousAttempts:[]});
    const text=explainDecision(decision);
    expect(decision.report.failures).toContain('DISCONNECTED_SPAN');
    expect(text).toMatch(/request a human edit/i);
    expect(text).toMatch(/cannot change amber depth, not cyan length|cannot see your intent|cannot invent|not cyan length/i);
    expect(text).toMatch(/Missing columns/i);
    expect(text).toMatch(/not an LLM/i);
    expect(text.toLowerCase()).not.toMatch(/language model/);
  });

  it('explains the idle state and the fixed search budget',()=>{
    const text=explainDecision(undefined);
    expect(text).toContain(LUMA_LIMITS);
    expect(text).toContain(`${LUMA_BUDGET.maxCandidates} candidate`);
    expect(text).toContain(`${LUMA_BUDGET.milliseconds} ms`);
  });
});
