class Button {
  constructor(id, active_color, selected_color) {
    this.id = id
    this.active_color = active_color
    this.selected_color = selected_color
    this.state = false
    this.trigger = {}
  }

  set(data) {
    this.state = data === "ON"
    const selected = this.trigger.outputs !== 0
    const inactive_color = selected ? this.selected_color : "#aaa"

    let title = "Click "
    if (this.id === "group") {
      title += this.state ? "to Deactivate" : "to Activate"
      title += " group."
    } else {
      const is_disabled = $(`#${this.id}`).prop("disabled")
      dbugger.print(`${this.id} is_disabled: ${is_disabled}`, false)
      if (is_disabled) {
        title += "an Output to Enable Trigger."
      } else {
        title += this.state ? " to Retrigger" : " to Trigger"
        title += " Outputs."
      }
    }

    $(`#${this.id}`)
      .css("background-color", this.state ? this.active_color : inactive_color)
      .attr("title", title)
  }
}

const t0_button = new Button("t0", "green", "#6d6")
const t1_button = new Button("t1", "blue", "#66d")
const t2_button = new Button("t2", "yellow", "#dd6")
const t3_button = new Button("t3", "red", "#d66")
