export default async function({frame}){await frame.getByRole('button',{name:'Level 1',exact:true}).click();return {ready:true};}
