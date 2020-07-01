// server.js
import express from 'express';
// import favicon form 'express-favicon';
import path from 'path';
const port = process.env.PORT || 8080;
const app = express();
const __dirname = path.resolve();

// app.use(favicon(__dirname + '/build/favicon.ico'));
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/ping', (req, res) => {
	return res.send('pong');
});
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', '/index.html'));
});
app.listen(port);
