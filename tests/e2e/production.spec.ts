import {test,expect} from '@playwright/test';
import desktopQA from '../../scripts/desktop-qa.mjs';
test('production full offline planner playthrough, both levels and recovery',async({page})=>{
 const failures:string[]=[];page.on('requestfailed',r=>failures.push(r.url()+': '+r.failure()?.errorText));
 await page.goto('/');await page.waitForFunction(()=>!!(window as unknown as {solidLight:unknown}).solidLight);
 await page.waitForLoadState('networkidle');await page.context().setOffline(true);
 const result=await desktopQA({page,frame:page.mainFrame(),workspaceRoot:process.cwd()});expect(result.errors).toEqual([]);expect(failures).toEqual([]);
 await page.setViewportSize({width:800,height:720});await expect(page.getByRole('button',{name:'Help',exact:true})).toBeVisible();
 await page.context().setOffline(false);await page.reload();await expect(page.getByRole('button',{name:'Level 1',exact:true})).toBeVisible();
});
