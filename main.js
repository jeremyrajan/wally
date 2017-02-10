#!/usr/bin/env node

const wally = require('./index');

wally.init()
  .then(() => {
    setTimeout(() => {
      process.exit(1);
    }, 1500)
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
