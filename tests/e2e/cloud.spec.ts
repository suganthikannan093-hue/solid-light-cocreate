import {clickControl} from '../../scripts/ui-controls.mjs';
import {test,expect} from '@playwright/test';
import desktopQA from '../../scripts/desktop-qa.mjs';
test('optional cloud requires consent and backend outage preserves both levels',async({page})=>{
 let requests=0;await page.route('https://cloud.test/strategy',async route=>{requests++;await route.fulfill({status:503,headers:{'Access-Control-Allow-Origin':'*','Content-Type':'application/json'},body:'{"error":"unavailable"}'});});
 await page.goto('./?cloud=https%3A%2F%2Fcloud.test%2Fstrategy');await page.waitForFunction(()=>!!window.solidLight);expect(requests).toBe(0);
 await clickControl(page,'Enable paid cloud');const result=await desktopQA({page,frame:page.mainFrame(),workspaceRoot:process.cwd()});expect(result.errors).toEqual([]);expect(requests).toBeGreaterThan(0);expect(requests).toBeLessThanOrEqual(3);
});
