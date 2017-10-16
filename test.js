'use strict'

const t = require('tap')
const test = t.test
const Queue = require('./index')

test('Should create a work queue', t => {
  t.plan(1)

  const q = Queue()

  q.add((q, done) => {
    t.ok('called')
    done()
  })
})

test('By default singleton is not enabled', t => {
  t.plan(1)

  const q1 = Queue()
  const q2 = Queue()

  q1.q = ['test']

  t.notDeepEqual(q1, q2)
})

test('Should create a singleton work queue', t => {
  t.plan(1)

  const q1 = Queue({ singleton: true })
  const q2 = Queue({ singleton: true })

  q1.q = ['test']

  t.deepEqual(q1, q2)
})

test('The order should be guaranteed / 1', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      t.is(order.shift(), 3)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 4)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 5)
    done()
  })
})

test('The order should be guaranteed / 2', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  setTimeout(() => {
    q.add((q, done) => {
      setTimeout(() => {
        t.is(order.shift(), 4)
        done()
      }, 100)

      q.add((q, done) => {
        t.is(order.shift(), 5)
        done()
      })
    })
  }, 100)

  q.add((q, done) => {
    t.is(order.shift(), 2)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 3)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 1', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      t.is(order.shift(), 3)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 4)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 5)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 2', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      t.is(order.shift(), 3)
      done()
    })

    q.add((q, done) => {
      t.is(order.shift(), 4)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 5)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 3', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      t.is(order.shift(), 3)

      q.add((q, done) => {
        t.is(order.shift(), 4)
        done()
      })

      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 5)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 4', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      t.is(order.shift(), 3)
      done()
    })

    q.add((q, done) => {
      t.is(order.shift(), 4)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 5)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 5', t => {
  t.plan(6)

  const q = Queue()
  const order = [1, 2, 3, 4, 5, 6]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      t.is(order.shift(), 3)

      q.add((q, done) => {
        t.is(order.shift(), 4)
        done()
      })

      done()
    })

    q.add((q, done) => {
      t.is(order.shift(), 5)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 6)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 7', t => {
  t.plan(6)

  const q = Queue()
  const order = [1, 2, 3, 4, 5, 6]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      setTimeout(() => {
        t.is(order.shift(), 3)
        done()
      }, 100)

      q.add((q, done) => {
        t.is(order.shift(), 4)
        done()
      })
    })

    q.add((q, done) => {
      t.is(order.shift(), 5)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 6)
    done()
  })
})

test('Nested child queue, order should be guaranteed / 8', t => {
  t.plan(7)

  const q = Queue()
  const order = [1, 2, 3, 4, 5, 6, 7]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 2)

    q.add((q, done) => {
      setTimeout(() => {
        t.is(order.shift(), 3)

        q.add((q, done) => {
          t.is(order.shift(), 5)
          done()
        })

        done()
      }, 100)

      q.add((q, done) => {
        t.is(order.shift(), 4)
        done()
      })
    })

    q.add((q, done) => {
      t.is(order.shift(), 6)
      done()
    })

    done()
  })

  q.add((q, done) => {
    t.is(order.shift(), 7)
    done()
  })
})
