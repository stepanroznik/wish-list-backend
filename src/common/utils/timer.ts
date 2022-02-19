export class Timer {
    private handle;

    constructor() {
        this.start();
    }

    /**
     * restarts the internal timer, call stop() to get time in ms since the last start()
     */
    start() {
        this.handle = process.hrtime();
    }

    /**
     * return time in ms since the last start() or creation of the object
     * @returns time in ms
     */
    stop(): number {
        const time = process.hrtime(this.handle);
        return time[0] + time[1] / 1e9;
    }
}
