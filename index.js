import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import http from 'http';
import path from 'path';
import webpack from 'webpack';

const __dirname = path.resolve();

const compiler = webpack({
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'raw-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|frag|vert)$/,
        loader: 'glslify-loader',
        exclude: /node_modules/,
      },
      { test: /node_modules/, loader: 'ify-loader' },
      { test: /\.json$/, loader: 'json-loader' },
    ],
  },
});
// eslint-disable-next-line no-unused-vars
const _ = compiler.watch(
  {
    aggregateTimeout: 300,
    poll: undefined,
  },
  (err, stats) => {
    console.log(stats);
  }
);

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
  '.ogg': 'audio/ogg',
};

function open(resp, urlA) {
  const url = urlA.replace(/^.*(\..*?)$/, '$1') === urlA ? `${urlA}.js` : urlA;
  const ext = url.replace(/^.*(\..+?)$/, '$1');
  const mime = mimetype[ext] || 'text/html';
  fs.readFile(url, (error, data) => {
    resp.writeHead(200, {
      'Content-Type': mime,
    });
    console.log(url);
    resp.end(data);
  });
}

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

process.env.TZ = 'Europe/Amsterdam';

app.get('/', (req, resp) => {
  open(resp, 'public/index.html');
});

app.get(/^\/(dist|public|src)\/.+$/, (req, resp) => {
  const url = req.url.substring(1);
  open(resp, url);
});

app.get('/*', (req, resp) => {
  const url = `dist/${req.url.substring(1)}`;
  open(resp, url);
});

const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 8000);
