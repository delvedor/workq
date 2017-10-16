'use strict'

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

  this.q = []
  this.running = false
  this._parent = null
  this._pause = false
  this._id = id

  if (opts.singleton) {
    return instance
  }
}

Queue.prototype.add = function add (job) {
  debug(`Queue ${this._id}, adding new job`)
  this.q.push(job)
  if (!this.running) {
    this.run()
  }
}

Queue.prototype.run = function run () {
  if (this._pause) {
    debug(`Queue ${this._id}, worker _paused`)
    return
  }
  this.running = true
  setImmediate(() => runner.call(this))
}

function runner () {
  if (this._pause) {
    debug(`Queue ${this._id}, worker _paused`)
    return
  }

  debug(`Queue ${this._id}, running worker`)
  const job = this.q.shift()
  if (!job) {
    this.running = false
    if (this._parent) {
      debug(`Queue ${this._id}, running _parent ${this._parent._id}`)
      this._parent._pause = false
      this._parent.run()
    }
    return
  }

  const child = new Queue()
  child._id = ++id
  child._parent = this
  child._pause = true

  job(child, done.bind(this))

  function done () {
    debug(`Queue ${this._id}, worker ended`)
    // if the child has jobs in the queue
    if (child.q.length) {
      debug(`Queue ${this._id}, starting child queue (${child.q.length} jobs yet to be executed)`)
      this._pause = true
      child._pause = false
      child.run()
    // if the current queue has jobs yet to be executed
    } else if (this.q.length) {
      debug(`Queue ${this._id}, running next worker (${this.q.length} jobs yet to be executed)`)
      this.run()
    // the current queue has finished its execution
    } else {
      debug(`Queue ${this._id}, finished queue`)
      this.running = false
      if (this._parent) {
        debug(`Queue ${this._id}, running _parent ${this._parent._id}`)
        this._parent._pause = false
        this._parent.run()
      }
    }
  }
}

module.exports = Queue
