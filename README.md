# workq

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/) [![Build Status](https://travis-ci.org/delvedor/workq.svg?branch=master)](https://travis-ci.org/delvedor/workq)

A super tiny work queue.

## Install
```
npm i workq --save
```
## Usage
```js
const q = require('workq')()

q.add(job)

function job (child, done) {
  // perform some work
  // you can add nested jobs!
  child.add(nestedJob)
  done()
})

function nestedJob (child, done) {
  // perform some work
  done()
})
```

## Acknowledgements

This project is kindly sponsored by [LetzDoIt](http://www.letzdoitapp.com/).

## License

Licensed under [MIT](./LICENSE).
