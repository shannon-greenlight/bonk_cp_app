const SHOW_WAVEFORM = false
const SHOW_MESSAGE = true
let show_waveform = SHOW_WAVEFORM
const canvas_obj = {
  clicked_value: NaN,
  message: function (msg) {
    canvas_message_div.html(msg).show()
  },
  set_meas_view: function (view) {
    show_waveform = !view
    this.render()
  },
  tog_meas_view: function () {
    show_waveform = !show_waveform
    this.render()
  },
  adjust_warning: function (label) {
    // show warning in system_message_div if label has a *, otherwise hide warning
    // label eg: "CV0" or "CV1"
    let foundObject = data_handler.data.params[0].find((obj) => obj.label.indexOf(label) === 0)
    // console.log("Found object: ", foundObject)
    if (foundObject) {
      // console.log(`${label}* `)
      $("#system_message_div div.warn").toggle(
        !(
          foundObject.label != `${label}* ` && foundObject.param_num === data_handler.data.param_num
        )
      )
    }
  },
  render: function () {
    // if (data_handler.in_bounce()) {
    //   meas_div.css({ "text-align": "center" })
    //   system_message_div.css({ "font-size": "34px" })
    // } else {
    //   system_message_div.css({ "font-size": "14px" })
    //   meas_div.css({ "text-align": "center" })
    // }

    system_message_div.html(
      data_handler.data.system_message ? data_handler.data.system_message : "No message!"
    )

    if (show_waveform && data_handler.has_waveform() && data_handler.operation != "message") {
      waveform_obj.draw_waveform()
      system_message_div.hide()
      the_canvas.show()
    } else {
      system_message_div.show()
      the_canvas.hide()
    }

    if (data_handler.operation === "message") {
      $("#view_switch").prop("checked", data_handler.operation === "message")
    } else {
      if (show_waveform && data_handler.has_waveform()) {
        $("#view_switch").prop("checked", false)
      } else {
        $("#view_switch").prop("checked", true)
      }
    }
    $("#view_switch")
      .prop("disabled", !data_handler.has_waveform())
      .css("cursor", data_handler.has_waveform() ? "pointer" : "default")
    $("#view_switch_div").css("opacity", data_handler.has_waveform() ? 1 : 0.2)

    if (app.selected_data) {
      $("#canvas").css("cursor", "")
      if (data_handler.in_user_waveforms()) {
        let p_num = app.selected_data.param_num
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
        this.message(hint)
      } else {
        if (data_handler.data.fxn !== "WiFi") {
          this.message("")
        }
      }
    } else {
      $("#input_div").hide()
    }
    // remove warnings if not needed
    const selected_label = app.selected_data.label.substr(0, 3)
    this.adjust_warning(selected_label)
  },

  on_load: function () {
    $("#view_switch").on("change", () => {
      this.tog_meas_view()
    })

    $("#canvas").on("mouseup", function (e) {
      const selected_value = 4095 - parseInt((e.offsetY * 4095) / $(this).height())
      send_cmd("=" + selected_value, true)
    })

    $("#canvas").on("mousemove", function (e) {
      if (data_handler.in_user_waveforms()) {
        const selected_index = parseInt((e.offsetX * 128) / $(this).width())
        const selected_value = 4095 - parseInt((e.offsetY * 4095) / $(this).height())
        if (waveform_obj.is_drawing()) {
          waveform_obj.on_mousemove(selected_index, selected_value)
        } else {
          let title
          switch (app.selected_data.param_num) {
            case "1":
              this.clicked_value = selected_index
              title = `Index: ${this.clicked_value}`
              break
            case "2":
              this.clicked_value = selected_value
              title = `Value: ${this.clicked_value}`
              break
            default:
              this.clicked_value = NaN
              title = ""
          }
          $(this).attr("title", title)
        }
      }
    })

    // set Index to value clicked on graph
    $("#canvas").on("click", function (e) {
      if (data_handler.in_user_waveforms() && !waveform_obj.in_draw_mode()) {
        if (!isNaN(this.clicked_value)) {
          console.log(`Clicked value: ${this.clicked_value}`)
          switch (app.selected_data.param_num) {
            case "1": // is this Index?
              $(`input[name=p${app.selected_data.param_num}]`).val(this.clicked_value)
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
