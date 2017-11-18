'use strict'

const t = require('tap')
const test = t.test
const Queue = require('../index')

test('Should create a work queue', t => {
  t.plan(1)

  const q = Queue()

  q.add((q, done) => {
    t.ok('called')
    done()
  })
})

test('Job should be a function', t => {
  t.plan(1)

  const q = Queue()

  try {
    q.add(null)
  } catch (err) {
    t.is(err.message, 'The job to perform should be a function')
  }
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

  q1.q = [worker]

  function worker (child, done) {
    done()
  }

  t.deepEqual(q1, q2)
  q1.run()
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

test('The order should be guaranteed / 3', t => {
  t.plan(6)

  const q = Queue()
  const order = [1, 2, 3, 4, 5, 6]

  q.add((q, done) => {
    t.is(order.shift(), 1)
    setTimeout(() => {
      t.is(order.shift(), 2)
      done()
    }, 100)
  })

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

  q.add((q, done) => {
    t.is(order.shift(), 6)
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

test('Nested child queue, order should be guaranteed / 9 (with singleton)', t => {
  t.plan(7)

  const q1 = Queue({ singleton: true })
  const q2 = Queue({ singleton: true })
  const order = [1, 2, 3, 4, 5, 6, 7]

  q2.add((q, done) => {
    t.is(order.shift(), 1)
    done()
  })

  q1.add((q, done) => {
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

  q2.add((q, done) => {
    t.is(order.shift(), 7)
    done()
  })
})

test('Cannot add more jobs after calling done in nested queues / 1', t => {
  t.plan(2)

  const q = Queue()

  q.add((child, done) => {
    child.add((child, done) => {
      t.ok('called')
      done()
    })

    done()

    try {
      child.add((child, done) => {
        done()
      })
      t.fail()
    } catch (err) {
      t.is(err.message, 'You cannot add more jobs after calling done')
    }
  })
})

test('Cannot add more jobs after calling done in nested queues / 2', t => {
  t.plan(3)

  const q = Queue()

  q.add((child, done) => {
    child.add((child, done) => {
      t.ok('called')
      done()

      try {
        child.add((child, done) => {
          done()
        })
        t.fail()
      } catch (err) {
        t.is(err.message, 'You cannot add more jobs after calling done')
      }
    })

    done()

    try {
      child.add((child, done) => {
        done()
      })
      t.fail()
    } catch (err) {
      t.is(err.message, 'You cannot add more jobs after calling done')
    }
  })
})

test('Cannot add more jobs after calling done in nested queues / 3', t => {
  t.plan(9)

  const q = Queue()

  q.add((child, done) => {
    child.add((child, done) => {
      t.ok('called')
      done()

      try {
        child.add((child, done) => {
          done()
        })
        t.fail()
      } catch (err) {
        t.is(err.message, 'You cannot add more jobs after calling done')
      }
    })

    done()

    try {
      child.add((child, done) => {
        done()
      })
      t.fail()
    } catch (err) {
      t.is(err.message, 'You cannot add more jobs after calling done')
    }
  })

  setTimeout(() => {
    q.add((child, done) => {
      child.add((child, done) => {
        t.ok('called')
        done()

        try {
          child.add((child, done) => {
            done()
          })
          t.fail()
        } catch (err) {
          t.is(err.message, 'You cannot add more jobs after calling done')
        }
      })

      done()

      try {
        child.add((child, done) => {
          done()
        })
        t.fail()
      } catch (err) {
        t.is(err.message, 'You cannot add more jobs after calling done')
      }
    })
  }, 100)

  q.add((child, done) => {
    child.add((child, done) => {
      t.ok('called')
      done()

      try {
        child.add((child, done) => {
          done()
        })
        t.fail()
      } catch (err) {
        t.is(err.message, 'You cannot add more jobs after calling done')
      }
    })

    done()

    try {
      child.add((child, done) => {
        done()
      })
      t.fail()
    } catch (err) {
      t.is(err.message, 'You cannot add more jobs after calling done')
    }
  })
})

test('The order should be guaranteed (with promises)', t => {
  t.plan(5)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.add(q => {
    t.is(order.shift(), 1)
    return Promise.resolve()
  })

  q.add(q => {
    t.is(order.shift(), 2)

    q.add(q => {
      t.is(order.shift(), 3)
      return Promise.resolve()
    })

    return Promise.reject() // eslint-disable-line
  })

  q.add(q => {
    t.is(order.shift(), 4)
    return Promise.resolve()
  })

  q.add(q => {
    t.is(order.shift(), 5)
    return Promise.resolve()
  })
})

test('async await support', t => {
  if (Number(process.versions.node[0]) >= 8) {
    require('./async-await')(Queue, t.test)
  } else {
    t.pass('Skip because Node version < 8')
  }
  t.end()
})

test('Drain hook', t => {
  t.plan(7)

  const q = Queue()
  const order = [1, 2, 3, 4, 5]

  q.drain(done => {
    t.ok('called')
    done()
  })

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

    q.drain(done => {
      t.ok('called')
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

test('Use drain handler from parent queue', t => {
  t.plan(7)

  const q = Queue({ shareDrainHandler: true })
  const order = [1, 2, 3, 4, 5]

  q.drain(done => {
    t.ok('called') // Is called twice
    done()
  })

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

test('Drain should be a function', t => {
  t.plan(1)

  const q = Queue()

  try {
    q.drain(null)
  } catch (err) {
    t.is(err.message, 'Drain should be a function')
  }
})
