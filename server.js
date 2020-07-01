// server.js
import express from 'express';
import fs from 'fs';
// import favicon form 'express-favicon';
import path from 'path';
const port = process.env.PORT || 8080;
const __dirname = path.resolve();
const app = express();
const mimetype = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.txt': 'text/plain',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.bmp': 'image/bmp',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.ttf': 'application/x-font-ttf',
	'.woff': 'application/x-font-woff',
	'.woff2': 'text/plain',
	'.fon': 'application/octet-stream',
	'.ogv': 'application/ogg',
	'.wav': 'audio/mpeg',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg'
};

function open(resp, urlA) {
	const url = urlA.replace(/^.*(\..*?)$/, '$1') === urlA ? `${urlA}.js` : urlA;
	const ext = url.replace(/^.*(\..+?)$/, '$1');
	const mime = mimetype[ext] || 'text/html';
	fs.readFile(url, (error, data) => {
		resp.writeHead(200, {
			'Content-Type': mime
		});
		resp.end(data);
	});
}
// app.use(favicon(__dirname + '/build/favicon.ico'));
// the __dirname is the current directory from where the script is running
app.get('/', (req, resp) => {
	open(resp, 'public/index.html');
});
app.get(/^\/(dist|public)\/.+$/, (req, resp) => {
	const url = req.url.substring(1);
	open(resp, url);
});
app.listen(port);
