const sliders_obj = {
  on_load: function () {
    $("#adj_div").on("mouseup", `input.item_slider`, function () {
      send_cmd($(this).attr("cmd") + $(this).val())
    })

    $(`#adj_div`).on("change", "div.slider_input input", function () {
      const val = $(this).val().replace(".", "")
      const cmd = $(this).attr("cmd")
      send_cmd(cmd + val)
      send_cmd(" ")
    })
  },
  render: function () {
    let self = this
    $("#adj_div").html("")
    data_handler.data.params[0].forEach(function (val, indx) {
      // console.log(val)
      if (val.is_slider === "1") {
        const val_label = val.label.replace(": ", "").replace("* ", "")
        let value = parseFloat(val.value) / Math.pow(10, val.dp)
        const is_disabled = isNaN(value) ? "disabled" : ""
        const disable_div_css = is_disabled ? "style='opacity:.3'" : ""

        let html = `<div id="${val_label}_container" ${disable_div_css}><div class="slider_input_div" label="${val_label}" max="scale_max" min="scale_min" item="${val_label}" cmd="${val.cmd}">`
        html += `<label for="${val_label}">${val_label}</label><div class="slider_input"><input id="${val_label}" type="number" step="1" min="0" max="100" value="${value}" cmd="${val.cmd}" ${is_disabled}/>${val.units}</div></div>`
        html += `<div id="${val_label}_div"><input id="${val_label}_slider"  ${is_disabled} class="item_slider" cmd="${val.cmd}" type="range" min="${val.min}" max="${val.max}" value="${val.value}"><div class="hash-marks"></div></div>`
        html += `</div>`
        $("#adj_div").append(html)

        // Create hash marks
        const hashMarksContainer = $(`div[id="${val_label}_div"] .hash-marks`)
        const numMarks = 4 // range / step

        for (let i = 1; i < numMarks; i++) {
          const mark = $('<div class="hash-mark"></div>')
          const position = (i / numMarks) * 100
          mark.css("left", `${position}%`)
          hashMarksContainer.append(mark)
        }
      }
    })

    $("#sliders_label").html(data_handler.data.slider_label)
    this.set_display()

    // Remove all Hilighted sliders, then hilight sliders that are in use by CV0 or CV1
    this.hilight_sliders()
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
      dbugger.print(`${search_label} not found!`, false)
    }
    if (param_index !== -1) {
      param_val = $(`input[name=p${param_index}]`).val()
      if (param_val != "Off") {
        dbugger.print(`Set Adjust! ${search_label} ${param_val}`, debug)
        $(
          `.slider_input_div[label='${param_val}'] input, .slider_input_div[label='${param_val}'] + input`
        ).addClass("item_in_use")
        $(
          `.slider_input_div[label='${param_val}'] label, .slider_input_div[label='${param_val}']`
        ).addClass("item_in_use")

        // add CV indication to Slider Label
        // $(`label[for='${param_val}']`).html(
        //   `${param_val}:<span class='cv_indicator'>${search_label}</span>`
        // )

        // add rule to hilight slider
        ruleIndex = addCSSRule(
          sheet,
          `div[id='${param_val}_div'] input[type="range"]::-webkit-slider-runnable-track`,
          "background: linear-gradient(to right, #cc9, #997733) !important;",
          0
        )
        // console.log(`Adding rule for ${param_val} Index: ${ruleIndex}`)
      }
    } else {
    }
  },
  set_display: function () {
    if ($("#adj_div .slider_input_div").length > 0) {
      $("#adj_controls").show()
    } else {
      $("#adj_controls").hide()
    }
  },
  hilight_sliders: function () {
    // remove dv indications from Slider Labels
    $(".slider_input_div").each(function (indx) {
      $(this).find("label").html($(this).find("label").attr("for"))
    })
    // Remove all Hilighted sliders
    removeAllCSSRules(sheet)

    // Hilight sliders that are in use by CV0 or CV1
    this.set_adj("CV0")
    this.set_adj("CV1")
  },
}
