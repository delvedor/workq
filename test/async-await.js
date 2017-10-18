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
}

module.exports = asyncAwait
