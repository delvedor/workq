'use strict'

const Queue = require('./index')
const q = Queue()

q.add((q, done) => {
  console.log(1)
  done()
})

setTimeout(() => {
  q.add((q, done) => {
    setTimeout(() => {
      console.log(4)
      done()
    }, 100)

    q.add((q, done) => {
      console.log(5)
      done()
    })
  })
}, 100)

q.add((q, done) => {
  console.log(2)
  done()
})

q.add((q, done) => {
  console.log(3)
  done()
})
