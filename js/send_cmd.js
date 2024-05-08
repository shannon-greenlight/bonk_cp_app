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

async function _send_cmd(cmd) {
  const res = prep_request(cmd)
  if (res.fail) return
  cmd = res.cmd
  the_queue.busy = true

  try {
    request_data(cmd)
  } catch (e) {
    console.log(e)
    data.err = e
  }
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

// heartbeat manages the_queue
let param_changing = false
let timeout
setInterval(function () {
  param_changing = false
  if (the_queue.data_available()) {
    clearTimeout(timeout)
    _send_cmd(the_queue.dequeue())
  }
}, 250)

$("#activate_button").on("click", function () {
  send_cmd("!")
})
