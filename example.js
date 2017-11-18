'use strict'

const Queue = require('./index')
const q = Queue()

q.drain((done) => {
  console.log('Drain')
  done()
})

q.add((q, done) => {
  console.log(1)
  done()
})

q.add((q, done) => {
  console.log(2)

  q.add((q, done) => {
    console.log(3)
    done()
  })

  done()
})

q.add((q, done) => {
  console.log(4)
  done()
})

q.add((q, done) => {
  console.log(5)
  done()
})
