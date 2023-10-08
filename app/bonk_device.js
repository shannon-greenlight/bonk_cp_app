device = {
  type: "Bonkulator",
  title: "Bonkulator Control Panel v3.1.1",
  port_label: "USB Serial Device",
  init: function () {
    $("#busy_div").fadeOut(1).css("opacity", 1)
  },
  take_snapshot: function (data, out) {
    if (bonk_obj.in_user_waveforms()) {
      // console.log("Taking snapshot of " + data.fxn)

      out.shift() // amend start of macro
      const user_wave_num = data.fxn.charAt(5)
      out.unshift("!")
      out.unshift(user_wave_num)
      out.unshift("p6")
      out.unshift("f8")

      const values = data.message.split(", ")
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
    t0_button.trigger = data_handler.data.triggers[0]
    t1_button.trigger = data_handler.data.triggers[1]
    t2_button.trigger = data_handler.data.triggers[2]
    t3_button.trigger = data_handler.data.triggers[3]
  },
  receive_status: function () {
    t0_button.set(data_handler.status.t0)
    t1_button.set(data_handler.status.t1)
    t2_button.set(data_handler.status.t2)
    t3_button.set(data_handler.status.t3)
  },
}
