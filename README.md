# workq

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/) [![Build Status](https://travis-ci.org/delvedor/workq.svg?branch=master)](https://travis-ci.org/delvedor/workq) [![Coverage Status](https://coveralls.io/repos/github/delvedor/workq/badge.svg?branch=master)](https://coveralls.io/github/delvedor/workq?branch=master)

A super tiny work queue.

It can handle nested queues, the order of execution is guaranteed.  
The top level queue will start automatically once you add at least one job in the queue, the nested queues will start once the `done` callback has been called; you cannot add more jobs in the current queue after `done` has been called.

If you need a shared queue between multiple files pass the option `{ singleton: true }` in every file you need it.

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

Async/await and promises are supported as well!
```js
const q = require('workq')()

q.add(job)

// there is no need to call `done`!
async function job (child) {
  // perform some work
  // you can add nested jobs!
  child.add(nestedJob)
})

async function nestedJob (child) {
  // perform some work
})
```

If you need to know when a queue has finished all its jobs, you can use the `drain` api.  
*Note that in the top queue the drain hook can be called multiple times.*
```js
const q = require('workq')()

q.drain(done => {
  // the current queue has finished its jobs
  // async await is supported as well
  done()
})

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
