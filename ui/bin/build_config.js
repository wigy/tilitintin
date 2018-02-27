#!/usr/bin/env node
const fs = require('fs');

const SRC = '../src/config.js';
const DST = './src/Configuration.js';

console.log("Building configuration from `" + SRC + "` to `" + DST + "`.");
const src = require(SRC);

let file = `
///////////////////////////////////////////////
/// AUTOMATICALLY GENERATED - DO NOT CHANGE ///
///////////////////////////////////////////////
const config = {
`;
Object.keys(src).forEach(key => {
  file += '  ' + key + ': ' + JSON.stringify(src[key]) + ',\n';
});

file += `};
export default config;
`;
fs.writeFileSync(DST, file);
