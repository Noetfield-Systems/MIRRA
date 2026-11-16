'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {Pool}=require('pg');
const {scoreIPIP}=require('./ipip-data.cjs');
const PORT=Number(process.env.PORT||3000);
const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000}):null;
const root=__dirname;
const prod=process.env.NODE_ENV==='production';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const traffic=new Map();
const MINUTE=60000;
const random=(n=24)=>crypto.randomBytes(n).toString('base64url');
const sha=(s)=>crypto.createHash('sha256').update(s).digest('hex');
const clean=(s,n=300)=>typeof s==='string'?s.trim().slice(0,n):'';
const bad=(res,code,reason)=>send(res,code,{error:reason});
const send=(res,code,obj)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(obj))};
function cookie(req){const x=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('mirra_session='));return x?x.slice('mirra_session='.length):''}
function setSession(res,value,seconds){res.setHeader('set-cookie','mirra_session='+value+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+seconds+(prod?'; Secure':''))}
async function parseBody(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>64*1024)throw new Error('Body too large');chunks.push(chunk)}return chunks.length?JSON.parse(Buffer.concat(chunks).toString('utf8')):{}}
function accepted(answers,size,options=5){return Array.isArray(answers)&&answers.length===size&&answers.every(x=>Number.isInteger(x)&&x>=1&&x<=options)}
function passwordHash(password,salt){return crypto.scryptSync(password,salt,64).toString('hex')}
async function initialize(){
 if(!pool){console.warn('MIRRA: DATABASE_URL missing; accounts are temporarily unavailable');return}
 await pool.query(`
 CREATE TABLE IF NOT EXISTS mirra_users (id text PRIMARY KEY,email text UNIQUE NOT NULL,password_hash text NOT NULL,display_name text NOT NULL,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_sessions(token_hash text PRIMARY KEY,user_id text NOT NULL REFERENCES mirra_users(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL);
 CREATE TABLE IF NOT EXISTS mirra_reports(id text PRIMARY KEY,user_id text NOT NULL REFERENCES mirra_users(id) ON DELETE CASCADE,journey text NOT NULL,score jsonb NOT NULL,answers jsonb NOT NULL,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_journal(id text PRIMARY KEY,user_id text NOT NULL REFERENCES mirra_users(id) ON DELETE CASCADE,body text NOT NULL,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_invites(id text PRIMARY KEY,creator_id text NOT NULL REFERENCES mirra_users(id) ON DELETE CASCADE,creator_name text NOT NULL,creator_answers jsonb NOT NULL,guest_name text,guest_answers jsonb,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_entitlements(user_id text NOT NULL REFERENCES mirra_users(id) ON DELETE CASCADE,product text NOT NULL,source text NOT NULL,created_at timestamptz DEFAULT now(),PRIMARY KEY(user_id,product));
 CREATE TABLE IF NOT EXISTS mirra_events(id text PRIMARY KEY,kind text NOT NULL,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_stripe_events(id text PRIMARY KEY,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_guest_invites(id text PRIMARY KEY,creator_name text NOT NULL,creator_answers jsonb NOT NULL,guest_name text,guest_answers jsonb,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_funnel_events(id text PRIMARY KEY,visitor text NOT NULL,kind text NOT NULL,journey text NOT NULL,source text NOT NULL,day date NOT NULL DEFAULT CURRENT_DATE,created_at timestamptz DEFAULT now(),UNIQUE(visitor,kind,journey,day));
 CREATE TABLE IF NOT EXISTS mirra_feedback(id text PRIMARY KEY,area text NOT NULL,message text NOT NULL,created_at timestamptz DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_first_circle(email text PRIMARY KEY,interest text NOT NULL,source text NOT NULL,consent_at timestamptz NOT NULL DEFAULT now());
 CREATE TABLE IF NOT EXISTS mirra_billing_subscriptions(subscription_id text PRIMARY KEY,user_id text NOT NULL REFERENCES mirra_users(id) ON DELETE CASCADE,product text NOT NULL,status text NOT NULL,created_at timestamptz DEFAULT now());
 `);
}
async function findUser(req){if(!pool)return null;const tok=cookie(req);if(!tok)return null;const q=await pool.query('SELECT u.id,u.email,u.display_name,u.created_at FROM mirra_sessions s JOIN mirra_users u ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now()',[sha(tok)]);return q.rows[0]||null}
const safeUser=(u)=>({id:u.id,email:u.email,name:u.display_name,createdAt:u.created_at});
async function signIn(res,u){const tok=random(32);await pool.query("INSERT INTO mirra_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 days')",[sha(tok),u.id]);setSession(res,tok,30*86400);return send(res,200,{user:safeUser(u)})}
async function logEvent(kind){if(pool)await pool.query('INSERT INTO mirra_events(id,kind) VALUES($1,$2)',[crypto.randomUUID(),kind]).catch(()=>{})}
const questionsTogether=['When plans change, what helps you most?','When there is tension, what matters first?','What makes quality time meaningful?','What do you need after a demanding day?','When sharing a goal, what matters most?','What helps you feel heard?','How do you celebrate a small win?','What makes a relationship feel safe?'];
const styleLabels=['Clear conversation','A little space','Everyday warmth','Shared curiosity'];
function comparison(a,b){const count=z=>Array.from({length:4},(_,i)=>z.filter(x=>x===i+1).length),left=count(a),right=count(b);return {sharedChoices:a.filter((v,i)=>v===b[i]).length,total:8,first:styleLabels[left.indexOf(Math.max(...left))],second:styleLabels[right.indexOf(Math.max(...right))],patterns:questionsTogether.map((question,i)=>({question,similar:a[i]===b[i]})),note:'An invitation to talk, not a compatibility score or a prediction about a relationship.'}}
function promptGuide(message){const x=message.toLowerCase();let q='What feels most important to notice about this right now?';if(/partner|relationship|friend|love/.test(x))q='What do you wish the other person better understood about your experience?';else if(/work|choice|decision/.test(x))q='Which option feels closest to what you value, even if it is less familiar?';else if(/feel|worry|stress/.test(x))q='What might make today feel a little more manageable?';return {mode:'guided',answer:'One place to begin is with a specific moment rather than a fixed conclusion about yourself. '+q}}
function verifyStripe(req,raw){const secret=process.env.STRIPE_WEBHOOK_SECRET;if(!secret)return false;const header=String(req.headers['stripe-signature']||'');const t=/t=(\d+)/.exec(header)?.[1];const sig=/v1=([a-f0-9]+)/.exec(header)?.[1];if(!t||!sig||Math.abs(Date.now()/1000-Number(t))>300)return false;const expected=crypto.createHmac('sha256',secret).update(t+'.'+raw.toString('utf8')).digest('hex');return sig.length===expected.length&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}
async function stripeWebhook(req,res){
 const parts=[];let size=0;
 for await(const b of req){size+=b.length;if(size>100000)return bad(res,413,'Too large');parts.push(b)}
 const raw=Buffer.concat(parts);
 if(!verifyStripe(req,raw))return bad(res,401,'Invalid Stripe signature');
 const evt=JSON.parse(raw.toString('utf8'));
 if(!evt.id||typeof evt.id!=='string')return bad(res,400,'Invalid Stripe event');
 const payload=evt.data?.object||{};
 const linkMap={};
 for(const [product,key] of [['deepDive','MIRRA_STRIPE_LINK_DEEP_DIVE_ID'],['plus','MIRRA_STRIPE_LINK_PLUS_ID'],['together','MIRRA_STRIPE_LINK_TOGETHER_ID']]){
  const id=process.env[key];if(id&&id.startsWith('plink_'))linkMap[id]=product;
 }
 const tx=await pool.connect();
 try{
  await tx.query('BEGIN');
  const received=await tx.query('INSERT INTO mirra_stripe_events(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id',[evt.id]);
  if(!received.rowCount){await tx.query('COMMIT');return send(res,200,{received:true,duplicate:true})}
  if(evt.type==='checkout.session.completed'&&payload.payment_status==='paid'){
   const product=linkMap[clean(payload.payment_link,150)];
   const userId=clean(payload.client_reference_id,120);
   if(product&&userId){
    const user=await tx.query('SELECT id FROM mirra_users WHERE id=$1',[userId]);
    if(user.rowCount){
     await tx.query('INSERT INTO mirra_entitlements(user_id,product,source) VALUES($1,$2,$3) ON CONFLICT(user_id,product) DO UPDATE SET source=excluded.source',[userId,product,clean(payload.id,100)]);
     if((product==='plus'||product==='together')&&payload.subscription){
      await tx.query('INSERT INTO mirra_billing_subscriptions(subscription_id,user_id,product,status) VALUES($1,$2,$3,$4) ON CONFLICT(subscription_id) DO UPDATE SET status=excluded.status',[clean(payload.subscription,120),userId,product,'active']);
     }
    }
   }
  }
  if(['customer.subscription.updated','customer.subscription.deleted'].includes(evt.type)&&payload.id){
   const subId=clean(payload.id,120),status=evt.type==='customer.subscription.deleted'?'canceled':clean(payload.status,40);
   const found=await tx.query('UPDATE mirra_billing_subscriptions SET status=$2 WHERE subscription_id=$1 RETURNING user_id,product',[subId,status]);
   if(found.rowCount){
    const {user_id,product}=found.rows[0];
    const active=await tx.query("SELECT count(*)::int AS n FROM mirra_billing_subscriptions WHERE user_id=$1 AND product=$2 AND status IN ('active','trialing')",[user_id,product]);
    if(active.rows[0].n===0)await tx.query('DELETE FROM mirra_entitlements WHERE user_id=$1 AND product=$2',[user_id,product]);
    else await tx.query('INSERT INTO mirra_entitlements(user_id,product,source) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[user_id,product,subId]);
   }
  }
  await tx.query('COMMIT');
  return send(res,200,{received:true});
 }catch(e){await tx.query('ROLLBACK').catch(()=>{});throw e}finally{tx.release()}
}
function rate(req){const key=String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0];const now=Date.now();const h=traffic.get(key)||{ts:now,count:0};if(now-h.ts>MINUTE){h.ts=now;h.count=0}h.count++;traffic.set(key,h);if(traffic.size>4000){for(const [k,v] of traffic)if(now-v.ts>MINUTE)traffic.delete(k)}return h.count<85}
async function api(req,res,url){const p=url.pathname,m=req.method;
 if(m==='GET'&&p==='/api/health')return send(res,200,{ok:true,service:'MIRRA 2.0',database:Boolean(pool),ai:Boolean(process.env.OPENAI_API_KEY||process.env.DEEPSEEK_API_KEY)});
 if(m==='GET'&&p==='/api/config')return send(res,200,{accounts:Boolean(pool),ai:Boolean(process.env.OPENAI_API_KEY||process.env.DEEPSEEK_API_KEY),products:{deepDive:process.env.MIRRA_DEEP_DIVE_LINK||null,plus:process.env.MIRRA_PLUS_LINK||null,together:process.env.MIRRA_TOGETHER_LINK||null}});
 if(!pool)return bad(res,503,'Account service is not configured.');
 // Anonymous, privacy-conscious product metrics: an app-generated random browser ID; no IP, email or answers are persisted.
 if(m==='POST'&&p==='/api/funnel'){
  const d=await parseBody(req);const kinds=['landing_view','quiz_started','quiz_first_answer','quiz_completed','invite_created','invite_completed','daily_completed','share_clicked','return_visit','story_started'];
  const visitor=clean(d.visitor,40),kind=clean(d.kind,40),journey=clean(d.journey,40),source=clean(d.source,40);
  if(!/^[a-f0-9-]{36}$/.test(visitor)||!kinds.includes(kind)||!(/^[a-z0-9_-]{1,40}$/i.test(journey))||!(/^[a-z0-9_-]{0,40}$/i.test(source)))return bad(res,400,'Invalid event');
  await pool.query("DELETE FROM mirra_funnel_events WHERE created_at < now()-interval '30 days'").catch(()=>{});
  await pool.query('INSERT INTO mirra_funnel_events(id,visitor,kind,journey,source) VALUES($1,$2,$3,$4,$5) ON CONFLICT(visitor,kind,journey,day) DO NOTHING',[crypto.randomUUID(),visitor,kind,journey,source]);
  return send(res,202,{accepted:true});
 }
 if(m==='GET'&&p==='/api/funnel/summary'){
  const [q,journeys,sources,feedback,firstCircle]=await Promise.all([
    pool.query("SELECT count(DISTINCT visitor)::int AS anonymous_browsers, count(DISTINCT visitor) FILTER (WHERE kind='quiz_started')::int AS started_browsers, count(DISTINCT visitor) FILTER (WHERE kind='quiz_first_answer')::int AS engaged_browsers, count(DISTINCT visitor) FILTER (WHERE kind='quiz_completed')::int AS completed_browsers, count(DISTINCT visitor) FILTER (WHERE kind='return_visit')::int AS returning_browsers, count(DISTINCT visitor) FILTER (WHERE kind='share_clicked')::int AS sharing_browsers FROM mirra_funnel_events WHERE created_at>=now()-interval '7 days'"),
    pool.query("SELECT journey,count(DISTINCT visitor) FILTER(WHERE kind='quiz_started')::int AS started,count(DISTINCT visitor) FILTER(WHERE kind='quiz_first_answer')::int AS engaged,count(DISTINCT visitor) FILTER(WHERE kind='quiz_completed')::int AS completed FROM mirra_funnel_events WHERE created_at>=now()-interval '7 days' AND kind IN ('quiz_started','quiz_first_answer','quiz_completed') GROUP BY journey ORDER BY started DESC LIMIT 12"),
    pool.query("SELECT source,count(DISTINCT visitor)::int AS browsers FROM mirra_funnel_events WHERE created_at>=now()-interval '7 days' AND kind='landing_view' GROUP BY source ORDER BY browsers DESC LIMIT 12"),
    pool.query("SELECT area,count(*)::int AS submissions FROM mirra_feedback WHERE created_at>=now()-interval '7 days' GROUP BY area ORDER BY submissions DESC"),
    pool.query("SELECT count(*)::int AS opt_ins FROM mirra_first_circle")
  ]);
  return send(res,200,{windowDays:7,unit:'anonymous browser identifiers, not verified people',...q.rows[0],journeys:journeys.rows,sources:sources.rows,feedbackAreas:feedback.rows,firstCircleOptIns:firstCircle.rows[0]?.opt_ins||0});
 }
 if(m==='POST'&&p==='/api/first-circle'){
  const d=await parseBody(req),email=clean(d.email,160).toLowerCase(),interest=clean(d.interest,40),source=clean(d.source,40);
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||!['self','relationships','daily','curiosity'].includes(interest)||d.consent!==true||!(/^[a-z0-9_-]{0,40}$/i.test(source)))return bad(res,400,'Please provide a valid email and opt in explicitly.');
  await pool.query('INSERT INTO mirra_first_circle(email,interest,source) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET interest=excluded.interest,source=excluded.source,consent_at=now()',[email,interest,source]);
  return send(res,201,{joined:true});
 }
 if(m==='POST'&&p==='/api/feedback'){
  const d=await parseBody(req),message=clean(d.text,1000),area=clean(d.area,40);
  if(message.length<8||!['design','questions','relationships','daily','other'].includes(area))return bad(res,400,'Invalid feedback');
  await pool.query('INSERT INTO mirra_feedback(id,area,message) VALUES($1,$2,$3)',[crypto.randomUUID(),area,message]);
  return send(res,201,{received:true});
 }
 if(m==='POST'&&p==='/api/together-guest'){
  const d=await parseBody(req),name=clean(d.name,50);
  if(name.length<2||!accepted(d.answers,8,4))return bad(res,400,'Complete all eight questions and enter your first name.');
  const id=random(24);await pool.query('INSERT INTO mirra_guest_invites(id,creator_name,creator_answers) VALUES($1,$2,$3)',[id,name,JSON.stringify(d.answers)]);
  await logEvent('guest_invite_created');const origin=process.env.PUBLIC_ORIGIN||('https://'+req.headers.host);
  return send(res,201,{id,url:origin+'/?invite='+id});
 }

 if(p==='/api/stripe/webhook'&&m==='POST')return stripeWebhook(req,res);
 if(m==='GET'&&p==='/api/me'){const u=await findUser(req);if(!u)return send(res,200,{user:null,entitlements:[]});const q=await pool.query('SELECT product FROM mirra_entitlements WHERE user_id=$1',[u.id]);return send(res,200,{user:safeUser(u),entitlements:q.rows.map(x=>x.product)})}
 if(m==='POST'&&p==='/api/register'){const data=await parseBody(req),email=clean(data.email,150).toLowerCase(),pass=String(data.password||''),name=clean(data.name,70);if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||pass.length<10||pass.length>256||name.length<2||data.adult!==true)return bad(res,400,'Enter a valid email, a password of at least ten characters, your name, and confirm you are 18+.');const salt=random(16),id=crypto.randomUUID();try{await pool.query('INSERT INTO mirra_users(id,email,password_hash,display_name) VALUES($1,$2,$3,$4)',[id,email,salt+':'+passwordHash(pass,salt),name]);await logEvent('account_created');return signIn(res,{id,email,display_name:name})}catch(e){if(e.code==='23505')return bad(res,409,'This email already has an account.');throw e}}
 if(m==='POST'&&p==='/api/login'){const data=await parseBody(req),email=clean(data.email,150).toLowerCase(),pass=String(data.password||'');const q=await pool.query('SELECT * FROM mirra_users WHERE email=$1',[email]);const u=q.rows[0],parts=u?.password_hash?.split(':')||[];const actual=passwordHash(pass,parts[0]||'invalid-user'),expected=parts[1]||'0'.repeat(128);if(!u||actual.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return bad(res,401,'Email or password is incorrect.');return signIn(res,u)}
 if(m==='POST'&&p==='/api/logout'){const tok=cookie(req);if(tok)await pool.query('DELETE FROM mirra_sessions WHERE token_hash=$1',[sha(tok)]);setSession(res,'',0);return send(res,200,{ok:true})}
 const found=p.match(/^\/api\/together\/([A-Za-z0-9_-]{20,60})$/);
 if(m==='GET'&&found){let q=await pool.query('SELECT id,creator_name,creator_answers,guest_name,guest_answers,created_at FROM mirra_invites WHERE id=$1',[found[1]]);if(!q.rowCount){q=await pool.query("SELECT id,creator_name,creator_answers,guest_name,guest_answers,created_at FROM mirra_guest_invites WHERE id=$1 AND created_at>now()-interval '30 days'",[found[1]])}const x=q.rows[0];if(!x)return bad(res,404,'Invitation not found or expired');return send(res,200,{invite:{id:x.id,from:x.creator_name,complete:!!x.guest_answers,guestName:x.guest_name,comparison:x.guest_answers?comparison(x.creator_answers,x.guest_answers):null}})}
 const answerRoute=p.match(/^\/api\/together\/([A-Za-z0-9_-]{20,60})\/answer$/);
 if(m==='POST'&&answerRoute){const d=await parseBody(req);if(!accepted(d.answers,8,4)||clean(d.name,60).length<2)return bad(res,400,'Complete every question and enter a name.');let q=await pool.query('UPDATE mirra_invites SET guest_name=$1,guest_answers=$2 WHERE id=$3 AND guest_answers IS NULL RETURNING id',[clean(d.name,60),JSON.stringify(d.answers),answerRoute[1]]);
 if(!q.rowCount){q=await pool.query("UPDATE mirra_guest_invites SET guest_name=$1,guest_answers=$2 WHERE id=$3 AND guest_answers IS NULL AND created_at>now()-interval '30 days' RETURNING id",[clean(d.name,60),JSON.stringify(d.answers),answerRoute[1]])}
 if(!q.rowCount)return bad(res,409,'Invitation already completed or not found.');await logEvent('together_completed');return send(res,200,{ok:true})}
 const u=await findUser(req);
 if(!u)return bad(res,401,'Sign in to save your experience.');
 if(m==='GET'&&p==='/api/reports'){const q=await pool.query('SELECT id,journey,score,created_at FROM mirra_reports WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',[u.id]);return send(res,200,{reports:q.rows})}
 if(m==='POST'&&p==='/api/reports'){const d=await parseBody(req),journey=clean(d.journey,60),n=journey==='ipip50'?50:Number(d.answers?.length);if(!['ipip50','relationships','decisions','emotions','boundaries','values','social','resilience','habits','personality'].includes(journey)||!Number.isInteger(n)||n<8||n>60||!accepted(d.answers,n))return bad(res,400,'Complete the assessment first.');let score=journey==='ipip50'?scoreIPIP(d.answers):{label:clean(d.summary?.label,100)||'Your reflection',description:clean(d.summary?.description,500),exploratory:true};const id=crypto.randomUUID();await pool.query('INSERT INTO mirra_reports(id,user_id,journey,score,answers) VALUES($1,$2,$3,$4,$5)',[id,u.id,journey,JSON.stringify(score),JSON.stringify(d.answers)]);await logEvent('assessment_completed');return send(res,201,{id,score})}
 if(m==='GET'&&p==='/api/journal'){const q=await pool.query('SELECT id,body,created_at FROM mirra_journal WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[u.id]);return send(res,200,{entries:q.rows})}
 if(m==='POST'&&p==='/api/journal'){const d=await parseBody(req),body=clean(d.text,3000);if(body.length<2)return bad(res,400,'Write a little more before saving.');const id=crypto.randomUUID();await pool.query('INSERT INTO mirra_journal(id,user_id,body) VALUES($1,$2,$3)',[id,u.id,body]);await logEvent('journal_saved');return send(res,201,{id})}
 if(m==='GET'&&p==='/api/invites'){const q=await pool.query('SELECT id,creator_name,guest_name,(guest_answers IS NOT NULL) AS complete,created_at FROM mirra_invites WHERE creator_id=$1 ORDER BY created_at DESC LIMIT 40',[u.id]);return send(res,200,{invites:q.rows})}
 if(m==='POST'&&p==='/api/invites'){const d=await parseBody(req);if(!accepted(d.answers,8,4))return bad(res,400,'Answer all Together prompts first.');const id=random(24);await pool.query('INSERT INTO mirra_invites(id,creator_id,creator_name,creator_answers) VALUES($1,$2,$3,$4)',[id,u.id,u.display_name,JSON.stringify(d.answers)]);await logEvent('invite_created');const origin=process.env.PUBLIC_ORIGIN||('https://'+req.headers.host);return send(res,201,{id,url:origin+'/?invite='+id})}
 if(m==='POST'&&p==='/api/mirror'){const d=await parseBody(req),message=clean(d.message,1000);if(message.length<4)return bad(res,400,'Share a thought first.');const key=process.env.OPENAI_API_KEY||process.env.DEEPSEEK_API_KEY;if(!key)return send(res,200,promptGuide(message));const endpoint=process.env.OPENAI_API_KEY?'https://api.openai.com/v1/chat/completions':'https://api.deepseek.com/chat/completions';const model=process.env.MIRRA_AI_MODEL||(process.env.OPENAI_API_KEY?'gpt-4.1-mini':'deepseek-chat');const recent=await pool.query('SELECT journey,score FROM mirra_reports WHERE user_id=$1 ORDER BY created_at DESC LIMIT 3',[u.id]);const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),16000);try{const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({model,messages:[{role:'system',content:'You are MIRRA, a warm, concise non-clinical companion for self-reflection. Never diagnose or claim certainty. Ask one useful question. The user consented to this context: '+JSON.stringify(recent.rows).slice(0,1700)},{role:'user',content:message}],max_tokens:280}),signal:ctrl.signal});if(!response.ok)throw Error('Provider '+response.status);const json=await response.json();return send(res,200,{mode:'ai',answer:clean(json.choices?.[0]?.message?.content,1700)||promptGuide(message).answer})}catch(e){console.warn('MIRRA model fallback:',e.message);return send(res,200,promptGuide(message))}finally{clearTimeout(timer)}}
 if(m==='PUT'&&p==='/api/profile'){const d=await parseBody(req),name=clean(d.name,70);if(name.length<2)return bad(res,400,'Name is too short');await pool.query('UPDATE mirra_users SET display_name=$1 WHERE id=$2',[name,u.id]);return send(res,200,{name})}
 if(m==='GET'&&p==='/api/export'){const [reports,journal,invites]=await Promise.all([pool.query('SELECT journey,score,answers,created_at FROM mirra_reports WHERE user_id=$1',[u.id]),pool.query('SELECT body,created_at FROM mirra_journal WHERE user_id=$1',[u.id]),pool.query('SELECT id,creator_answers,guest_answers,created_at FROM mirra_invites WHERE creator_id=$1',[u.id])]);return send(res,200,{user:safeUser(u),reports:reports.rows,journal:journal.rows,invites:invites.rows})}
 if(m==='DELETE'&&p==='/api/account'){await pool.query('DELETE FROM mirra_users WHERE id=$1',[u.id]);setSession(res,'',0);return send(res,200,{deleted:true})}
 return bad(res,404,'Not found');
}
async function request(req,res){try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){if(!rate(req))return bad(res,429,'Too many requests.');if(req.method!=='GET'&&req.method!=='HEAD'){const o=req.headers.origin;if(o&&new URL(o).host!==req.headers.host)return bad(res,403,'Cross-site request blocked.');if(url.pathname!=='/api/stripe/webhook'&&!String(req.headers['content-type']||'').includes('application/json'))return bad(res,415,'Use JSON.')}return await api(req,res,url)}
 const sharePage=url.pathname.match(/^\/q\/([a-z0-9]+)\/?$/);const shareTitles={ipip50:'Discover your Big Five personality',relationships:'How do you connect with people?',emotions:'Make sense of your emotional world',decisions:'What guides your decisions?',boundaries:'What are your boundaries?',values:'What matters most to you?',social:'Discover your social rhythm',resilience:'How do you respond to change?',habits:'The shape of your days'};
 if(sharePage&&shareTitles[sharePage[1]]){const title=shareTitles[sharePage[1]];const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('MIRRA | The psychology of being human','MIRRA | '+title).replace('A more considered way to understand yourself and the people you love.','A thoughtful free reflection. No sign-up required to begin.');res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(html)}
 const p=url.pathname==='/'?'index.html':url.pathname==='/classic'?'classic.html':decodeURIComponent(url.pathname.slice(1));const file=path.resolve(root,p);if(!file.startsWith(root+path.sep))return bad(res,403,'Forbidden');fs.stat(file,(e,s)=>{if(e||!s.isFile()){res.writeHead(404);return res.end('Not found')}const ext=path.extname(file);res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream','cache-control':ext==='.html'?'no-store':'public,max-age=600','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','x-frame-options':'DENY'});fs.createReadStream(file).pipe(res)});
 }catch(e){console.error('Request failed',e);if(!res.headersSent)bad(res,e instanceof SyntaxError?400:500,'Unable to complete request.')}}
if(require.main===module)initialize().then(()=>http.createServer(request).listen(PORT,'0.0.0.0',()=>console.log('MIRRA 2.0 on port '+PORT))).catch(e=>{console.error('Database initialization failed:',e.message);process.exit(1)});
module.exports={initialize,request,comparison,accepted};