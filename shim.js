if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer/').Buffer
  // if (global.Buffer.isEncoding('base64url')) {
  //   console.log('Buffer.isEncoding base64url');
  // } else {
  //   console.log('Buffer.isEncoding NOT base64url');
  // }
}

if (typeof __dirname === 'undefined') {
  global.__dirname = '/'
}

if (typeof __filename === 'undefined') {
  global.__filename = ''
}

if (typeof process === 'undefined') {
  global.process = require('process')
} else {
  const bProcess = require('process')
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p]
    }
  }
}

process.browser = false

// global.location = global.location || { port: 80 }
const isDev = typeof __DEV__ === 'boolean' && __DEV__
if (isDev) {
  Object.assign(process.env, { NODE_ENV: 'development' })
} else {
  Object.assign(process.env, { NODE_ENV: 'production' })
}

if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

// If using the crypto shim, uncomment the following line to ensure
// crypto is loaded first, so it can populate global.crypto
// require('crypto')
