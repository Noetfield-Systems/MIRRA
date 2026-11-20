'use strict';
const app = require('../server.js');
let initPromise;
module.exports = async function mirraHandler(req,res) {
 if (!initPromise) initPromise = app.initialize();
 try { await initPromise; }
 catch (err) { console.error('MIRRA initialization failed:',err.message); res.statusCode=503; return res.end('MIRRA data service is temporarily unavailable'); }
 return app.request(req,res);
};
