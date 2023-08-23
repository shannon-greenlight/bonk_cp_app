class Button {
  constructor(id, active_color, selected_color) {
    this.id = id
    this.active_color = active_color
    this.selected_color = selected_color
  }

  set(data) {
    const selected = this.trigger.outputs !== 0
    const inactive_color = selected ? this.selected_color : "#aaa"
    $(`#${this.id}`).css("background-color", data === "ON" ? this.active_color : inactive_color)
  }
}

const t0_button = new Button("t0", "green", "#6d6")
const t1_button = new Button("t1", "blue", "#66d")
const t2_button = new Button("t2", "yellow", "#dd6")
const t3_button = new Button("t3", "red", "#d66")
