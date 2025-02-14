class Button {
  constructor(id, active_color) {
    this.id = id
    this.active_color = active_color
    this.state = false
  }

  get_group_title() {
    let title = "Click "
    title += this.state ? "to Deactivate" : "to Activate"
    title += " group."
    return title
  }

  set(data, trigger) {
    const is_disabled = $(`#${this.id}`).prop("disabled")
    this.state = data === "ON"
    let opacity, title
    if (this.id === "group") {
      title = this.get_group_title()
      // title += this.state ? "to Deactivate" : "to Activate"
      // title += " group."
      opacity = this.state ? 0.4 : 0.2
    } else {
      title = "Click "
      dbugger.print(`${this.id} is_disabled: ${is_disabled}`, false)
      if (is_disabled) {
        title += "an Output to Enable Trigger."
        opacity = 0.2
      } else {
        // title += this.state ? " to Retrigger" : " to Trigger"
        title += " to Trigger/Stop Outputs."
        opacity = 0.4
      }
    }

    if (trigger !== undefined && data_handler.data.triggers) {
      data_handler.data.triggers[trigger].state = this.state ? "1" : "0"
    }

    $(`#${this.id}`)
      .css("background-color", this.active_color)
      .css("opacity", this.state ? 1 : opacity)
      .attr("title", title)
  }
}

const t0_button = new Button("t0", "green")
const t1_button = new Button("t1", "blue")
const t2_button = new Button("t2", "yellow")
const t3_button = new Button("t3", "red")
const group_button = new Button("group", "#602b65")
const trigger_buttons = [t0_button, t1_button, t2_button, t3_button]
