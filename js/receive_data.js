// const { data } = require("jquery")

function take_snapshot(data) {
  // todo capture all user data
  // console.log("Snapshot data", data)
  let retval = 0
  let item = ""
  let out = []

  item = `f${data.fxn_num}`
  out.push(item)
  if (data.params[0]) {
    data.params[0].forEach(function (val, indx) {
      out.push(`p${indx}`)
      out.push(val.type == "text" ? "$" + val.value : val.numeric_val)
    })
  }

  device.take_snapshot(data, out)

  return JSON.stringify(out)
}

receive_data = function (text) {
  dbugger.print(text, false)
  try {
    data_handler.receive_data(text)
  } catch (e) {
    console.log(e)
    console.log(text)
  }

  if (data_handler.status_received) {
    dbugger.print("Receiving Status:")
    dbugger.print(data_handler.status)
    device.receive_status()
  } else {
    console.log("Receiving Data:", data_handler.data)
    device.receive_data()
    waveform_obj.wave_arr = data_handler.get_wave_data()
    snapshot = take_snapshot(data_handler.data)
    // console.log(snapshot);

    if (data_handler.data.cmd === "e") {
      the_macro.end()
    } else {
      if (data_handler.data.fxn && !param_changing) widget()
      param_changing = false
    }
    the_queue.busy = false // this data was recvd as result of a request from queue
  }
}
