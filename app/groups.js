const OUTPUT_GROUP = 1 // for outputs
const INPUT_GROUP = 9 // for bounce
const GROUP_GROUP = 10 // for group
let group = { outputs: 0 } // for Group Button
const group_button = new Button("group", "#602b65", "#a06ba5")
let group_active = false

class OutputGroup {
  constructor(group_type) {
    this.group_type = group_type
    this.num_outputs = group_type === INPUT_GROUP ? 2 : 8
  }

  toggle_output(output_num, trig_num = 0) {
    this.outputs ^= 1 << output_num
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
      let o = this.group.find(`div:nth-of-type(${i + (this.group_type === INPUT_GROUP ? 9 : 1)})`)
      dbugger.print(`Output: ${o.html()}`, false)
      dbugger.print(this.outputs, false)
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
    // allow only one active at any time when in bounce
    if (this.group_type === INPUT_GROUP && this.outputs > 0) {
      dbugger.print(`Inputs: ${this.outputs}`, false)
      switch (this.outputs) {
        case 1:
          this.group.find(`div:nth-of-type(${2 + 8})`).hide()
          break
        case 2:
          this.group.find(`div:nth-of-type(${1 + 8})`).hide()
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
  build_groups: function () {
    group.outputs = data_handler.data.group
    group_button.trigger = group
    group_active = data_handler.data.group_active == "1"
    group_button.set(group_active ? "ON" : "OFF")
    data_handler.data.triggers.forEach(function (trigger, index, arr) {
      if (bonk_obj.in_bounce()) {
        let inputs = parseInt(trigger.outputs) >> 8
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
