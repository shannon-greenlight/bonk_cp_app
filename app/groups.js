// index.htm is kept common to all projects
// the data from each device is tailored to the actual number of outputs
// while the html uses 8 outputs for all devices

const OUTPUT_GROUP = 1 // for outputs
const INPUT_GROUP = 9 // for bounce
const GROUP_GROUP = 10 // for group
let group = { outputs: 0 } // for Group Button
let group_active = false

class OutputGroup {
  constructor(group_type) {
    this.group_type = group_type
    this.num_outputs = group_type === INPUT_GROUP ? 2 : 8
  }

  toggle_output(output_num, trig_num = 0) {
    this.outputs ^= 1 << output_num
    if (device.type === "Fafnir's Fire") {
      if (output_num > 3) {
        this.outputs ^= 1 << (output_num - 4)
      } else {
        this.outputs ^= 1 << (output_num + 4)
      }
    }
    if (this.group_type === GROUP_GROUP) {
      send_cmd(`G${this.outputs}`)
    } else {
      // set trigger number
      send_cmd(`t${trig_num}`)
      // toggle output
      send_cmd(`T2${output_num}`)
    }
  }
  render(obj, outputs) {
    this.group = obj
    this.outputs = outputs
    for (let i = 0; i < this.num_outputs; i++) {
      let o = this.group.find(
        `div:nth-of-type(${i + (this.group_type === INPUT_GROUP ? INPUT_GROUP : OUTPUT_GROUP)})`
      )
      dbugger.print(`Output: ${o.html()}`, this.group_type === INPUT_GROUP)
      dbugger.print(this.outputs, this.group_type === INPUT_GROUP)
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

    // disable group button if no outputs are grouped
    const outputs_grouped = (this.outputs & (this.outputs - 1)) !== 0
    $("#group")
      .prop("disabled", !outputs_grouped)
      .css("background-color", outputs_grouped ? group_button.active_color : "")

    if (!outputs_grouped) {
      $("#group").attr("title", "Select more than one output to enable.")
    } else {
      $("#group").attr("title", group_button.get_group_title())
    }

    // allow only one active at any time when in bounce
    if (this.group_type === INPUT_GROUP && this.outputs > 0) {
      dbugger.print(`Inputs: ${this.outputs}`, false)
      switch (this.outputs) {
        case 1:
          this.group.find(`div:nth-of-type(${INPUT_GROUP + 1})`).hide()
          break
        case 2:
          this.group.find(`div:nth-of-type(${INPUT_GROUP})`).hide()
          break
      }
    }
  }
}

const inputs_group = new OutputGroup(INPUT_GROUP)
const outputs_group = new OutputGroup(OUTPUT_GROUP)
const groups_group = new OutputGroup(GROUP_GROUP)

const groups_obj = {
  on_load: function () {
    $("#group").on("click", function () {
      const send_param = group_active ? 0 : 1
      dbugger.print(`Send Param: ${send_param}`, false)
      send_cmd(`g${send_param}`)
    })
  },
  render: function () {
    group_active = data_handler.data.group_active == "1"
    group_button.set(group_active ? "ON" : "OFF")
    data_handler.data.triggers.forEach(function (trigger, index, arr) {
      if (data_handler.in_bounce()) {
        let inputs = parseInt(trigger.outputs) >> data_handler.globals.num_outputs
        let obj = $(`#outputs${index}`)
        inputs_group.render(obj, inputs)
      } else {
        let outputs = parseInt(trigger.outputs) & 0xff
        let obj = $(`#outputs${index}`)
        outputs_group.render(obj, outputs)
      }
    })
    groups_group.render($(`#outputs4`), data_handler.data.group)
  },
}
