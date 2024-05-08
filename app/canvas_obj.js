const canvas_obj = {
  build_canvas: function () {
    the_canvas.hide()
    meas_div.hide()
    $("#system_message_div").hide()

    if (bonk_obj.in_bounce()) {
      meas_div.css({ "text-align": "center" })
      $("#system_message_div").css({ "font-size": "34px" })
    } else {
      $("#system_message_div").css({ "font-size": "14px" })
      meas_div.css({ "text-align": "center" })
    }

    if (data_handler.data.system_message) {
      meas_div.show()
      $("#system_message_div").html(data_handler.data.system_message).addClass("big_message").show()
    } else {
      // $("#system_message_div").html("").removeClass("big_message")
    }

    if (data_handler.data.message) {
      meas_div.show()
      if (data_handler.data.fxn === "WiFi") {
        $("#message_div").html(data_handler.data.message).addClass("big_message")
      } else {
        $("#message_div").html("").removeClass("big_message")
        the_canvas.show()
        waveform_obj.draw_waveform()
      }
    } else {
      // the_canvas.hide()
      // meas_div.hide()
    }

    if (selected_data) {
      $("#canvas").css("cursor", "")
      if (bonk_obj.in_user_waveforms()) {
        let p_num = selected_data.param_num
        dbugger.print("selected: " + p_num, false)
        let hint
        switch (p_num) {
          case "1":
            hint = "Click on graph to set <em>index</em>"
            $("#canvas").css("cursor", "pointer")
            break
          case "2000": // we don't do this anymore
            hint = "Click on graph to set <em>value</em>"
            $("#canvas").css("cursor", "pointer")
            break
          default:
            hint = ""
        }
        $("#message_div").html(hint)
      } else {
        if (data_handler.data.fxn !== "WiFi") {
          $("#message_div").html("")
        }
      }
    } else {
      $("#input_div, #inc_controls").hide()
    }
  },
  on_load: function () {
    $("#canvas").on("mousemove", function (e) {
      if (bonk_obj.in_user_waveforms()) {
        const selected_index = parseInt((e.offsetX * 128) / $(this).width())
        const selected_value = 4095 - parseInt((e.offsetY * 4095) / $(this).height())
        if (waveform_obj.is_drawing()) {
          waveform_obj.on_mousemove(selected_index, selected_value)
        } else {
          let title
          switch (selected_data.param_num) {
            case "1":
              selected_param = selected_index
              title = `Index: ${selected_param}`
              break
            case "2":
              selected_param = selected_value
              title = `Value: ${selected_param}`
              break
            default:
              selected_param = NaN
              title = ""
          }
          $(this).attr("title", title)
        }
      }
    })

    $("#canvas").on("click", function (e) {
      if (!waveform_obj.in_draw_mode()) {
        if (!isNaN(selected_param)) {
          // console.log("On click")
          switch (selected_data.param_num) {
            case "1":
              $(`input[name=p${selected_data.param_num}]`).val(selected_param)
              $(`input[name=p1]`).trigger("change")
              break
            case "2000":
              $(`input[name=p2]`).trigger("change")
              send_cmd("!")
              break
            default:
          }
        }
      }
    })
  },
}
