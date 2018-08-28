'use strict'

const assert = require('assert')
const debug = require('debug')('workq')

var instance = null
var id = 0

function Queue (opts) {
  if (!(this instanceof Queue)) {
    return new Queue(opts)
  }

  opts = opts || {}

  if (opts.singleton) {
    if (!instance) {
      instance = this
    }
  }

  // public api
  this.q = []
  this.running = false
  // private api
  this._exhausted = false
  this._parent = null
  this._pause = false
  this._id = id++
  this._drain = drain.bind(this)

  if (opts.singleton) {
    return instance
  }
}

Queue.prototype.add = function add (job, ...params) {
  assert(typeof job === 'function', 'The job to perform should be a function')
  assert(this._exhausted === false, 'You cannot add more jobs after calling done')
  debug(`Queue ${this._id}, adding new job`)
  this.q.push({ job, params })
  if (!this.running) {
    this.run()
  }
}

Queue.prototype.run = function run () {
  if (this._pause) {
    debug(`Queue ${this._id}, job paused`)
    return
  }

  this.running = true
  setImmediate(() => runner.call(this))
}

Queue.prototype.drain = function drain (fn) {
  assert(typeof fn === 'function', 'Drain should be a function')
  debug(`Queue ${this._id}, add drain function`)
  this._drain = fn
}

function runner () {
  /* istanbul ignore next */
  if (this._pause) {
    debug(`Queue ${this._id}, job paused`)
    return
  }

  debug(`Queue ${this._id}, running job`)
  const worker = this.q.shift()
  if (worker === undefined) {
    this.running = false
    const asyncOp = this._drain(parent.bind(this))
    /* istanbul ignore next */
    if (asyncOp && typeof asyncOp.then === 'function') {
      asyncOp.then(parent.bind(this), parent.bind(this))
    }
    return
  }

  const child = new Queue()
  child._parent = this
  child._pause = true

  const { job, params } = worker
  const asyncOp = params.length === 0
    ? job(child, done.bind(this))
    : job(child, ...params, done.bind(this))
  if (asyncOp && typeof asyncOp.then === 'function') {
    this._pause = true
    asyncOp.then(done.bind(this), done.bind(this))
  }

  function done () {
    child._exhausted = true
    this._pause = false
    debug(`Queue ${this._id}, job ended`)
    // if the child has jobs in the queue
    if (child.q.length) {
      debug(`Queue ${this._id}, starting child queue (${child.q.length} jobs yet to be executed)`)
      this._pause = true
      child._pause = false
      child.run()
    // if the current queue has jobs yet to be executed
    } else if (this.q.length) {
      debug(`Queue ${this._id}, running next job (${this.q.length} jobs yet to be executed)`)
      this.run()
    // the current queue has finished its execution
    } else {
      debug(`Queue ${this._id}, finished queue`)
      this.running = false
      const asyncOp = this._drain(parent.bind(this))
      if (asyncOp && typeof asyncOp.then === 'function') {
        asyncOp.then(parent.bind(this), parent.bind(this))
      }
    }
  }
}

function parent () {
  if (!this._parent) return
  debug(`Queue ${this._id}, running parent ${this._parent._id}`)
  this._parent._pause = false
  this._parent.run()
}

function drain (done) {
  debug(`Queue ${this._id}, drain`)
  done()
}

module.exports = Queue
