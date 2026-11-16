import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

const routes = ['/', '/platform', '/tar', '/testovani', '/demo', '/faq', '/kontakt', '/aktuality', '/soukromi'];
const base = 'http://127.0.0.1:3145';
const app = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3145', '-H', '127.0.0.1'], {
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: 'pipe',
});
let messages = '';
app.stderr.on('data', chunk => { messages += chunk.toString().slice(0, 400); });
try {
  let ready = false;
  for(let i=0;i<50;i++){
    if(app.exitCode!==null) throw Error('Next server quit: '+messages);
    try {
      const response = await fetch(base+'/', { signal: AbortSignal.timeout(1200) });
      if(response.ok){ready=true;break;}
    } catch {}
    await sleep(250);
  }
  assert.ok(ready,'Next server did not start in time: '+messages);
  for(const path of routes){
    const response = await fetch(base+path, { signal: AbortSignal.timeout(6000) });
    assert.equal(response.status,200,'Expected 200 for '+path);
    const html = await response.text();
    assert.match(html,/<html[^>]+lang="cs"/,'Missing Czech html lang '+path);
    const canonical = 'https://www.dajc.cz'+path;
    assert.ok(html.includes('rel="canonical"') && html.includes(canonical), 'Missing canonical '+path);
    if(['/','/platform','/tar','/testovani','/demo'].includes(path)){
      assert.match(html,/hreflang="en"/i,'Missing English alternate '+path);
      assert.match(html,/hreflang="cs-CZ"/i,'Missing Czech alternate '+path);
    }
    if(['/testovani','/platform','/tar'].includes(path)) {
      assert.match(html,/<form\b/, 'Missing questionnaire form '+path);
    }
    process.stdout.write('OK '+path+'\n');
  }
  const sitemap=await fetch(base+'/sitemap.xml');
  assert.equal(sitemap.status,200,'Sitemap missing');
  const xml=await sitemap.text();
  for(const path of routes) assert.ok(xml.includes('www.dajc.cz'+path),'Missing sitemap route '+path);
  const robots=await fetch(base+'/robots.txt');
  assert.equal(robots.status,200,'Robots missing');
  console.log('Czech public smoke tests passed');
} finally {
  app.kill('SIGTERM');
}
