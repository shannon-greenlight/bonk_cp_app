// draw waveform stuff
const meas_div = $("#meas_div")
const the_canvas = $("#canvas")

let waveform_obj = {
  OP_MODE_NORMAL: 0,
  OP_MODE_DRAW: 1,
  op_mode: this.OP_MODE_NORMAL, // normal, draw

  DRAW_MODE_OFF: 0,
  DRAW_MODE_ON: 1,
  draw_mode: this.DRAW_MODE_OFF,

  c: 0,
  ctx: 0,
  wave_arr: [],
  wave_arr_length: 0,
  cwidth: 0,
  cheight: 0,
  calc_w: function (i) {
    return parseInt((i / this.wave_arr_length) * this.cwidth, 10)
  },
  calc_h: function (i) {
    return (
      this.cheight -
      parseInt((this.wave_arr[i] / data_handler.data.dac_fs) * (this.cheight - 2), 10) -
      2
    )
  },
  set_variables: function () {
    this.c = document.getElementById("canvas")
    this.ctx = this.c.getContext("2d")
    this.wave_arr_length = this.wave_arr.length
    this.cwidth = the_canvas.width()
    this.cheight = the_canvas.height()
  },
  // draw index indicator if in User Waveforms
  draw_index: function () {
    this.set_variables()
    const wave_index = parseInt($(`input[name=p1]`).val())
    // console.log(`Wave index: ${wave_index}`)
    if (data_handler.data.fxn.indexOf("User") === 0) {
      // this.ctx = this.c.getContext("2d")
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
    self.ctx.strokeStyle = "#000000"
    // console.log(ctx);
    self.ctx.moveTo(0, self.calc_h(0))
    for (i = 0; i < self.wave_arr_length; i++) {
      self.ctx.lineTo(self.calc_w(i), self.calc_h(i))
    }
    self.ctx.stroke()
    self.draw_index()
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
    $("#message_div").html(in_drawmode ? "Draw slowly in any direction" : "")
    if (this.in_draw_mode()) {
      $("#canvas").css("cursor", "pointer")
    }
  },
  init: function () {
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
  },
}
// end of draw waveform
