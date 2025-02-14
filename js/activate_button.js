let led_timeout
const activate_button = {
  render: function () {
    const my_activate_button = $("#activate_button")
    my_activate_button.prop("disabled", !data_handler.param_is_active())
    // console.log(`data_handler.data.rotary_leds_state: ${data_handler.data.rotary_leds_state}`)
    switch (data_handler.data.rotary_leds_state) {
      case "0":
        clearInterval(led_timeout)
        my_activate_button
          .css("background", "linear-gradient(to bottom, #39b74e, #19972e)")
          .html("Activate")
        break
      case "1":
        let flash = true
        led_timeout = setInterval(() => {
          if (flash) {
            my_activate_button
              .css("background", "linear-gradient(to bottom, #ff0000, #cc0000)")
              .html("Waiting")
          } else {
            my_activate_button.css("background", "#888888")
          }
          flash = !flash
        }, 300)
        break
      //   case "2":
      //     clearInterval(led_timeout)
      //     my_activate_button
      //       .css("background", "linear-gradient(to bottom, #ff0000, #cc0000)")
      //       .html("Recording")
      //     break
      default:
        clearInterval(led_timeout)
        my_activate_button
          .css("background", "linear-gradient(to bottom, #39b74e, #19972e)")
          .html("Activate")
    }
  },
  on_load: function () {},
}
