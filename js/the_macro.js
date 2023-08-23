// macros
let the_macro = {
  state: "IDLE",
  recorded_macro: [],
  macro_elem: $("#macro"),
  record_button: $("#rec_macro"),
  clr_button: $("#clr_macro"),
  exe_button: $("#exe_macro"),
  snapshot_button: $("#take_snapshot"),
  is_recording: function () {
    return this.state === "REC"
  },
  macro_exists: function () {
    return Array.isArray(this.recorded_macro) && this.recorded_macro.length > 0
  },
  set_buttons: function () {
    this.exe_button.prop("disabled", !this.macro_exists())
  },
  set_text: function () {
    this.macro_elem.val(JSON.stringify(this.recorded_macro))
  },
  put: function (val) {
    try {
      this.recorded_macro = JSON.parse(val)
      this.set_text()
    } catch (e) {
      dbugger.print("Didn't parse")
    }
    this.set_buttons()
  },
  clr: function () {
    dbugger.print("Clr Macro", false)
    this.put("[]")
  },
  append: function (val) {
    this.recorded_macro.push(val)
    this.set_text()
  },
  put_state: function (state) {
    this.state = state
    this.set_buttons()
    let background_color = ""
    switch (this.state) {
      case "IDLE":
        background_color = ""
        $("#macro_buttons .indicator").html("&nbsp;").css("background-color", background_color)
        this.record_button
          .html("Record")
          .attr("title", "Click to Start Recording")
          .css("background-color", "#444444")
          .prop("disabled", false)
        this.exe_button.prop("disabled", false)
        this.snapshot_button.prop("disabled", false)
        break
      case "REC":
        background_color = "#f00"
        $("#rec_state").html(this.state).css("background-color", background_color)
        this.exe_button.prop("disabled", true)
        this.record_button
          .html("Stop")
          .attr("title", "Click to Stop Recording")
          .prop("disabled", false)
        // .css("background-color", "#888")
        this.snapshot_button.prop("disabled", true)
        break
      case "EXEC":
        background_color = "#080"
        $("#play_state").html(this.state).css("background-color", background_color)
        this.record_button.prop("disabled", true).css("background-color", "#888")
        this.exe_button.prop("disabled", true)
        this.snapshot_button.prop("disabled", true)
        break
    }
  },
  set: function () {
    this.put_state("REC")
  },
  reset: function () {
    this.put_state("IDLE")
  },
  toggle: function () {
    this.put_state(this.is_recording() ? "IDLE" : "REC")
  },
  execute: function () {
    this.put_state("EXEC")
    this.clr_button.prop("disabled", true)
    this.exe_button.prop("disabled", true)
    let macro = this.macro_elem.val()
    console.log("Macro: " + macro)
    let op = ""

    //let parts = macro.split("\n");
    let parts = this.recorded_macro
    let i
    console.log("Parts", parts)
    for (let i = 0; i < parts.length; i++) {
      send_cmd(parts[i])
    }
    send_cmd("e")
  },
  end: function () {
    //console.log("Ending macro");
    $("#exe_macro, #clr_macro").prop("disabled", false)
    this.reset()
  },
  init: function () {
    let self = this
    this.reset()
    this.clr()
    this.clr_button.on("click", function () {
      self.clr()
    })

    $("#rec_macro").on("click", function () {
      self.toggle()
    })

    this.exe_button.on("click", function (e) {
      e.preventDefault()
      self.execute()
    })

    $("#macro").on("keyup", function () {
      self.put($(this).val())
      self.set_buttons()
    })
  },
}
the_macro.init()
the_macro.set_buttons()
