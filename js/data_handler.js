let data_handler = {
  data: null,
  status: null,
  status_received: false,
  receive_data: function (text) {
    const incoming_data = JSON.parse(text)
    this.status_received = incoming_data.status
    if (this.status_received) {
      this.status = incoming_data
    } else {
      this.data = incoming_data
    }
  },
  display_param: function (data) {
    // console.log(data);
    const param_num = data.param_num
    let data_value = data.value
    let tail
    const is_selected = data.selected === "true"
    const selected_class = is_selected ? " selected" : ""
    let control = "<div class='param_div" + selected_class + "' >"
    control += " <div class='param param_head'><label>" + data.label + "</label></div>"
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
        if (data.selected === "true" && (data.type === "number" || data.type === "text")) {
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
        control += ' type="text"'
        control += ' class="text_input"'
        control += ' value="' + data.value + '" />'
        break
    }
    return control
  },
  display_params: function (controls) {
    const param_set = 0 // only one param set
    if (this.data.params[param_set]) {
      for (let i = 0; i < this.data.params[param_set].length; i++) {
        this.data.params[param_set][i].dig_num = this.data.digit_num
        this.data.params[param_set][i].cmd = this.data.cmd
        controls += this.display_param(this.data.params[param_set][i])
      }
    }
    return controls
  },
  fxn_button: function (i) {
    let fxn = this.data.fxns[i]
    let selected = fxn.indexOf(this.data.fxn) === 0 ? "selected " : ""
    //console.log(fxn,i,selected);
    let out = `<button id="fxn_button_${i}" title="f${i}" class="${selected}cmd_button" data-ref="f${i}">${fxn}</button>`
    return out
  },
  draw_fxn_buttons: function () {
    //console.log(data.fxns);
    if (this.data.fxns) {
      let fxns = ""
      for (let i = 0; i < this.data.fxns.length; i++) {
        fxns += this.fxn_button(i)
      }
      $("#fxn_buttons").html(fxns)
      //console.log(fxns);
      //   cmd_buttons = $("button[data-ref]")
    }
  },
  find_selected_param: function () {
    if (this.data.params[0]) {
      return this.data.params[0].find(function is_selected(param) {
        return param.selected === "true"
      })
    } else {
      return null
    }
  },
  get_device_name: function () {
    return this.data.device_name
  },
  render_device_name: function () {
    const device_name = this.get_device_name()
    const bonk_title = `Hi! I'm ${device_name}, your ${device.type} and this is my Control Panel.
 You can do lots of things through this interface that you can't do from the front panel.
 And you don't have to wade through patch cords to get to the controls.`
    $("#head_div img").attr("title", bonk_title)
    $("#device_name").html(`"${device_name.trim()}"`)
  },
  get_wave_data: function () {
    if (this.data.message > "") {
      let wave_data
      try {
        wave_data = this.data.message.split(", ")
      } catch (e) {
        console.log(e)
      }
      return wave_data
    } else {
      return []
    }
  },
  param_is_active: function () {
    return this.data.param_active == "1"
  },
  find_selected_data: function () {
    return this.find_selected_param()
  },
}
