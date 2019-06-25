const events = require('events');
const eventEmitter = new events.EventEmitter();

let q = [];

/**
 * Push an item to the queue
 * @param {any} item The item to push to the queue
 */
function push(item) {
    q.push(item);
    eventEmitter.emit('queue-updated');
}

/**
 * Get the next item in the queue
 */
function getNext() {
    return new Promise((resolve) => {
        if (q.length > 0) {
            // We have an item in the queue
            resolve(q[0]);
            q.shift();
            return;
        }
        // Queue is empty, wait for changes
        eventEmitter.once('queue-updated', () => {
            if (q.length === 0) {
                // Queue is closing, return empty element
                resolve(undefined);
                return;
            }
            resolve(q[0]);
            q.shift();
        });
    });
}

/**
 * Clear the queue and send empty elements to all consumers
 */
function clearAndStop() {
    q = [];
    eventEmitter.emit('queue-updated');
}

module.exports = {
    push,
    getNext,
    clearAndStop,
}