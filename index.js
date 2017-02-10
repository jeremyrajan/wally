const ora = require('ora');
const wallpaper = require('wallpaper');
const request = require('request').forever();
const fs = require('fs');
const path = require('path');
const getImage = require('download-file');
const randomInt = require('random-int');
const emoji = require('node-emoji');
const os = require('os');
const boxen = require('boxen');
const TMPDIR = os.tmpdir();
let spinner;

const wallpaperFile = `wallpaper_${randomInt(10000)}.jpg`;
const requestUrl = 'https://wallpaper-backend.herokuapp.com/hello';

const contactApi = () => {
  return new Promise((resolve, reject) => {
    request(requestUrl, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      if (response.statusCode !== 200) {
        return reject(`Incorrect response, ${JSON.stringify(response)}`);
      }

      spinner.text = `${emoji.get('rainbow')}  Got response, processing image...`;
      spinner.color = 'green';
      resolve(JSON.parse(body).fullHDURL);
    });
  });
};

const download = (url, dest) => {
  spinner.text = `${emoji.get('sparkles')}  Got it, downloading image...`;
  spinner.color = 'yellow';
  return new Promise((resolve, reject) => {
    getImage(url, {
      directory: TMPDIR,
      filename: wallpaperFile,
      timeout: 500000
    }, (err) => {
      if (err) return reject(err);
      return resolve(dest);
    });
  });
};

const clean = (filePath = path.join(TMPDIR, wallpaperFile)) => {
  try {
    fs.unlinkSync(filePath);
  } catch (e) { }
};

module.exports = {
  init() {
    spinner = ora(`${emoji.get('zap')}  Contacting Wally Service...`).start();
    return contactApi()
      .then(wallpaperUrl => download(wallpaperUrl, path.join(TMPDIR, wallpaperFile)))
      .then(wallpaperPath => wallpaper.set(wallpaperPath))
      .then(() => {
        spinner.text = `${emoji.get('tada')}  Wallpaper set. Check out your shiny new desktop. `;
        clean();
        console.log('\n');
        console.log(boxen(`${emoji.get('heart')}  All images are powered by pixabay.com  ${emoji.get('heart')} `));
      })
      .catch(err => err);
  }
}

