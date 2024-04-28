$ = jQuery

waveform_obj.init()

let snapshot = ""
let out_fs = 0
let out_offset = 0
let cmd_buttons
let legal_values
const cv_offset = 5.4

const zeroPad = (num, places) => String(num).padStart(places, "0")

// window.electronAPI.handleTitle((event, value) => {
//   document.title = value
//   event.sender.send("counter-value", newValue)
// })

const OUTPUT_GROUP = 1 // for outputs
const INPUT_GROUP = 9 // for bounce
const GROUP_GROUP = 10 // for group

class OutputGroup {
  constructor(group_type) {
    this.group_type = group_type
    this.num_outputs = group_type === INPUT_GROUP ? 2 : 8
  }

  toggle_output(output_num, trig_num = 0) {
    this.outputs ^= 1 << output_num
    if (this.group_type === GROUP_GROUP) {
      send_cmd(`G${this.outputs}`)
    } else {
      // set trigger number
      send_cmd(`t${trig_num}`)
      // toggle output
      send_cmd(`T2${output_num}`)
    }
  }

  render() {
    for (let i = 0; i < this.num_outputs; i++) {
      let o = this.group.find(`div:nth-of-type(${i + (this.group_type === INPUT_GROUP ? 9 : 1)})`)
      dbugger.print(`Output: ${o.html()}`, false)
      dbugger.print(this.outputs, false)
      o.css("background-color", "")
      if (this.outputs & (0x01 << i)) {
        o.addClass("selected")
      } else {
        o.removeClass("selected")
      }
    }
    $("#outputs4 div.selected").css(
      "background-color",
      group_active ? group_button.active_color : group_button.selected_color
    )
    // allow only one active at any time when in bounce
    if (this.group_type === INPUT_GROUP && this.outputs > 0) {
      dbugger.print(`Inputs: ${this.outputs}`, false)
      switch (this.outputs) {
        case 1:
          this.group.find(`div:nth-of-type(${2 + 8})`).hide()
          break
        case 2:
          this.group.find(`div:nth-of-type(${1 + 8})`).hide()
          break
      }
    }
  }
}

const ig = new OutputGroup(INPUT_GROUP)
const og = new OutputGroup(OUTPUT_GROUP)
const gg = new OutputGroup(GROUP_GROUP)

let group = { outputs: 0 } // for Group Button
//const group_button = new Button("group", rgb(80, 11, 85), rgb(180, 111, 185))
const group_button = new Button("group", "#602b65", "#a06ba5")
let group_active = false

let selected_data, selected_param
function widget() {
  $ = jQuery
  data_handler.render_device_name()
  group.outputs = data_handler.data.group
  group_button.trigger = group
  group_active = data_handler.data.group_active == "1"
  group_button.set(group_active ? "ON" : "OFF")

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

  if (bonk_obj.in_bounce()) {
    meas_div.css({ "text-align": "center" })
    $("#system_message_div").css({ "font-size": "34px" })
    $(".outputs .output").hide()
    $("#adj_controls, #trigger_controls, .outputs .bounce").show()
  } else {
    $("#system_message_div").css({ "font-size": "14px" })
    $(".outputs .output").show()
    $(".outputs .bounce").hide()
    switch (data_handler.data.fxn_num) {
      case "8":
        $("#adj_controls, #trigger_controls").hide()
        break
      default:
        meas_div.css({ "text-align": "center" })
        $("#adj_controls, #trigger_controls").show()
    }
  }

  data_handler.data.triggers.forEach(function (trigger, index, arr) {
    let debug = false
    // console.log(trigger)
    // disable unselected triggers
    // remove group outputs if in bounce
    $(`#outputs4, #group, #group_label`).toggle(!bonk_obj.in_bounce())
    if (bonk_obj.in_bounce()) {
      let inputs = parseInt(trigger.outputs) >> 8
      let obj = $(`#outputs${index}`)
      let other_input = data_handler.data.fxn === "Bounce 1" ? 1 : 2
      $(`#t${trigger.trig_num}`).prop("disabled", inputs === 0 || inputs === other_input)
      dbugger.print(`Inputs: ${inputs} Other Input: ${other_input}`, false)
      dbugger.print(`#t${trigger.trig_num}`, false)
      dbugger.print(`Index: ${index}`, false)
      ig.group = obj
      ig.outputs = inputs
      ig.render()
    } else {
      let outputs = parseInt(trigger.outputs) & 0xff
      let obj = $(`#outputs${index}`)
      $(`#t${trigger.trig_num}`).prop("disabled", outputs === 0)
      dbugger.print(`#t${trigger.trig_num}`, debug)
      og.group = obj
      og.outputs = outputs
      og.render()
      switch (index) {
        case 0:
          t0_button.state = data_handler.data.triggers[0].state === "1"
          t0_button.set(t0_button.state ? "ON" : "OFF")
          break
        case 1:
          t1_button.state = data_handler.data.triggers[1].state === "1"
          t1_button.set(t1_button.state ? "ON" : "OFF")
          break
        case 2:
          t2_button.state = data_handler.data.triggers[2].state === "1"
          t2_button.set(t2_button.state ? "ON" : "OFF")
          break
        case 3:
          t3_button.state = data_handler.data.triggers[3].state === "1"
          t3_button.set(t3_button.state ? "ON" : "OFF")
          break
      }
    }
  })

  gg.group = $(`#outputs4`)
  gg.outputs = data_handler.data.group
  gg.render()

  the_canvas.hide()
  meas_div.hide()
  $("#system_message_div").hide()

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

    dbugger.print(`An Item: ${item}`, false)
    if (data_handler.data.params[0]) {
      const res = data_handler.data.params[0].find(find_param)
      if (res) {
        // let item_max = data_handler.data[$(this).attr("max")]
        // let item_min = data_handler.data[$(this).attr("min")]
        // if (item === "Idle Value") {
        //   item_max = res.max
        //   item_min = res.min
        // }
        let item_max
        let item_min
        switch (item) {
          case "Idle Value":
          case "Active Time":
            item_max = res.max
            item_min = res.min
            break
          default:
            item_max = data_handler.data[$(this).attr("max")]
            item_min = data_handler.data[$(this).attr("min")]
        }
        const item_val = res.value
        const selector = `[id='${item}'],[id='${item}_slider']`
        dbugger.print(`Res: ${res["label"]} ${res["value"]}`, false)
        dbugger.print(`Item: ${item} ${item_val}`, false)
        dbugger.print(selector, false)
        const items = $(selector)
        const item_input = $(`[id='${item}']`)
        const item_slider = $(`[id='${item}_slider']`)
        if (res["value"] === "N/A") {
          dbugger.print("Howdy!", false)
          items.prop("disabled", true)
        } else {
          items.prop("disabled", false).attr("max", item_max).attr("min", item_min)
          item_slider.val(item_val)
          switch (item) {
            case "Idle Value":
              let ival = parseFloat(item_val) / Math.pow(10, res.dp)
              dbugger.print(`dp: ${res.dp}`, false)
              dbugger.print(`Idle value: ${ival}`, false)
              item_input.val(ival)
              // item_input.val((out_fs*item_val/item_max - out_offset).toFixed(2))
              break
            case "offset":
              dbugger.print(`Offset value: ${item_val}`, false)
              dbugger.print(`out_fs: ${out_fs}`, false)
              dbugger.print(`out_offset: ${out_offset}`, false)
              // item_input.val(((out_fs-out_offset) * item_val / item_max).toFixed(2))
              item_input.val(item_val)
              break
            default:
              item_input.val(item_val)
          }
        }
      }
    }
  })

  // hide sliders if bounce
  if (bonk_obj.in_bounce()) {
    $(
      "input#randomness_slider, div#randomness_slider_div,#idle_value_slider, input[id='Idle Value_slider']"
    ).hide()
    $("#sample_time_slider,#SampleTime_slider").show()
  } else {
    $(
      "input#randomness_slider, div#randomness_slider_div,#idle_value_slider, input[id='Idle Value_slider']"
    ).show()
    $("#sample_time_slider,#SampleTime_slider").hide()
  }

  // disable sliders whose vals are controlled by CV inputs
  function set_adj(search_label) {
    let debug = false
    function find_label(value, index, array) {
      dbugger.print(`Find: ${value.label} ${search_label}`, debug)
      return value.label.substring(0, 3) === search_label
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
      if (param_val != "Off") {
        dbugger.print(`Set Adjust! ${search_label} ${param_val}`, debug)
        $(
          `.slider_input_div[label='${param_val}'] input, .slider_input_div[label='${param_val}'] + input`
        ).prop("disabled", true)
        $(
          `.slider_input_div[label='${param_val}'] label, .slider_input_div[label='${param_val}']`
        ).addClass("item_disabled")
      }
    }
  }

  $(`.slider_input_div, .slider_input_div label`).removeClass("item_disabled")
  set_adj("CV0")
  set_adj("CV1")

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

  if (bonk_obj.in_user_waveforms()) {
    $("#user_waveform_controls").show()
  } else {
    $("#user_waveform_controls").hide()
  }
}

;(function ($) {
  console.log(`Hey ${device.type}`)
  $("div.navigation-top").remove()
  cmd_buttons = $("button[data-ref]")

  $("body").on("keypress", function (e) {
    console.log("Howdy! " + e.key)
  })

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

  $("#send_waveform").on("click", function () {
    force_use_busy = true
    send_cmd($("#user_waveform").val())
  })

  $("#user_waveform").on("change, keyup", function () {
    $("#user_waveform_button_div button").prop("disabled", $(this).val() === "")
  })

  $("#clr_waveform").on("click", function () {
    $("#user_waveform").val("")
    $("#user_waveform_button_div button").prop("disabled", true)
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
    const output_num = parseInt($(this).html())
    const trig_num = parseInt($(this).parent().attr("id").replace("outputs", ""))
    dbugger.print(`Trigger: ${trig_num} Output: ${output_num}`, false)
    if (trig_num < 4) {
      og.toggle_output(output_num, trig_num)
    } else {
      gg.toggle_output(output_num, 4)
    }
  })

  $("#group").on("click", function () {
    const send_param = group_active ? 0 : 1
    dbugger.print(`Send Param: ${send_param}`, false)
    send_cmd(`g${send_param}`)
  })

  $("#t0, #t2, #t2, #t3").on("click", function () {
    switch ($(this).attr("id")) {
      case "t0":
        t0_button.set("ON")
        break
      case "t1":
        t1_button.set("ON")
        break
      case "t2":
        t2_button.set("ON")
        break
      case "t3":
        t3_button.set("ON")
        break
    }
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
    if (item === "SampleTime" || item === "Active Time") {
      units = "ms"
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
