let snapshot = ""
let selected_data, selected_param

function widget() {
  if (data_handler.data.software_version < "v3.5.0") {
    alert("Software version is too old. Please update to v3.5.0 or later.")
    return
  }

  data_handler.render_device_name()
  data_handler.draw_fxn_buttons()

  selected_data = data_handler.find_selected_data()
  // console.log(selected_data)

  groups_obj.build_groups()
  controls_obj.build_controls()
  outputs_obj.build_outputs()
  triggers_obj.build_triggers()
  params_obj.build_params()
  sliders_obj.build_sliders()
  canvas_obj.build_canvas()
}

;(function ($) {
  console.log(`Hey ${device.type}`)
  $("div.navigation-top").remove()

  waveform_obj.on_load()
  canvas_obj.on_load()
  controls_obj.on_load()
  outputs_obj.on_load()
  groups_obj.on_load()
  triggers_obj.on_load()
  params_obj.on_load()
  sliders_obj.on_load()

  if (typeof url !== "undefined") refresh_screen()
})(jQuery)
