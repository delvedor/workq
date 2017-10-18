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

  if (opts.singleton) {
    return instance
  }
}

Queue.prototype.add = function add (job) {
  assert(typeof job === 'function', 'The job to perform should be a function')
  assert(this._exhausted === false, 'You cannot add more jobs after calling done')
  debug(`Queue ${this._id}, adding new job`)
  this.q.push(job)
  if (!this.running) {
    this.run()
  }
}

Queue.prototype.run = function run () {
  if (this._pause) {
    debug(`Queue ${this._id}, job paused`)
    return
  }
  setImmediate(() => runner.call(this))
}

function runner () {
  if (this._pause) {
    debug(`Queue ${this._id}, job paused`)
    return
  }

  debug(`Queue ${this._id}, running job`)
  this.running = true
  const job = this.q.shift()
  if (!job) {
    this.running = false
    parent.call(this)
    return
  }

  const child = new Queue()
  child._parent = this
  child._pause = true

  const asyncOp = job(child, done.bind(this))
  if (asyncOp && typeof asyncOp.then === 'function') {
    this._pause = true
    asyncOp.then(done.bind(this)).catch(done.bind(this))
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
      parent.call(this)
    }
  }
}

function parent () {
  if (!this._parent) return
  debug(`Queue ${this._id}, running parent ${this._parent._id}`)
  this._parent._pause = false
  this._parent.run()
}

module.exports = Queue
