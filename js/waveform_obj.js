// draw waveform stuff
let waveform_obj = {
  OP_MODE_NORMAL: 0,
  OP_MODE_DRAW: 1,
  op_mode: this.OP_MODE_NORMAL, // normal, draw

  DRAW_MODE_OFF: 0,
  DRAW_MODE_ON: 1,
  draw_mode: this.DRAW_MODE_OFF,

  dac_fs: 3984,

  c: 0,
  ctx: 0,
  wave_arr: [],
  wave_arr_length: 0,
  cwidth: 0,
  cheight: 0,
  get_w: function (frac) {
    return parseInt(frac * this.cwidth, 10)
  },
  calc_w: function (i) {
    return this.get_w(i / this.wave_arr_length)
  },
  get_h: function (frac) {
    return this.cheight - parseInt(frac * this.cheight + 0.5, 10)
    // return this.cheight - parseInt(frac * (this.cheight - 2), 10) - 2
  },
  calc_h: function (i) {
    // return this.get_h(this.wave_arr[i] / 3966) + 3
    return Math.min(this.cheight - 2, Math.max(1, this.get_h(this.wave_arr[i] / this.dac_fs) + 3))
  },
  set_variables: function () {
    this.c = document.getElementById("canvas")
    this.ctx = this.c.getContext("2d")
    this.wave_arr_length = this.wave_arr.length
    this.cwidth = the_canvas.width()
    this.cheight = the_canvas.height()
  },
  // draw grid
  draw_grid: function () {
    this.set_variables()
    let self = this
    self.ctx.beginPath()
    self.ctx.strokeStyle = "#aaaaaa"
    self.ctx.font = "12px Arial" // Set the font for numbering
    self.ctx.fillStyle = "#000000" // Set the color for numbering
    // console.log(ctx);

    // draw horizontal lines
    for (i = 0; i <= 10; i++) {
      if (i == 5) {
        self.ctx.strokeStyle = "#888888"
      } else {
        self.ctx.strokeStyle = "#aaaaaa"
      }
      self.ctx.beginPath() // Begin a new path
      self.ctx.moveTo(self.get_w(0), self.get_h(i / 10))
      self.ctx.lineTo(self.get_w(1), self.get_h(i / 10))
      self.ctx.stroke() // Render the line
    }

    // draw vertical lines
    for (i = 0; i <= 16; i++) {
      if (i == 8) {
        self.ctx.strokeStyle = "#888888"
      } else {
        self.ctx.strokeStyle = "#aaaaaa"
      }
      self.ctx.beginPath() // Begin a new path
      self.ctx.moveTo(self.get_w(i / 16), self.get_h(0))
      self.ctx.lineTo(self.get_w(i / 16), self.get_h(1))
      self.ctx.stroke() // Render the line

      // Set the font and fill style for numbering
      self.ctx.font = "12px Arial"
      self.ctx.fillStyle = "#888888" // Ensure the text color matches grid color

      // show volts on middle line
      let plus_max_v
      let minus_max_v
      if (device.type === "Bonkulator") {
        if (data_handler.in_output_fxn()) {
          if (data_handler.data.params[0][11].numeric_val === "1") {
            // are we in 0-10V range?
            plus_max_v = 10
            minus_max_v = 0
          } else {
            plus_max_v = 5
            minus_max_v = -5
          }
        } else {
          plus_max_v = "Max "
          minus_max_v = "-Max "
        }
      } else {
        plus_max_v = 10
        minus_max_v = -10
      }

      if (i == 8) {
        self.ctx.fillText(`${minus_max_v}V`, self.get_w(i / 16) + 5, self.get_h(0) - 2)
        self.ctx.fillText(`+${plus_max_v}V`, self.get_w(i / 16) + 5, self.get_h(1) + 12)
      }
    }
    // self.ctx.stroke()
  },
  // draw index indicator if in User Waveforms
  draw_index: function (indx) {
    this.set_variables()
    let wave_index
    if (data_handler.in_user_waveforms()) {
      wave_index = parseInt($(`input[name=p1]`).val())
    } else if (data_handler.data.fxn_num < 8) {
      wave_index = indx
    }

    if (data_handler.in_user_waveforms() || data_handler.data.fxn_num < 8) {
      this.ctx.beginPath()
      this.ctx.strokeStyle = "#FF0000"
      this.ctx.moveTo(this.calc_w(wave_index), this.calc_h(wave_index))
      this.ctx.arc(this.calc_w(wave_index), this.calc_h(wave_index), 2, 0, 2 * Math.PI)
      this.ctx.stroke()
    }
  },
  draw_waveform: function () {
    this.set_variables()
    let self = this
    // console.log(self.wave_arr)
    self.ctx.beginPath()
    self.ctx.clearRect(0, 0, self.cwidth, self.cheight)
    self.ctx.strokeStyle = "#101080"
    // console.log(ctx);

    self.ctx.moveTo(0, self.calc_h(0))
    for (i = 0; i < self.wave_arr_length; i++) {
      self.ctx.lineTo(self.calc_w(i), self.calc_h(i))
    }
    self.ctx.stroke()

    self.draw_index()
    self.draw_grid()
  },
  send_waveform: function () {
    const selected_index = $(`input[name=p1]`).val()
    let s = `w${selected_index},`
    this.wave_arr.forEach(function (value, index) {
      if (index > 0) s += ","
      s += value
    })
    force_use_busy = true
    send_cmd(s, true)
  },
  export_waveform: function () {
    const selected_index = $(`input[name=p1]`).val()
    let s = `w${selected_index},`
    this.wave_arr.forEach(function (value, index) {
      if (index > 0) s += ","
      s += value
    })
    $("#user_waveform").val(s)
  },
  on_mousemove: function (selected_index, selected_value) {
    // console.log(`Index: ${selected_index} Value: ${selected_value}`)
    $(`input[name=p1]`).val(selected_index).parent().find("div.param_body").html(selected_index)
    $(`input[name=p2]`).parent().find("div.param_body").html(selected_value)
    this.wave_arr[selected_index] = selected_value
    this.draw_waveform()
  },
  draw_mode_on: function () {
    this.draw_mode = this.DRAW_MODE_ON
  },
  draw_mode_off: function () {
    this.draw_mode = this.DRAW_MODE_OFF
  },
  in_draw_mode: function () {
    return this.op_mode === this.OP_MODE_DRAW
  },
  is_drawing: function () {
    return this.draw_mode === this.DRAW_MODE_ON && this.in_draw_mode()
  },
  tog_op_mode: function () {
    this.op_mode = this.in_draw_mode() ? this.OP_MODE_NORMAL : this.OP_MODE_DRAW
    const in_drawmode = this.in_draw_mode()
    $(
      "#fxn_buttons .cmd_button, #param_box, #param_box select, #param_box button, #param_box input"
    ).prop("disabled", in_drawmode)

    $("#param_value input").css("display", in_drawmode ? "none" : "inline-block")
    $("#activate_button").fadeTo(500, in_drawmode ? 0 : 100)
    $("#cancel_draw_controls").toggle()
    $("#cancel_draw_button").fadeTo(500, in_drawmode ? 100 : 0)
    $("#draw_button").html(in_drawmode ? "Save Drawing" : "Draw Waveform")
    canvas_obj.message(in_drawmode ? "Draw slowly in any direction" : "")

    if (this.in_draw_mode()) {
      $("#canvas").css("cursor", "pointer")
      $("#param_box_disabler").css("z-index", "10")
    } else {
      $("#param_box_disabler").css("z-index", "-10")
    }
  },
  on_load: function () {
    let self = this
    document.body.onmouseup = function () {
      self.draw_mode_off()
    }

    $("#canvas").on("mousedown", function (e) {
      self.draw_mode_on()
    })

    $("#canvas").on("mouseup", function (e) {
      self.draw_mode_off()
    })

    $("#cancel_draw_button").on("click", function () {
      self.tog_op_mode()
      refresh_screen()
    })

    $("#draw_button").on("click", function () {
      self.tog_op_mode()
      if (!self.in_draw_mode()) self.send_waveform()
    })

    $("#export_waveform").on("click", function () {
      self.export_waveform()
      // refresh_screen()
    })
  },
}
// end of draw waveform
