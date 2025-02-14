// Important!!! For Electron development, Mac and Win must be developed in separate environments.
// Not doing this will clobber development system. Fixed by deleting @module from node_modules. (@serial_port)

device = {
  type: "Unset",
  title: "Control Panel v4.0.3",
  port_label: "USB Serial Device",
  canvas_obj: null,
  init: function () {
    busy_obj.on_load()
  },
  render_product_name: function () {
    $("#product_name").html(`${this.type}`)
  },
  render_device_name: function () {
    const device_name = data_handler.get_device_name()
    const title = `Hi! I'm ${device_name}, your ${this.type}. And this is my Control Panel.
 You can do lots of things through this interface that you can't do from the front panel.
 And you don't have to wade through patch cords to get to the controls. You can change my name in Settings.`
    $("#head_div img").attr("title", title)
    $("#device_name").html(`"${device_name.trim()}"`)
    // $("#device_name").html(`${device_name.trim()}`)
  },
  render: function () {
    this.render_product_name()
    this.render_device_name()
  },
  take_snapshot: function (out) {
    if (data_handler.in_user_waveforms()) {
      // console.log("Taking snapshot of " + data_handler.data.fxn)

      out.shift() // amend start of macro
      const user_wave_num = data_handler.get_user_wave_num()
      out.unshift("!")
      out.unshift(user_wave_num)
      out.unshift("p6")
      out.unshift("f8")

      const values = data_handler.get_wave_data()
      // out.push(`p6`)
      // out.push(`!`)
      out.push(`p1`)
      out.push(`0`)
      out.push(`p2`)
      for (const val of values) {
        out.push(`${val}`)
        out.push(`!`)
        // console.log(`"${val}","!",`)
      }
    }
    return out
  },
  receive_data: function () {
    // console.log("Data: ", data_handler.data)
  },
  receive_globals: function () {
    this.type = data_handler.globals.product_name
  },
  receive_status: function () {
    switch (data_handler.status.event) {
      case "trigger":
        // console.log("Status: ", data_handler.status)
        t0_button.set(data_handler.status.t0, 0)
        t1_button.set(data_handler.status.t1, 1)
        t2_button.set(data_handler.status.t2, 2)
        t3_button.set(data_handler.status.t3, 3)
        break
      default:
        console.log("Unknown status event: " + data_handler.status.event)
    }
  },
}
