let throttled
const sliders_obj = {
  on_load: function () {
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
        const val = $(this).val()
        send_cmd(cmd + val)
        send_cmd(" ")
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
        send_cmd(" ")
      })
    })
  },
  build_slider: function (o) {
    let item = o.attr("item") // ie. 'scale';
    // console.log(o)
    // dbugger.print(`An Item: ${item}`, true)
    if (data_handler.data.params[0]) {
      const res = data_handler.find_param(item)
      if (res) {
        let item_max
        let item_min
        switch (item) {
          case "Idle Value":
          case "Active Time":
            item_max = res.max
            item_min = res.min
            break
          default:
            item_max = data_handler.data[o.attr("max")]
            item_min = data_handler.data[o.attr("min")]
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
  },
  build_sliders: function () {
    let self = this
    $(".slider_input_div").each(function (indx) {
      self.build_slider($(this))
    })
  },
  set_adj: function (search_label) {
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
  },
  set_display: function () {
    // hide sliders if bounce
    const sliders = $(
      "input#randomness_slider, div#randomness_slider_div,#idle_value_slider, input[id='Idle Value_slider'],#active_time_slider_div, input[id='Active Time_slider']"
    )
    if (bonk_obj.in_bounce()) {
      sliders.hide()
      $("#sample_time_slider,#SampleTime_slider").show()
    } else {
      sliders.show()
      $("#sample_time_slider,#SampleTime_slider").hide()

      // enable slider immediate update
      // do it here instead of in on_load because there is no data until now.
      $(".slider_input_div").each(function (indx) {
        const item = $(this).attr("item")
        let cmd = $(this).attr("cmd")
        dbugger.print(`Item: ${item}`, false)
        let slider = document.getElementById(`${item}_slider`)
        // console.log(slider)
        slider.addEventListener("input", function () {
          const val = this.value
          if (!throttled) {
            dbugger.print(`Slider: ${val}`, false)
            throttled = true
            setTimeout(() => {
              send_cmd(cmd + val)
              throttled = false
            }, 250)
          }
        })
      })
    }
    $(`.slider_input_div, .slider_input_div label`).removeClass("item_disabled")
    this.set_adj("CV0")
    this.set_adj("CV1")
  },
}
