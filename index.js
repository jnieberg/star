import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import http from 'http';
import path from 'path';
import webpack from 'webpack';

const __dirname = path.resolve();
const compiler = webpack({
	mode: 'development',
	watch: true,
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	stats: 'errors-only'
});
const watching = compiler.watch({
	// Example watchOptions
	aggregateTimeout: 300,
	poll: undefined
}, (err, stats) => {
	console.log(stats);
});

const myApp = express();
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
	console.log(url);
	const mime = mimetype[ext] || 'text/html';
	fs.readFile(url, (error, data) => {
		resp.writeHead(200, {
			'Content-Type': mime
		});
		resp.end(data);
	});
}

myApp.use(bodyParser.urlencoded({
	extended: true
}));
myApp.use(bodyParser.json());

process.env.TZ = 'Europe/Amsterdam';

myApp.get('/', (req, resp) => {
	open(resp, 'public/index.html');
});

// myApp.get('/liststars', (req, resp) => {
// 	let qs = querystring.parse(req.url.replace(/^.*?\?/, ''));
// 	qs = {
// 		posx: Number(qs.x),
// 		posy: Number(qs.y),
// 		posz: Number(qs.z),
// 		radius: Number(qs.radius),
// 		size: Number(qs.size),
// 		scale: Number(qs.scale)
// 	};
// 	resp.writeHead(200, {
// 		'Content-Type': 'application/json'
// 	});
// 	resp.end(JSON.stringify(starList(qs)));
// });

myApp.get(/^\/(dist|public)\/.+$/, (req, resp) => {
	const url = req.url.substring(1);
	open(resp, url);
});

const httpServer = http.createServer(myApp);
httpServer.listen(process.env.PORT || 8000);
