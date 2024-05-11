const triggers_obj = {
  build_triggers: function () {
    data_handler.data.triggers.forEach(function (trigger, index, arr) {
      let debug = false
      // console.log(trigger)
      // disable unselected triggers
      // remove group outputs if in bounce
      $(`#outputs4, #group, #group_label`).toggle(!common_obj.in_bounce())
      if (common_obj.in_bounce()) {
        let inputs = parseInt(trigger.outputs) >> 8
        let other_input = data_handler.data.fxn === "Bounce 1" ? 1 : 2
        $(`#t${trigger.trig_num}`).prop("disabled", inputs === 0 || inputs === other_input)
        dbugger.print(`Inputs: ${inputs} Other Input: ${other_input}`, false)
        dbugger.print(`#t${trigger.trig_num}`, false)
        dbugger.print(`Index: ${index}`, false)
      } else {
        let outputs = parseInt(trigger.outputs) & 0xff
        $(`#t${trigger.trig_num}`).prop("disabled", outputs === 0)
        dbugger.print(`#t${trigger.trig_num}`, debug)
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
  },
  on_load: function () {
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
  },
}
