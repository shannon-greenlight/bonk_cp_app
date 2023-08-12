const the_queue = {
  queue: [],
  busy: false,
  enqueue: function (item) {
    this.queue.push(item)
  },
  dequeue: function () {
    if (this.busy) {
      console.log("Hey, I'm busy!")
    } else {
      return this.queue.shift()
    }
  },
  data_available: function () {
    return this.queue.length > 0 && !this.busy
  },
  debug: function () {
    console.log(this.queue)
  },
}

function send_cmd(cmd, force = false) {
  if (!waveform_obj.is_drawing() || force) {
    if (the_macro.is_recording() && cmd !== "\n") {
      the_macro.append(cmd)
    }
    the_queue.enqueue(cmd)
  }
}

refresh_screen = function () {
  send_cmd("\n")
}
