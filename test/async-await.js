'use strict'

const sleep = require('then-sleep')

function asyncAwait (Queue, test) {
  test('The order should be guaranteed', t => {
    t.plan(5)

    const q = Queue()
    const order = [1, 2, 3, 4, 5]

    q.add(async q => {
      t.is(order.shift(), 1)
    })

    q.add(async q => {
      t.is(order.shift(), 2)

      q.add(async q => {
        t.is(order.shift(), 3)
      })
    })

    q.add(async q => {
      t.is(order.shift(), 4)
    })

    q.add(async q => {
      t.is(order.shift(), 5)
    })
  })

  test('Nested child queue, order should be guaranteed', t => {
    t.plan(7)

    const q = Queue()
    const order = [1, 2, 3, 4, 5, 6, 7]

    q.add(async q => {
      t.is(order.shift(), 1)
    })

    q.add(async q => {
      t.is(order.shift(), 2)

      q.add(async q => {
        q.add(async q => {
          t.is(order.shift(), 4)
        })

        await sleep(100)
        t.is(order.shift(), 3)

        q.add(async q => {
          t.is(order.shift(), 5)
        })
      })

      q.add(async q => {
        t.is(order.shift(), 6)
      })
    })

    q.add(async q => {
      t.is(order.shift(), 7)
    })
  })

  test('Drain hook', t => {
    t.plan(7)

    const q = Queue()
    const order = [1, 2, 3, 4, 5]

    q.drain(async () => {
      await sleep(100)
      t.ok('called')
    })

    q.add(async q => {
      t.is(order.shift(), 1)
    })

    q.add(async q => {
      t.is(order.shift(), 2)

      q.add(async q => {
        t.is(order.shift(), 3)
      })

      q.drain(async () => {
        await sleep(100)
        t.ok('called')
      })
    })

    q.add(async q => {
      t.is(order.shift(), 4)
    })

    q.add(async q => {
      t.is(order.shift(), 5)
    })
  })

  test('Use drain handler from parent queue', t => {
    t.plan(7)

    const q = Queue({ shareDrainHandler: true })
    const order = [1, 2, 3, 4, 5]

    q.drain(async () => {
      await sleep(100)
      t.ok('called') // Is called twice
    })

    q.add(async q => {
      t.is(order.shift(), 1)
    })

    q.add(async q => {
      t.is(order.shift(), 2)

      q.add(async q => {
        t.is(order.shift(), 3)
      })
    })

    q.add(async q => {
      t.is(order.shift(), 4)
    })

    q.add(async q => {
      t.is(order.shift(), 5)
    })
  })
}

module.exports = asyncAwait
