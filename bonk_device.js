device = {
  type: "Bonkulator",
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
}
