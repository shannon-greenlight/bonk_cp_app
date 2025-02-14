const meas_div = $("#meas_div")
const the_canvas = $("#canvas")
const system_message_div = $("#system_message_div")
const canvas_message_div = $("#canvas_message_div")

const app = {
  snapshot: "",
  selected_data: null,
  render: function () {
    // console.log(`The app says: Hello ${device.type}!`)
    // console.log()

    let ver = data_handler.globals.software_version.split(".")

    if (ver[0] != "v4" || parseInt(ver[1]) < 1) {
      alert("Software version is too old. Please update to v4.1.0 or later.")
      return
    }

    if (!data_handler.data) {
      alert("No data! Make sure all triggers are off, then try again...")
      return
    }

    this.selected_data = data_handler.find_selected_data()
    this.draw_fxn_buttons()
    device.render()
    groups_obj.render()
    controls_obj.render()
    outputs_obj.render()
    triggers_obj.render()
    params_obj.render()
    sliders_obj.render()
    canvas_obj.render()
    skin_button.render()
    activate_button.render()

    this.adjust_range_label()
  },

  // "private" methods
  adjust_range_label: function () {
    // set Range: Custom is scale or offset aren't 'default'
    if (data_handler.in_output_fxn()) {
      const scale = data_handler.find_param("Scale").value
      const offset = data_handler.find_param("Offset").value
      // const scale = data_handler.data.params[0][12].value
      // const offset = data_handler.data.params[0][13].value
      if (
        device.type != "Bonkulator" &&
        ((scale != 50 && scale != 100) || (offset != 0 && offset != 50))
      ) {
        $("div.param_div input[name=p11]+ div.param_body").html("Custom")
      }
    }
  },
  fxn_button: function (i) {
    const fxn = data_handler.globals.fxns[i]
    const selected = fxn.indexOf(data_handler.data.fxn) === 0 ? "selected " : ""
    const grouped = data_handler.data.group & (1 << i) ? "grouped " : ""
    //console.log(fxn,i,selected);
    return `<button id="fxn_button_${i}" title="f${i}" class="${selected}${grouped}cmd_button" data-ref="f${i}">${fxn}</button>`
  },
  draw_fxn_buttons: function () {
    //console.log(globals.fxns);
    if (data_handler.globals.fxns) {
      let fxns = ""
      for (let i = 0; i < data_handler.globals.fxns.length; i++) {
        fxns += this.fxn_button(i)
      }
      $("#fxn_buttons").html(fxns)
      //console.log(fxns);
    }
  },
}

;(function ($) {
  $("div.navigation-top").remove()

  busy_obj.on_load($("#busy_div"))
  waveform_obj.on_load()
  canvas_obj.on_load()
  controls_obj.on_load()
  outputs_obj.on_load()
  groups_obj.on_load()
  triggers_obj.on_load()
  params_obj.on_load()
  sliders_obj.on_load()
  skin_button.on_load()

  // Create a <style> element
  const style = document.createElement("style")
  document.head.appendChild(style)
  sheet = style.sheet // sheet defined in CSSRules.js

  if (typeof url !== "undefined") refresh_screen()
})(jQuery)
