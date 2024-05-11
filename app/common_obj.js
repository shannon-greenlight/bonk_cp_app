// these routines are shared among projects (Bonkulator and Spankulator)
let common_obj = {
  in_user_waveforms: function () {
    // console.log(data_handler.data)
    return data_handler.data.fxn_num == 8 && data_handler.data.fxn.indexOf("User") == 0
  },
  in_bounce: function () {
    // console.log(data_handler.data)
    return data_handler.data.fxn_num == 8 && data_handler.data.fxn.indexOf("Bounce") == 0
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
