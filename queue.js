const events = require('events');

class Queue {
    constructor () {
        this.q = [];
        this.eventEmitter = new events.EventEmitter();
    }
    /**
     * Push an item to the queue
     * @param {any} item The item to push to the queue
     */
    push(item) {
        this.q.push(item);
        this.eventEmitter.emit('queue-updated');
    }
    
    /**
     * Get the next item in the queue
     */
    getNext() {
        return new Promise((resolve) => {
            if (this.q.length > 0) {
                // We have an item in the queue
                resolve(this.q[0]);
                this.q.shift();
                return;
            }
            // Queue is empty, wait for changes
            this.eventEmitter.once('queue-updated', () => {
                if (this.q.length === 0) {
                    // Queue is closing, return empty element
                    resolve(undefined);
                    return;
                }
                resolve(this.q[0]);
                this.q.shift();
            });
        });
    }
    
    /**
     * Clear the queue and send empty elements to all consumers
     */
    clearAndStop() {
        this.q = [];
        this.eventEmitter.emit('queue-updated');
    }
    
    length() {
        return this.q.length;
    }
}


module.exports = {
    Queue,
}