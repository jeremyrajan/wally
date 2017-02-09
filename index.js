const ora = require('ora');
const wallpaper = require('wallpaper');
const request = require('request').forever();
const fs = require('fs');
const path = require('path');
const getImage = require('download-file');
const randomInt = require('random-int');
const emoji = require('node-emoji');
const os = require('os');
const TMPDIR = os.tmpdir();

const wallpaperFile = `wallpaper_${randomInt(10000)}.jpg`;

const requestUrl = 'https://wallpaper-backend.herokuapp.com/hello';
const spinner = ora('Contacting Wally Service...').start();

const contactApi = () => {
  return new Promise((resolve, reject) => {
    request(requestUrl, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      if (response.statusCode !== 200) {
        return reject(`Incorrect response, ${JSON.stringify(response)}`);
      }

      spinner.text = 'Got response, processing image...';
      spinner.color = 'green';
      resolve(JSON.parse(body).fullHDURL);
    });
  });
};

const download = (url, dest) => {
  spinner.text = 'Got it, downloading image...';
  spinner.color = 'yellow';
  return new Promise((resolve, reject) => {
    getImage(url, {
      directory: TMPDIR,
      filename: wallpaperFile,
      timeout: 500000
    }, (err) => {
      if (err) return reject(err);
      return resolve(dest);
    })
  });
};

const setWallpaper = (imagePath) => {
  return wallpaper.set(imagePath)
    .then(() => Promise.resolve())
    .catch(err => Promise.reject(err));
};

const clean = (filePath = path.join(TMPDIR, wallpaperFile)) => {
  try{
    fs.unlinkSync(filePath);
  } catch(e) {}
};

contactApi()
  .then(wallpaperUrl => download(wallpaperUrl, path.join(TMPDIR, wallpaperFile)))
  .then((wallpaperPath) => {
    spinner.text = 'Image downloaded, setting wallpaper...';
    spinner.color = 'magenta';
    return setWallpaper(wallpaperPath);
  })
  .then((val) => {
    spinner.text = `Wallpaper set. Check out your shiny new desktop ${emoji.get('smile')}   `;
    setTimeout(() => {
      clean();
      process.exit(1);
    }, 1000); // give it some time to stop.
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });

