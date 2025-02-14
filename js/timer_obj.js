const timer_obj = {
  start_time: 0,
  reading: 0,
  start: function () {
    this.start_time = new Date().getTime()
  },
  stop: function () {
    this.reading = new Date().getTime() - this.start_time
    return this.read()
  },
  read: function () {
    return this.reading
  },
}
