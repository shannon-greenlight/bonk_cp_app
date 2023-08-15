$ = jQuery

waveform_obj.init()

let snapshot = ""
let out_fs = 0
let out_offset = 0
let cmd_buttons
let legal_values
const cv_offset = 5.4

const zeroPad = (num, places) => String(num).padStart(places, "0")

let selected_data, selected_param
function widget() {
  $ = jQuery
  data_handler.render_device_name()

  const activate_button = $("#activate_button")
  if (data_handler.param_is_active()) {
    activate_button.fadeIn()
  } else {
    activate_button.fadeOut()
  }

  out_fs = data_handler.data.fs_volts / 1000
  // out_fs = 10.666
  if (data_handler.data.fs_offset == 1) {
    out_offset = 0 // output is unipolar
  } else {
    out_offset = out_fs / 2
  }

  $("#param_label").html(data_handler.data.fxn)
  $("#input_div .param_div").append('<div id="param_value" class="param"></div>')

  data_handler.data.triggers.forEach(function (item, index, arr) {
    let debug = false
    // disable unselected triggers
    $(`#t${item.trig_num}`).attr("disabled", parseInt(item.outputs) === 0)
    let outputs = parseInt(item.outputs)
    dbugger.print(outputs, debug)
    for (let i = 0; i < 8; i++) {
      // let o = $(`.outputs:nth-of-type(${index}) div:nth-of-type(${i})`)
      let o = $(`#outputs${index} div:nth-of-type(${i + 1})`)
      dbugger.print(`Output: ${o.html()}`, debug)
      // dbugger.print(parseInt(outputs,2),debug)
      if (outputs & (0x01 << i)) {
        o.addClass("selected")
      } else {
        o.removeClass("selected")
      }
      // outputs = outputs>>1
    }
  })

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
    the_canvas.hide()
    meas_div.hide()
  }

  switch (data_handler.data.fxn) {
    case "Settings":
      $("#adj_controls, #trigger_controls").hide()
      break
    default:
      meas_div.css({ "text-align": "center" })
      $("#adj_controls, #trigger_controls").show()
  }
  if (bonk_obj.in_user_waveforms()) {
    $("#adj_controls, #trigger_controls").hide()
    $("#draw_controls").show()
  } else {
    $("#draw_controls").hide()
  }

  let controls = ""
  $("#params").html(data_handler.display_params(controls))

  $(".slider_input_div").each(function (indx) {
    let item = $(this).attr("item") // ie. 'scale';
    function capitalizeFirstLetter(string) {
      return string[0].toUpperCase() + string.slice(1)
    }

    function find_param(param) {
      dbugger.print(capitalizeFirstLetter(item) + ": ", false)
      return param.label === capitalizeFirstLetter(item) + ": "
    }

    if (data_handler.data.params[0]) {
      const res = data_handler.data.params[0].find(find_param)
      if (res) {
        let item_max = data_handler.data[$(this).attr("max")]
        let item_min = data_handler.data[$(this).attr("min")]
        if (item === "Idle Value") {
          item_max = res.max
          item_min = res.min
        }
        const item_val = res.value
        const selector = `[id='${item}'],[id='${item}_slider']`
        dbugger.print(`Item: ${item_val}`, false)
        dbugger.print(selector, false)
        const items = $(selector)
        const item_input = $(`[id='${item}']`)
        const item_slider = $(`[id='${item}_slider']`)
        if (data_handler.data[item] === "disabled" || res["value"] === "N/A") {
          items.prop("disabled", true)
        } else {
          items.prop("disabled", false).attr("max", item_max).attr("min", item_min)
          item_slider.val(item_val)
          switch (item) {
            case "scale":
            case "randomness":
              // item_input.val(Math.round(100*item_val/item_max))
              item_input.val(item_val)
              break
            case "Idle Value":
              let ival = parseFloat(item_val) / Math.pow(10, res.dp)
              dbugger.print(`dp: ${res.dp}`, false)
              dbugger.print(`Idle value: ${ival}`, false)
              item_input.val(ival)
              // item_input.val((out_fs*item_val/item_max - out_offset).toFixed(2))
              break
            case "offset":
              dbugger.print(`Offset value: ${item_val}`, false)
              dbugger.print(`out_fs: ${out_fs}`, true)
              dbugger.print(`out_offset: ${out_offset}`, false)
              // item_input.val(((out_fs-out_offset) * item_val / item_max).toFixed(2))
              item_input.val(item_val)
              break
          }
        }
      }
    }
  })

  // now disable sliders whose vals are controlled by CV inputs
  function set_adj(search_label, search_id) {
    function find_label(value, index, array) {
      return value.label === search_label
    }

    let param_index = -1
    let param_val
    try {
      param_index = data_handler.data.params[0].find(find_label).param_num
    } catch (e) {
      dbugger.print(`${search_label} not found!`, true)
    }
    if (param_index !== -1) {
      param_val = $(`input[name=p${param_index}]`).val()
      $(`#adj_div input[id="${search_id}"], #adj_div input[id="${search_id}_slider"]`).prop(
        "disabled",
        param_val.indexOf("CV") === 0
      )
    }
  }

  set_adj("Scale: ", "scale")
  set_adj("Offset: ", "offset")
  set_adj("Randomness: ", "randomness")
  set_adj("Idle Value: ", "Idle Value")

  //$("#cv_val, #cv_val_slider").prop("disabled", data_handler.data.fxn==="LFO");

  // now set selected components input control
  selected_data = data_handler.find_selected_data()
  // console.log(selected_data)
  if (selected_data) {
    set_selected_param(selected_data)
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
        case "2000":
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

  data_handler.draw_fxn_buttons()

  set_param_nav_buttons()

  if ($("div.param_div label")[15]) $("div.param_div label")[15].innerHTML = "Idle Value: "
  // $("div.param_div label")[15].innerHTML="Idle Value(x1000): "
}

;(function ($) {
  console.log(`Hey ${device.type}`)
  $("div.navigation-top").remove()
  cmd_buttons = $("button[data-ref]")

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

  $("#activate_button").on("click", function () {
    send_cmd("!")
  })

  $("#take_snapshot").on("click", function () {
    the_macro.put(snapshot)
    console.log(snapshot)
  })

  $("#param_ctrl button").on("click", function () {
    const legend = $(this).html()
    if (legend === "Hide Params") {
      $(this).html("Show Params")
      $("#param_box").fadeOut()
    } else {
      $(this).html("Hide Params")
      $("#param_box").fadeIn()
    }
  })

  $(".outputs div").on("click", function () {
    const output_num = $(this).html()
    const trig_num = parseInt($(this).parent().attr("id").replace("outputs", ""))
    dbugger.print(`Trigger: ${trig_num} Output: ${output_num}`, false)
    // set trigger number
    send_cmd(`t${trig_num}`)
    // toggle output
    send_cmd(`T2${output_num}`)
  })

  $(".slider_input_div").each(function (indx) {
    const item = $(this).attr("item")
    let cmd = $(this).attr("cmd")
    let label = $(this).attr("label")
    let units = "V"
    let item_min = 0
    let item_max = 1023
    if (item === "scale" || item === "randomness" || item === "offset") {
      units = "%"
    }
    $(this).html(
      `<label for="${item}">${label}</label><input id="${item}" type="number" step="1" min="0" max="100" cmd="${cmd}" />${units}`
    )
    $(this).after(
      `<input id="${item}_slider" class="item_slider" cmd="${cmd}" type="range" min="${item_min}" max="${item_max}" value="512">`
    )

    $(`[id='${item}_slider']`).on("change", function () {
      // $(`.item_slider`).on("change", function () {
      const val = $(this).val()
      send_cmd(cmd + val)
    })

    // direct numeric input
    $(`[id='${item}']`).on("change", function () {
      let val = parseFloat($(this).val())
      const item_max = $(this).attr("max")
      dbugger.print(`Item: ${item} val: ${val} item_max: ${item_max}`, false)
      switch (item) {
        case "scale":
          val *= 0.01
          val = val * item_max
          break
        case "offset":
          // val = val / (out_fs / 100)
          break
        case "Idle Value":
          // val += out_offset
          // val = val / out_fs
          // val = val * item_max
          val = val * 1000
          dbugger.print(
            `Idle Value: ${val}, FS: ${out_fs}, offset: ${out_offset}, max: ${item_max}`,
            false
          )
      }
      send_cmd(cmd + Math.round(val))
    })
  })

  if (typeof url !== "undefined") refresh_screen()
})(jQuery)
