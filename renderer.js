let dbugger = {
  debug_on: false,
  print: function (s, force) {
    if (this.debug_on || force) {
      console.log(s)
    }
  },
}

// const out_fs = 128 / 12;
// const out_fs = 5.463*2;
let out_fs = 0
let out_offset = 0
const zeroPad = (num, places) => {
  return String(num).padStart(places, "0")
}
let cmd_buttons
let legal_values
const cv_offset = 5.4
let data = {}

function display_param(data) {
  // console.log(data);
  const param_num = data.param_num
  let data_value = data.value
  let tail
  const is_selected = data.selected === "true"
  const selected_class = is_selected ? " selected" : ""
  let control = "<div class='param_div" + selected_class + "' >"
  control +=
    " <div class='param param_head'><label>" + data.label + "</label></div>"
  control += " <div class='param param_val " + data.type + selected_class + "'>"
  switch (data.type) {
    case "radio":
      let values = data.values.split(",")
      let input_name = `p${param_num}`
      for (let i = 0; i < values.length; i++) {
        control += " <div class='param'>"
        control += "<input name='" + input_name + "'"
        control += ` class="cmd_button" title="${i}" data-ref="${i}" `
        control += ' type="radio"'
        // this prevents radio button from jumping around
        if (data.cmd === "p") {
          if ($(`input[name=${input_name}][value=${i}]:checked`).length)
            control += " checked "
        } else {
          if (data.value === values[i]) control += " checked "
        }
        control += ' value="' + i + '" />'
        control += "<label for='" + values[i] + "' >" + values[i] + "</label>"
        control += "</div>" // closes .param
      }
      control += "<div class='clear' /></div>" // closes .param_val
      break
    case "sequence":
      dbugger.print(data)
      if (data.dig_num > data_value.length - 1) data_value += " "
      let dval = data_value
      tail = dval.slice(parseInt(data.dig_num) + 1)
      let hilight = param_num == "1" ? "hilight_emphasize" : "hilight"
      //control += " <div class='"+data.type+"'>";
      control += "<input"
      control += ' name="s"'
      control += ' type="hidden"'
      control += ' value="' + data_value + '" />'
      control += "<div>"
      control += dval.slice(0, data.dig_num)
      control += `<span class="${hilight}">${dval.substr(
        data.dig_num,
        1
      )}</span>${tail}</div>`
      control += "</div>"
      break
    default:
      control += "<input name='p" + param_num + "'"
      control += ' type="hidden"'
      control += ' min="' + data.min + '"'
      control += ' max="' + data.max + '"'
      control += ' component="' + data.type + '"'
      // if (data.selected==="false") control += " disabled";
      control += ' value="' + data.value + '" />'

      control += "<div class='param_body'>"
      let n = data_value
      let plussign = data.dp > 0 || data.min < 0 ? "+" : " "
      plussign = data.value < 0 ? "-" : plussign
      if (data.type === "number") {
        if (data.dp === "0") {
          n = zeroPad(Math.abs(data_value), data.num_digits)
        } else {
          dbugger.print(`Data Value: ${data_value}`, false)
          dbugger.print(`dig_num: ${data.dig_num}`, false)
          // n = data_value<0 ? "-" : "+"
          let divisor = Math.pow(10, data.dp)
          let int_part = Math.floor(Math.abs(data_value) / divisor)
          if (data.max >= 10000) {
            int_part = zeroPad(int_part, 2)
            if (data.dig_num > 0) data.dig_num--
            dbugger.print(`dig_num2: ${data.dig_num}`, false)
          }
          let frac_part = zeroPad(Math.abs(data_value) % divisor, data.dp)
          n = int_part.toString()
          n += "."
          n += frac_part
          dbugger.print(`n: ${n}`, false)
        }
      } else {
        plussign = ""
      }
      dbugger.print(`n: ${n}`, false)
      if (
        data.selected === "true" &&
        (data.type === "number" || data.type === "text")
      ) {
        tail = n.slice(parseInt(data.dig_num) + 1)
        control += plussign
        control += n.slice(0, data.dig_num)
        control +=
          "<span class='hilight'>" +
          n.substr(data.dig_num, 1) +
          "</span>" +
          tail +
          "</div><!-- end param_body -->"
      } else {
        control += plussign + n + "</div><!-- end param_body -->"
      }

      control += "</div>"
  }
  control += " <div class='clear' /> <!-- clear param -->"
  control += "</div></div>" // closes #param_div
  return control
}

function display_input(data) {
  dbugger.print(data)
  let data_value = data.value
  let control = ""
  let values
  switch (data.type) {
    case "select": // really select, needs change to arduino code first
      values = data.values.split(",")
      if (values.length > 1) {
        control += "<select id='param_input' name='p" + data.param_num + "'>"
        //control += " <div class='param  param_val "+data.type+"'>";
        for (let i = 0; i < values.length; i++) {
          control += "<option "
          if (data.value === values[i]) control += " selected "
          control += ' value="' + i + '">' + values[i] + "</option>"
        }
        control += "</select>"
      }
      break
    case "sequence":
      data_value = data.value
      control += "<input"
      control += ' id="param_input"'
      control += ' type="text"'
      control += ' pattern="[' + data.legal_values + ']"'
      control += ' class="sequence"'
      control += ' value="' + data.value + '" />'
      break
    case "number":
      control += "<input name='p" + data.param_num + "'"
      control += ' id="param_input"'
      control += ' type="number"'
      control += ' min="' + data.min + '"'
      control += ' max="' + data.max + '"'
      control += ' value="' + data.value + '" />'
      break
    case "text":
      control += "<input name='p" + data.param_num + "'"
      control += ' id="param_input"'
      control += ' type="text"'
      control += ' class="text_input"'
      control += ' value="' + data.value + '" />'
      break
  }
  return control
}

function fxn_button(data, i) {
  let fxn = data.fxns[i]
  let selected = data.fxn === fxn ? "selected " : ""
  //console.log(fxn,i,selected);
  let out = `<button id="fxn_button_${i}" title="f${i}" class="${selected}cmd_button" data-ref="f${i}">${fxn}</button>`
  return out
}

let selected_data, selected_val
function widget(data) {
  $ = jQuery
  const bonk_title = `Hi! I'm ${data.device_name}, your Bonkulator and this is my Control Panel.
 You can do lots of things through this interface that you can't do from the front panel.
 And you don't have to wade through patch cords to get to the controls.`
  $("#head_div img").attr("title", bonk_title)
  out_fs = data.fs_volts / 1000
  // out_fs = 10.666
  if (data.fs_offset == 1) {
    out_offset = 0 // output is unipolar
  } else {
    out_offset = out_fs / 2
  }
  const meas_div = $("#meas_div")
  const the_canvas = $("#canvas")

  let title = $("#head_div img").attr("title").toString()
  title = title.replace("Spanky", data.device_name)
  dbugger.print(title, false)
  $("#head_div img").attr("title", title)
  $("#device_name").html(`"${data.device_name.trim()}"`)
  // $("#spank_fxn").html("<span class='fxn_head'> "+data.fxn+"</span>");
  $("#param_label").html(data.fxn)
  $("#input_div .param_div").append(
    '<div id="param_value" class="param"></div>'
  )

  const activate_button = $("#activate_button")
  if (data.param_active == "1") {
    activate_button.fadeIn()
  } else {
    activate_button.fadeOut()
  }

  data.triggers.forEach(function (item, index, arr) {
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

  // $("#analog_label").html(data.quantized)

  if (data.message) {
    the_canvas.show()
    meas_div.show()
    const wave_arr = data.message.split(", ")
    const wave_arr_length = wave_arr.length
    const wave_index = parseInt(data.params[0][1].value) + 1
    dbugger.print(`Wave Index: ${wave_index}`, false)
    // console.log(wave_arr);
    // console.log("array count: "+wave_arr_length);
    // draw a waveform here
    setTimeout(function () {
      const cwidth = the_canvas.width()
      const cheight = the_canvas.height()
      let calc_w = function (i) {
        return parseInt((i / wave_arr_length) * cwidth, 10)
      }
      let calc_h = function (i) {
        return (
          cheight -
          parseInt((wave_arr[i] / data.dac_fs) * (cheight - 2), 10) -
          2
        )
      }
      var c = document.getElementById("canvas")
      var ctx = c.getContext("2d")
      ctx.beginPath()
      ctx.clearRect(0, 0, cwidth, cheight)
      ctx.strokeStyle = "#000000"
      // console.log(ctx);
      ctx.moveTo(0, calc_h(0))
      for (i = 0; i < wave_arr_length; i++) {
        ctx.lineTo(calc_w(i), calc_h(i))
      }
      ctx.stroke()

      // draw index indicator if in User Waveforms
      if (data.fxn.indexOf("User") === 0) {
        ctx = c.getContext("2d")
        ctx.beginPath()
        ctx.strokeStyle = "#FF0000"
        ctx.moveTo(calc_w(wave_index), calc_h(wave_index))
        ctx.arc(calc_w(wave_index), calc_h(wave_index), 2, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }, canvas_delay)
  } else {
    meas_div.hide()
  }

  switch (data.fxn) {
    case "Settings":
      $("#adj_controls, #trigger_controls").hide()
      break
    default:
      meas_div.css({ "text-align": "center" })
      $("#adj_controls, #trigger_controls").show()
  }

  let controls = ""
  let param_set = 0 // only one param set
  for (let i = 0; i < data.params[param_set].length; i++) {
    data.params[param_set][i].dig_num = data.digit_num
    data.params[param_set][i].cmd = data.cmd
    controls += display_param(data.params[param_set][i])
  }
  // controls += display_param({ label: "<span class='hide'>a</span>", type: "param_buttons"})
  $("#params").html(controls)

  function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1)
  }

  $(".slider_input_div").each(function (indx) {
    let item = $(this).attr("item") // ie. 'scale';
    function find_param(param) {
      dbugger.print(capitalizeFirstLetter(item) + ": ", false)
      return param.label === capitalizeFirstLetter(item) + ": "
    }

    const res = data.params[0].find(find_param)
    if (res) {
      let item_max = data[$(this).attr("max")]
      let item_min = data[$(this).attr("min")]
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
      if (data[item] === "disabled" || res["value"] === "N/A") {
        items.prop("disabled", true)
      } else {
        items
          .prop("disabled", false)
          .attr("max", item_max)
          .attr("min", item_min)
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
  })

  //$("#cv_val, #cv_val_slider").prop("disabled", data.fxn==="LFO");

  // now set selected components input control
  // let selected_data;
  let is_selected = (param) => {
    return param.selected === "true"
  }
  selected_data = data.params[0].find(is_selected)
  if (selected_data) {
    console.log("Selected: ", selected_data)
    //let selected_data=data.params[0][data.param_num];
    //let selected_param= $($("#params .param_div input[component]")[data.param_num]);
    let selected_param = $("#params .param_div .selected input")
    // console.log("Selected param: ",selected_param);
    // console.log($("div.selected.param"))
    // let the_input = selected_param.find("input");
    if (
      !(
        selected_data.type === "radio" ||
        (selected_data.type === "select" &&
          selected_data.values.split(",").length === 1)
      )
    ) {
      // console.log("Component: " +the_input.attr("component"));
      // console.log("Component: " +selected_data.type);
      //display_input(selected_data);
      $("#param_head").html(`<strong>Enter ${selected_data.label}</strong>`)
      $("#param_value").html(display_input(selected_data))
      let a = $("#param_value").detach()
      console.log(a)
      $("div.selected.param").append(a)
      switch (selected_param.attr("component")) {
        case "select":
          $("#param_value").css("top", 0)
          break
        default:
          dbugger.print(`Component: ${selected_param.attr("component")}`, false)
      }
      // $("#param_input").val(selected_param.find("input").val());
      $("#inc_controls").show()
    } else {
      // $("#input_div").hide();
    }
    if (data.fxn_num == 8 && data.fxn.indexOf("User") == 0) {
      let p_num = selected_data.param_num
      dbugger.print("selected: " + p_num, false)
      let hint
      switch (p_num) {
        case "1":
          hint = "Click on graph to set <em>index</em>"
          break
        case "2":
          hint = "Click on graph to set <em>value</em>"
          break
        default:
          hint = ""
      }
      $("#message_div").html(hint)
    } else {
      $("#message_div").html("")
    }
  } else {
    $("#input_div, #inc_controls").hide()
  }
  //console.log(data.fxns);

  if (data.fxns) {
    let fxns = ""
    for (let i = 0; i < data.fxns.length; i++) {
      fxns += fxn_button(data, i)
    }
    $("#fxn_buttons").html(fxns)
    //console.log(fxns);
    cmd_buttons = $("button[data-ref]")
  }
  // $("#control_div button[data-ref]").prop("disabled",false)
  const num_params = $("#params .param_div").length
  dbugger.print(`Num params: ${num_params}`, false)
  $("#param_buttons button").prop("disabled", num_params < 2)
  const selected_type = $("#param_input").attr("type")
  $("#lr_buttons button, #inc_controls button").prop(
    "disabled",
    (selected_type !== "number" && selected_type !== "text") ||
      $("#param_input").is(":hidden")
  )

  if ($("div.param_div label")[15])
    $("div.param_div label")[15].innerHTML = "Idle Value: "
  // $("div.param_div label")[15].innerHTML="Idle Value(x1000): "
}

;(function ($) {
  // console.log("Hey there!!!!!");
  $("div.navigation-top").remove()
  let snapshot = ""
  cmd_buttons = $("button[data-ref]")
  let params = $("#params")

  $("#canvas").on("mousemove", function (e) {
    let title
    switch (selected_data.param_num) {
      case "1":
        selected_val = parseInt((e.offsetX * 128) / $(this).width())
        title = `Index: ${selected_val}`
        break
      case "2":
        selected_val = 4095 - parseInt((e.offsetY * 4095) / $(this).height())
        title = `Value: ${selected_val}`
        break
      default:
        selected_val = NaN
        title = ""
    }
    $(this).attr("title", title)
  })

  $("#canvas").on("click", function (e) {
    if (!isNaN(selected_val)) {
      // console.log("On click")
      $(`input[name=p${selected_data.param_num}]`).val(selected_val)
      switch (selected_data.param_num) {
        case "1":
          $(`input[name=p1]`).trigger("change")
          break
        case "2":
          $(`input[name=p2]`).trigger("change")
          send_cmd("!")
          break
        default:
      }
    }
  })

  $("#activate_button").on("click", function () {
    send_cmd("!")
  })

  $("#take_snapshot").on("click", function () {
    // $("#snapshot_text").html(snapshot);
    the_macro.put(snapshot)
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
    const trig_num = parseInt(
      $(this).parent().attr("id").replace("outputs", "")
    )
    dbugger.print(`Trigger: ${trig_num} Output: ${output_num}`, false)
    // set trigger number
    send_cmd(`t${trig_num}`)
    // toggle output
    send_cmd(`T2${output_num}`)
  })

  $("#control_div").on("click", "button[data-ref]", function () {
    let cmd = $(this).attr("data-ref")
    $(this).prop("disabled", true)
    send_cmd(cmd)
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
    // amend Idle Value legend
  })

  params.on("change", "input", function () {
    switch ($(this).attr("type")) {
      case "radio":
      case "checkbox":
        dbugger.print("Radio/Checkbox Input changed: " + $(this).val(), false)
        send_cmd($(this).attr("name"))
        let cmd = $(this).val()
        send_cmd(cmd)
        break
      default:
    }
    // let cmd = $(this).val();
    // send_cmd(cmd);
  })

  params.on("click", ".param_val", function () {
    const selected = $(this).hasClass("selected")
    let my = $(this).find("input")
    let my_name = my.attr("name")
    let my_type = my.attr("type")
    if (!selected) {
      send_cmd(my_name)
    } else {
      $("#param_value").css("top", 0)
      if (my_type === "number") {
      }
    }
  })

  let param_changing = false
  const param_value = $("#params, #adj_div")
  param_value.on("change focusin", "#param_input, input", function () {
    dbugger.print("Changin!", false)
    clearTimeout(timeout)
    param_changing = true
  })

  param_value
    .on("change", "#param_input", function () {
      dbugger.print("param_value Changin!", false)
      if ($(this).attr("type") === "text" && !$(this).hasClass("sequence")) {
        send_cmd("$" + $(this).val())
      } else {
        send_cmd($(this).val())
      }
      param_changing = false
    })
    .on("keypress", "input.sequence", function (e) {
      // !!! Don't print anything to console in this fxn. Crashes Chrome when entering value
      // const regexp = new RegExp(`[UDTBCS\\r\\n]`);
      const regexp = new RegExp(`[${legal_values}\\r\\n]`)
      var txt = String.fromCharCode(e.which)
      if (!txt.match(regexp)) {
        return false
      }
    })
    .on("keypress", "input.text_input", function (e) {
      // !!! Don't print anything to console in this fxn. Crashes Chrome when entering value
      const regexp = new RegExp(`[^%#]+`)
      var txt = String.fromCharCode(e.which)
      if (!txt.match(regexp)) {
        return false
      }
    })

  async function send_one_cmd(cmd) {
    await send_cmd(cmd)
  }

  // macros
  let the_macro = {
    state: "IDLE",
    recorded_macro: [],
    macro_elem: $("#macro"),
    record_button: $("#rec_macro"),
    clr_button: $("#clr_macro"),
    exe_button: $("#exe_macro"),
    snapshot_button: $("#take_snapshot"),
    is_recording: function () {
      return this.state === "REC"
    },
    macro_exists: function () {
      return (
        Array.isArray(this.recorded_macro) && this.recorded_macro.length > 0
      )
    },
    set_buttons: function () {
      this.exe_button.prop("disabled", !this.macro_exists())
    },
    set_text: function () {
      this.macro_elem.val(JSON.stringify(this.recorded_macro))
    },
    put: function (val) {
      try {
        this.recorded_macro = JSON.parse(val)
        this.set_text()
      } catch (e) {
        dbugger.print("Didn't parse")
      }
      this.set_buttons()
    },
    clr: function () {
      dbugger.print("Clr Macro", false)
      this.put("[]")
    },
    append: function (val) {
      this.recorded_macro.push(val)
      this.set_text()
    },
    put_state: function (state) {
      this.state = state
      this.set_buttons()
      let background_color = ""
      switch (this.state) {
        case "IDLE":
          background_color = ""
          $("#macro_buttons .indicator")
            .html("&nbsp;")
            .css("background-color", background_color)
          this.record_button
            .html("Record")
            .attr("title", "Click to Start Recording")
            .css("background-color", "#444444")
            .prop("disabled", false)
          this.snapshot_button.prop("disabled", false)
          break
        case "REC":
          background_color = "#f00"
          $("#rec_state")
            .html(this.state)
            .css("background-color", background_color)
          this.record_button
            .html("Stop")
            .attr("title", "Click to Stop Recording")
            .prop("disabled", false)
            .css("background-color", "#888")
          this.snapshot_button.prop("disabled", true)
          break
        case "EXEC":
          background_color = "#080"
          $("#play_state")
            .html(this.state)
            .css("background-color", background_color)
          this.record_button
            .prop("disabled", true)
            .css("background-color", "#888")
          this.snapshot_button.prop("disabled", true)
          break
      }
    },
    set: function () {
      this.put_state("REC")
    },
    reset: function () {
      this.put_state("IDLE")
    },
    toggle: function () {
      this.put_state(this.is_recording() ? "IDLE" : "REC")
    },
    execute: function () {
      this.put_state("EXEC")
      this.clr_button.prop("disabled", true)
      this.exe_button.prop("disabled", true)
      let macro = this.macro_elem.val()
      console.log("Macro: " + macro)
      let op = ""

      //let parts = macro.split("\n");
      let parts = this.recorded_macro
      let i
      console.log("Parts", parts)
      for (let i = 0; i < parts.length; i++) {
        send_cmd(parts[i])
      }
      send_cmd("e")
    },
    end: function () {
      //console.log("Ending macro");
      $("#exe_macro, #clr_macro").prop("disabled", false)
      this.reset()
    },
    init: function () {
      let self = this
      this.reset()
      this.clr()
      this.clr_button.on("click", function () {
        self.clr()
      })

      $("#rec_macro").on("click", function () {
        self.toggle()
      })

      this.exe_button.on("click", function (e) {
        e.preventDefault()
        self.execute()
      })

      $("#macro").on("keyup", function () {
        self.put($(this).val())
        self.set_buttons()
      })
    },
  }
  the_macro.init()
  the_macro.set_buttons()

  const the_queue = {
    queue: [],
    busy: false,
    enqueue: function (item) {
      this.queue.push(item)
    },
    dequeue: function () {
      if (this.busy) {
        console.log("Hey, I'm busy!")
      } else {
        return this.queue.shift()
      }
    },
    data_available: function () {
      return this.queue.length > 0 && !this.busy
    },
    debug: function () {
      console.log(this.queue)
    },
  }

  function take_snapshot(data) {
    // todo capture all user data
    // console.log(data);
    let retval = 0
    let item = ""
    let out = []

    // if(data.fxns) {
    //     const fxn = data.fxns.indexOf(data.fxn);
    //     let item=`f${fxn}`;
    //     out.push(item);
    // }

    item = `f${data.fxn_num}`
    out.push(item)
    data.params[0].forEach(function (val, indx) {
      out.push(`p${indx}`)
      out.push(val.type == "text" ? "$" + val.value : val.numeric_val)
    })

    return JSON.stringify(out)
  }

  receive_data = function (text) {
    dbugger.print(text, false)
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.log(e)
    }
    // data = text

    console.log("Receiving:", data)
    snapshot = take_snapshot(data)
    // console.log(snapshot);

    if (data.cmd === "e") {
      the_macro.end()
    } else {
      //if(cmd.substr(0,1)!=="p" && data.fxn) widget(data);
      if (data.fxn && !param_changing) widget(data)
      param_changing = false
    }
    the_queue.busy = false
  }

  async function _send_cmd(cmd) {
    const res = prep_request(cmd)
    if (res.fail) return
    cmd = res.cmd
    the_queue.busy = true

    try {
      request_data(cmd)
    } catch (e) {
      console.log(e)
      data.err = e
    }
  }

  function send_cmd(cmd) {
    if (the_macro.is_recording() && cmd !== "\n") {
      the_macro.append(cmd)
    }
    the_queue.enqueue(cmd)
  }

  function refresh_screen() {
    send_cmd("\n")
  }

  $("#refresh_button").on("click", function () {
    // $("#control_div").fadeOut(50);
    refresh_screen()
  })

  // heartbeat manages the_queue
  let timeout
  setInterval(function () {
    param_changing = false
    if (the_queue.data_available()) {
      clearTimeout(timeout)
      _send_cmd(the_queue.dequeue())
    } else {
      if (data.triggered === "ON" && data.fxn === "Bounce") {
        data.triggered = "OFF"
        timeout = setTimeout(refresh_screen, 1000)
      }
    }
  }, 250)
  if (typeof url !== "undefined") refresh_screen()
})(jQuery)
