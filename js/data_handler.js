const zeroPad = (num, places) => String(num).padStart(places, "0")

let data_handler = {
  globals: null,
  data: null,
  status: null,
  operation: "",
  item: null,
  receive_data: function (text) {
    // console.log("Incoming text:", text)
    // const incoming_data = JSON.parse(text)
    // console.log("Incoming data:", incoming_data)
    let incoming_data

    text = text.replace(/\n\r/g, ".....")

    try {
      incoming_data = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      console.error("Incoming text:", text)
    }

    if (incoming_data.event) {
      this.status = incoming_data
      this.operation = "status"
    } else if (incoming_data.msg) {
      this.data.system_message = incoming_data.msg
      this.operation = "message"
    } else if (incoming_data.product_name) {
      this.globals = incoming_data
      this.operation = "globals"
    } else if (incoming_data.reply) {
      this.operation = "reply"
      this.data.cmd = this.reply = incoming_data.reply
      // console.log("Incoming text:", text)
    } else if (incoming_data.item) {
      this.operation = "item"
      this.item = incoming_data.item
      // this.data.cmd = this.reply = incoming_data.reply
      // console.log("Incoming item:", incoming_data.item)
    } else if (incoming_data.fxn) {
      // Assuming this.data and incoming_data are objects
      this.data = { ...this.data, ...incoming_data }
      // this.data = incoming_data
      this.operation = "data"
    } else {
      this.operation = "unknown"
      console.log("Unknown data type received")
    }
  },
  find_param: function (item) {
    function capitalizeFirstLetter(string) {
      return string[0].toUpperCase() + string.slice(1)
    }

    function find_param(param) {
      dbugger.print(capitalizeFirstLetter(item) + ": " + param.label, false)
      return param.label === capitalizeFirstLetter(item) + ": "
    }
    // find item in params
    return this.data.params[0].find(find_param)
  },
  find_selected_param: function () {
    if (this.data.params[0]) {
      return this.data.params[0].find(function is_selected(param) {
        return param.selected === "true"
      })
    } else {
      return null
    }
  },
  get_device_name: function () {
    return this.data.device_name
  },
  get_wave_data: function () {
    if (this.data.waveform_values > "") {
      let wave_data
      try {
        wave_data = this.data.waveform_values.split(", ")
      } catch (e) {
        console.log(e)
      }
      return wave_data
    } else {
      return []
    }
  },
  get_user_wave_num: function () {
    return this.data.fxn.charAt(5)
  },
  has_waveform: function () {
    return this.data.waveform_values
  },
  param_is_active: function () {
    return this.data.param_active == "1"
  },
  find_selected_data: function () {
    return this.find_selected_param()
  },

  in_output_fxn: function () {
    // return this.data.fxn_num < 8
    return this.data.fxn.indexOf("Output") === 0
  },
  in_user_waveforms: function () {
    return this.data.fxn_num == 8 && this.data.fxn.indexOf("User") == 0
    // return this.data.fxn.indexOf("User") === 0
  },
  in_bounce: function () {
    // console.log(this.data)
    return this.data.fxn_num == 8 && this.data.fxn.indexOf("Bounce") == 0
  },

  // stubs from spankulator
  in_settings_fxn: function () {
    return false
  },
  in_wifi_fxn: function () {
    return false
  },
  in_bounce_fxn: function () {
    return false
  },
  in_lfo_fxn: function () {
    return false
  },
  in_user_fxn: function () {
    return false
  },
}
