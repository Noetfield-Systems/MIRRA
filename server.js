'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const port=Number(process.env.PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.ico':'image/x-icon','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  const requested=decodeURIComponent(u.pathname);
  const file=requested==='/'?'index.html':requested.slice(1);
  const full=path.resolve(root,file);
  if(!full.startsWith(root+path.sep) && full!==path.join(root,'index.html')){res.writeHead(403);res.end();return;}
  fs.stat(full,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found');return;}
    const ext=path.extname(full);
    res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream','cache-control':ext==='.html'?'no-store':'public, max-age=900','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','x-frame-options':'DENY'});
    fs.createReadStream(full).pipe(res);
  });
}).listen(port,'0.0.0.0',()=>console.log('MIRRA listening on port '+port));
