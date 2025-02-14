const params = $("#params")
const param_value = $("#params, #adj_div")
let legal_values

const params_obj = {
  on_load: function () {
    let slider_index = 0
    const slider_max = $("#adj_div .slider_input_div").length - 1
    $("body").on("keyup", function (event) {
      if (event.target.localName != "textarea") {
        const key = event.key
        // console.log(`Key pressed: key: ${key}, code: ${event.code}`)
        switch (key) {
          case "Home":
            send_cmd("p0")
            break
          case "End":
            send_cmd("p99")
            break
          case "ArrowUp":
            send_cmd("[A")
            break
          case "ArrowDown":
            send_cmd("[B")
            break
          case "ArrowRight":
            send_cmd("[C")
            break
          case "ArrowLeft":
            send_cmd("[D")
            break
          case "u":
          case "d":
            send_cmd(key)
            break
          case "<":
            send_cmd(":0")
            break
          case ">":
            send_cmd(":99")
            break
        }
      }
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

    params.on("click", ".param_div", function () {
      const selected = $(this).find(".param_val").hasClass("selected")
      let my = $(this).find(".param_val input")
      let my_name = my.attr("name")
      let my_type = my.attr("type")
      dbugger.print("input clicked: " + my_name + " " + my_type, false)
      if (!selected) {
        send_cmd(my_name)
      } else {
        $("#param_value").css("top", 0)
        if (my_type === "number") {
        }
      }
    })

    param_value.on("change focusin", "#param_input, input", function (e) {
      // console.log(e.currentTarget.name)
      dbugger.print("Changin!", false)
      clearTimeout(timeout)
      param_changing = true
    })

    param_value
      .on("change", "#param_input", function () {
        dbugger.print("param_value Changin!", false)
        if ($(this).attr("type") === "text" || $(this).hasClass("sequence")) {
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

    $("#control_div").on("click", "button[data-ref]", function () {
      let cmd = $(this).attr("data-ref")
      // $(this).prop("disabled", true)
      send_cmd(cmd)
    })

    $("#info_button").on("click", function () {
      canvas_obj.set_meas_view(SHOW_MESSAGE)
      let message = `<h3>Keyboard Shortcuts</h3>`
      message += `<p><strong>Home:</strong> First parameter</p>`
      message += `<p><strong>End:</strong> Last parameter</p>`
      message += `<p><strong>Arrow Up:</strong> Next parameter</p>`
      message += `<p><strong>Arrow Down:</strong> Previous parameter</p>`
      message += `<p><strong>Arrow Right:</strong> Next Digit</p>`
      message += `<p><strong>Arrow Left:</strong> Previous Digit</p>`
      message += `<p><strong>u:</strong> Increment Selected Digit</p>`
      message += `<p><strong>d:</strong> Decrement Selected Digit</p>`
      message += `<p><strong>&lt;:</strong> Most Significant Digit</p>`
      message += `<p><strong>&gt;:</strong> Least Significant Digit</p>`
      $("#system_message_div").html(message)
      // $("#control_div").fadeOut(50);
    })

    $("#refresh_button").on("click", function () {
      // $("#control_div").fadeOut(50);
      refresh_screen()
    })
  },

  display_param: function (data) {
    // console.log(data);
    const param_num = data.param_num
    let data_value = data.value
    let tail
    const end_param_body = "</div><!-- end param_body -->"
    const is_selected = data.selected === "true"
    const id = is_selected ? `id="selected_param_div" ` : ""
    const selected_class = is_selected ? " selected" : ""
    let control = "<div " + id + "class='param_div" + selected_class + "' >"
    control +=
      " <div class='param param_head'><div class='param_label'>" + data.label + "</div></div>"
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
          if (data_handler.data.cmd === "p") {
            if ($(`input[name=${input_name}][value=${i}]:checked`).length) control += " checked "
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
        dbugger.print(`Data val: ${data_value}`, false)
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
        control += `<span class="${hilight}">${dval.substr(data.dig_num, 1)}</span>${tail}</div>`
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
            if (data.dp > 1 && data.num_digits - data.dp >= Math.log10(data.max)) {
              int_part = zeroPad(int_part, 2)
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
        if (data.selected === "true" && (data.type === "number" || data.type === "text")) {
          tail = n.slice(parseInt(data.dig_num) + 1)
          control += plussign
          control += n.slice(0, data.dig_num)
          control +=
            "<span class='hilight'>" +
            n.substr(data.dig_num, 1) +
            "</span>" +
            tail +
            data.units +
            end_param_body
        } else {
          control += plussign + n + data.units + end_param_body
        }

        control += "</div>"
    }
    control += " <div class='clear' /> <!-- clear param -->"
    control += "</div></div>" // closes #param_div
    return control
  },

  display_input: function (data) {
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
        control += ' type="text" maxlength="15"'
        control += ' class="text_input"'
        control += ' value="' + data.value + '" />'
        break
    }
    return control
  },

  display_params: function () {
    const param_set = 0 // only one param set
    let controls = ""
    if (data_handler.data.params[param_set]) {
      for (let i = 0; i < data_handler.data.params[param_set].length; i++) {
        const param = data_handler.data.params[param_set][i]
        controls += this.display_param(param)
      }
    }
    params.html(controls)
  },

  render: function (data) {
    $("#param_fxn_label").html(data_handler.data.fxn)
    this.display_params()
    $("#input_div .param_div").append('<div id="param_value" class="param"></div>')
    // set selected components input control
    if (app.selected_data) {
      this.set_selected_param(app.selected_data)
    }
    this.set_param_nav_buttons()

    // make sure selected param is visible when not executing a macro
    if (app.selected_data && the_macro.state == "IDLE") {
      if (app.selected_data.type == "select") {
        const values = app.selected_data.values.split(",")
        $("#default_button").prop("disabled", values.length == 1)
      }

      const target = $("#selected_param_div")
      const targetOffset = target.offset().top
      const targetHeight = target.outerHeight()
      const container = params // $("#params")
      const containerOffset = container.offset().top
      const containerHeight = container.height()
      const scrollPosition = targetOffset - containerOffset - containerHeight / 2 + targetHeight / 2

      container.animate(
        {
          scrollTop: container.scrollTop() + scrollPosition,
        },
        150
      ) // Duration in milliseconds
    }
  },

  set_selected_param: function (selected_data) {
    // dbugger.print("Selected: ", selected_data)
    let selected_param = $("#params .param_div .selected input")
    // console.log("Selected param: ",selected_param);
    // console.log($("div.selected.param"))
    if (
      !(
        selected_data.type === "radio" ||
        (selected_data.type === "select" && selected_data.values.split(",").length === 1)
      )
    ) {
      // console.log("Component: " +the_input.attr("component"));
      // console.log("Component: " +selected_data.type);
      $("#param_head").html(`<strong>Enter ${selected_data.label}</strong>`)
      $("#param_value").html(this.display_input(selected_data))
      let a = $("#param_value").detach()
      //console.log(a)
      $("div.selected.param").append(a)
      switch (selected_param.attr("component")) {
        case "select":
          $("#param_value").css("top", 0)
          break
        default:
          dbugger.print(`Component: ${selected_param.attr("component")}`, false)
      }
    }
  },

  set_param_nav_buttons: function () {
    if (!data_handler.in_user_fxn()) {
      $("#control_div #param_box button[data-ref]").prop("disabled", false)
      const num_params = $("#params .param_div").length
      dbugger.print(`Num params: ${num_params}`, false)
      $("#param_buttons button").prop("disabled", num_params < 2)
      const selected_type = $("#param_input").attr("type")
      $("#lr_buttons button").prop(
        "disabled",
        selected_type !== "number" && selected_type !== "text"
      )
      dbugger.print(`Selected type: ${selected_type}`, false)
    } else {
      $("#param_buttons button").prop("disabled", false)
    }
  },
}
