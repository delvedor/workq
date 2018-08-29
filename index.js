'use strict'

const assert = require('assert')
const debug = require('debug')('workq')

const kExhausted = Symbol('exhausted')
const kParent = Symbol('parent')
const kPause = Symbol('pause')
const kDrain = Symbol('drain')
const kChildren = Symbol('children')

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
  this.id = id++
  // private api
  this[kExhausted] = false
  this[kParent] = null
  this[kPause] = false
  this[kDrain] = drain.bind(this)
  this[kChildren] = []

  if (opts.singleton) {
    return instance
  }
}

/**
 * Adds a new job to the queue.
 * @params {function} the job
 * @params {...params} optional custom params
 * @returns {Queue}
 */
Queue.prototype.add = function add (job, ...params) {
  assert(typeof job === 'function', 'The job to perform should be a function')
  assert(this[kExhausted] === false, 'You cannot add more jobs after calling done')
  debug(`Queue ${this.id}, adding new job`)
  this.q.push({ job, params })
  if (!this.running) {
    this.run()
  }
  return this
}

/**
 * Runs the current queue, it is called automatically by `add`
 * @returns {Queue}
 */
Queue.prototype.run = function run () {
  if (this[kPause]) {
    debug(`Queue ${this.id}, job paused`)
    return this
  }

  this.running = true
  setImmediate(() => runner.call(this))
  return this
}

/**
 * Adds a drain function
 * @params {function}
 * @returns {Queue}
 */
Queue.prototype.drain = function drain (fn) {
  assert(typeof fn === 'function', 'Drain should be a function')
  debug(`Queue ${this.id}, add drain function`)
  this[kDrain] = fn
  return this
}

/**
 * Adds a new child
 * @returns {Queue} the new child
 */
Queue.prototype.child = function () {
  debug(`Queue ${this.id}, creating child`)
  const child = new Queue()
  child[kParent] = this
  child[kPause] = true
  this[kChildren].push(child)
  if (!this.running) {
    // needed in the case there are not running jobs,
    // otherwise the children will never start
    this.add((q, done) => done())
  }
  return child
}

function runner () {
  /* istanbul ignore next */
  if (this[kPause]) {
    debug(`Queue ${this.id}, job paused`)
    return
  }

  debug(`Queue ${this.id}, running job`)
  const worker = this.q.shift()
  if (worker === undefined) {
    this.running = false
    const asyncOp = this[kDrain](parent.bind(this))
    /* istanbul ignore next */
    if (asyncOp && typeof asyncOp.then === 'function') {
      asyncOp.then(parent.bind(this), parent.bind(this))
    }
    return
  }

  const child = new Queue()
  child[kParent] = this
  child[kPause] = true

  const { job, params } = worker
  const asyncOp = params.length === 0
    ? job(child, done.bind(this))
    : job(child, ...params, done.bind(this))
  if (asyncOp && typeof asyncOp.then === 'function') {
    this[kPause] = true
    asyncOp.then(done.bind(this), done.bind(this))
  }

  function done () {
    child[kExhausted] = true
    this[kPause] = false
    debug(`Queue ${this.id}, job ended`)
    // if the child has jobs in the queue
    if (child.q.length) {
      debug(`Queue ${this.id}, starting child queue (${child.q.length} jobs yet to be executed)`)
      this[kPause] = true
      child[kPause] = false
      child.run()
    // if the current queue has jobs yet to be executed
    } else if (this.q.length) {
      debug(`Queue ${this.id}, running next job (${this.q.length} jobs yet to be executed)`)
      this.run()
    // the current queue has finished its execution
    } else {
      debug(`Queue ${this.id}, finished queue`)
      this.running = false
      const asyncOp = this[kDrain](parent.bind(this))
      if (asyncOp && typeof asyncOp.then === 'function') {
        asyncOp.then(parent.bind(this), parent.bind(this))
      }
    }
  }
}

function parent () {
  const child = this[kChildren].shift()
  // if there are not custom childs, call the parent
  if (child === undefined) {
    if (!this[kParent]) return
    debug(`Queue ${this.id}, running parent ${this[kParent].id}`)
    this[kParent][kPause] = false
    this[kParent].run()
  } else {
    debug(`Queue ${this.id}, running child ${child.id}`)
    child[kPause] = false
    child.run()
  }
}

function drain (done) {
  debug(`Queue ${this.id}, drain`)
  done()
}

module.exports = Queue
