/* global PerformanceObserver,performance */

import supportsMarkMeasure from './supportsMarkMeasure'
import supportsPerfObserver from './supportsPerformanceObserver'

let POLLING_DURATION = 2000
let deferreds = new Map()

function processList (entries) {
  for (let i = 0, len = entries.length; i < len; i++) {
    let entry = entries[i]
    if (entry.__observed) {
      continue
    }
    let deferred = deferreds.get(entry.name)
    if (deferred) {
      entry.__observed = true
      deferreds.delete(entry.name)
      deferred(entry.duration)
    }
  }
}

function onObserve (entriesList) {
  processList(entriesList.getEntriesByType('measure'))
}

if (supportsPerfObserver) {
  new PerformanceObserver(onObserve).observe({entryTypes: ['measure']})
} else if (supportsMarkMeasure) {
  setInterval(() => {
    let entries = performance.getEntriesByType('measure')
    processList(entries)
  }, POLLING_DURATION)
} // else fake entries will be created instead

function observe (name) {
  return new Promise(resolve => {
    deferreds.set(name, resolve)
  })
}

function createFakeEntry (name, duration) {
  processList([{
    name: name,
    duration: duration
  }])
}

export { observe, createFakeEntry }
