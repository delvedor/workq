'use strict'

const t = require('tap')
const test = t.test
const Queue = require('../index')

test('Should create a child q / 1', t => {
  t.plan(4)

  const order = [1, 2, 3, 4]
  const q = Queue()

  const q1 = q.child()
  const q2 = q.child()

  q.add((q, done) => {
    t.strictEqual(order.shift(), 1)
    done()
  })

  q1.add((q, done) => {
    t.strictEqual(order.shift(), 3)
    done()
  })

  q2.add((q, done) => {
    t.strictEqual(order.shift(), 4)
    done()
  })

  q.add((q, done) => {
    t.strictEqual(order.shift(), 2)
    done()
  })
})

test('Should create a child q / 2', t => {
  t.plan(4)

  const order = [1, 2, 3, 4]
  const q = Queue()

  q.add((q, done) => {
    t.strictEqual(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.strictEqual(order.shift(), 2)
    done()
  })

  const q1 = q.child()
  const q2 = q.child()

  q1.add((q, done) => {
    t.strictEqual(order.shift(), 3)
    done()
  })

  q2.add((q, done) => {
    t.strictEqual(order.shift(), 4)
    done()
  })
})

test('Should create a child q / 3', t => {
  t.plan(4)

  const order = [1, 2, 3, 4]
  const q = Queue()

  q.add((q, done) => {
    t.strictEqual(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.strictEqual(order.shift(), 2)
    done()
  })

  setImmediate(() => {
    const q1 = q.child()
    const q2 = q.child()

    q1.add((q, done) => {
      t.strictEqual(order.shift(), 3)
      done()
    })

    q2.add((q, done) => {
      t.strictEqual(order.shift(), 4)
      done()
    })
  })
})

test('Should create a child q / 4', t => {
  t.plan(5)

  const order = [1, 2, 3, 4, 5]
  const q = Queue()

  q.add((q, done) => {
    const q1 = q.child()
    const q2 = q.child()

    t.strictEqual(order.shift(), 1)

    q1.add((q, done) => {
      t.strictEqual(order.shift(), 3)
      done()
    })

    q2.add((q, done) => {
      t.strictEqual(order.shift(), 4)
      done()
    })

    q.add((q, done) => {
      t.strictEqual(order.shift(), 2)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.strictEqual(order.shift(), 5)
    done()
  })
})

test('Should create a child q / 5', t => {
  t.plan(5)

  const order = [1, 2, 3, 4, 5]
  const q = Queue()

  const q1 = q.child()
  const q2 = q.child()

  q.add((q, done) => {
    t.strictEqual(order.shift(), 1)
    done()
  })

  q1.add((q, done) => {
    t.strictEqual(order.shift(), 3)

    q.add((q, done) => {
      t.strictEqual(order.shift(), 4)
      done()
    })
    done()
  })

  q2.add((q, done) => {
    t.strictEqual(order.shift(), 5)
    done()
  })

  q.add((q, done) => {
    t.strictEqual(order.shift(), 2)
    done()
  })
})

test('No running jobs', t => {
  t.plan(3)

  const order = [1, 2, 3]
  const q = Queue()

  const q1 = q.child()
  const q2 = q.child()

  q1.add((q, done) => {
    t.strictEqual(order.shift(), 1)

    q1.add((q, done) => {
      t.strictEqual(order.shift(), 2)
      done()
    })

    done()
  })

  q2.add((q, done) => {
    t.strictEqual(order.shift(), 3)
    done()
  })
})
