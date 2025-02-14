// const { data } = require("jquery")

function take_snapshot() {
  // todo capture all user data
  // console.log("Snapshot data", data)
  let retval = 0
  let item = ""
  let out = []

  item = `f${data_handler.data.fxn_num}`
  out.push(item)
  if (data_handler.data.params[0]) {
    data_handler.data.params[0].forEach(function (val, indx) {
      out.push(`p${indx}`)
      out.push(val.type == "text" ? "$" + val.value : val.numeric_val)
    })
  }

  device.take_snapshot(out)

  return JSON.stringify(out)
}

receive_data = function (text) {
  dbugger.print(text, false)
  // dbugger.print("Time: " + timer_obj.stop(), true)
  timer_obj.start()
  try {
    data_handler.receive_data(text)
  } catch (e) {
    console.log(e)
    console.log(text)
  }

  switch (data_handler.operation) {
    case "status":
      dbugger.print("Receiving Status:", false)
      dbugger.print(data_handler.status, false)
      device.receive_status()
      break
    case "globals":
      dbugger.print("Receiving Globals:", true)
      dbugger.print(data_handler.globals, true)
      device.receive_globals()
      break
    case "message":
      dbugger.print("Receiving Message:", true)
      dbugger.print(data_handler.data, true)
      canvas_obj.render()
      break
    case "reply":
      dbugger.print("Receiving reply:", true)
      dbugger.print(data_handler.reply, true)
      if (data_handler.data.cmd === "e") {
        the_macro.end()
      }
      break
    case "item":
      const item = JSON.parse(data_handler.item)
      dbugger.print("Receiving item:", false)
      // console.log(item)
      switch (item.item_name) {
        case "current_index":
          waveform_obj.draw_waveform()
          waveform_obj.draw_index(parseInt(item.item_value))
          break
        default:
          console.log("Unknown item name: " + item.item_name)
      }
      break
    case "data":
      // console.log("Receiving Data:", data_handler.data)
      device.receive_data()
      waveform_obj.wave_arr = data_handler.get_wave_data()
      app.snapshot = take_snapshot()
      // console.log(app.snapshot);

      if (data_handler.data.cmd === "e") {
        the_macro.end()
      } else {
        if (data_handler.data.fxn && !param_changing) app.render()
        param_changing = false
      }
      the_queue.busy = false // this data was recvd as result of a request from queue
      break
    default:
      console.log("Unknown operation: " + data_handler.operation)
  }
  dbugger.print("Time: " + timer_obj.stop(), false)
}
