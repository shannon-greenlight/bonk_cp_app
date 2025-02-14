const triggers_obj = {
  render: function () {
    data_handler.data.triggers.forEach(function (trigger, index, arr) {
      let debug = false
      // console.log(trigger)
      // disable unselected triggers
      // remove group outputs if in bounce
      $(`#outputs4, #group, #group_label`).toggle(!data_handler.in_bounce())
      if (data_handler.in_bounce()) {
        let inputs = parseInt(trigger.outputs) >> data_handler.globals.num_outputs
        // let other_input = data_handler.data.fxn === "Bounce 1" ? 1 : 2
        let my_input = data_handler.data.fxn === "Bounce 1" ? 1 : 0
        let other_input = data_handler.data.fxn === "Bounce 1" ? 0 : 1
        inputs &= my_input == 0 ? 0x01 : 0x02
        $(`.bounce${other_input}`).hide()
        $(`.bounce${my_input}`).show()
        // $(`#t${trigger.trig_num}`).prop("disabled", inputs === 0 || inputs === other_input)
        $(`#t${trigger.trig_num}`).prop("disabled", inputs === 0)
        dbugger.print(`Inputs: ${inputs} Other Input: ${other_input}`, debug)
        dbugger.print(`#t${trigger.trig_num}`, debug)
        dbugger.print(`Index: ${index}`, debug)
      } else {
        let outputs = parseInt(trigger.outputs) & 0xff
        $(`#t${trigger.trig_num}`).prop("disabled", outputs === 0)
        dbugger.print(`#t${trigger.trig_num}`, debug)
        // console.log(`Button: ${index} `, trigger_buttons[index])
        trigger_buttons[index].set(data_handler.data.triggers[index].state === "1" ? "ON" : "OFF")
      }
    })
  },
  on_load: function () {
    $("#t0, #t2, #t2, #t3").on("click", function () {
      const index = parseInt($(this).attr("id").replace("t", ""))
      trigger_buttons[index].set("ON")
    })
  },
}
