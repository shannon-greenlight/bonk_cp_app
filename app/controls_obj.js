const controls_obj = {
  render: function () {
    // const activate_button = $("#activate_button")
    // activate_button.prop("disabled", !data_handler.param_is_active())

    if (data_handler.in_user_waveforms()) {
      $("#adj_controls, #trigger_controls").hide()
      $("#user_waveform_controls, #draw_controls").show()
    } else {
      $("#user_waveform_controls, #draw_controls").hide()
    }

    if (data_handler.in_bounce()) {
      $("#adj_controls, #trigger_controls").show()
    } else {
      switch (data_handler.data.fxn_num) {
        case "8":
          $("#adj_controls, #trigger_controls").hide()
          break
        default:
          $("#adj_controls, #trigger_controls").show()
      }
    }
  },
  on_load: function () {
    $("#import_waveform").on("click", function () {
      force_use_busy = true
      send_cmd($("#user_waveform").val())
    })

    $("#user_waveform").on("change, keyup", function () {
      $("#user_waveform_button_div button").prop("disabled", $(this).val() === "")
    })

    $("#clr_waveform").on("click", function () {
      $("#user_waveform").val("")
      // $("#user_waveform_button_div button").prop("disabled", true)
    })

    $("#activate_button").on("click", function () {
      send_cmd("!")
    })

    $(".cmd_button").on("click", function () {
      // $(this).css("background-color", "var(--param_button_background)")
    })

    $("#take_snapshot").on("click", function () {
      the_macro.put(app.snapshot)
      console.log(`Snapshot: `, app.snapshot)
    })
  },
}
