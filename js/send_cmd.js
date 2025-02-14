const the_queue = {
  queue: [],
  busy: false,
  enqueue: function (item) {
    this.queue.push(item)
  },
  dequeue: function () {
    if (this.busy) {
      console.log("Hey, I'm busy!")
      return null
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
  // timer_obj.start()
  console.log(`Command: ${cmd} sent to serial port: ${chosen_port}`)
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout: No response within 15 seconds")), 15000)
  )

  try {
    await Promise.race([request_data(cmd), timeout])
    // console.log("Command sent successfully.")
  } catch (error) {
    alert(`Communication with ${device.type} lost! `, error)
    $("#control_div").fadeOut(600, function () {
      $("#ports").fadeIn(600)
      listPortsTimeout = setTimeout(listPorts, 2000)
      console.log("Resetting Timeout: " + listPortsTimeout)

      listSerialPorts()
    })
    console.error("Failed to send command:", error)
  } finally {
    the_queue.busy = false
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
  send_cmd("/")
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
