let bonk_obj = {
  in_user_waveforms: function () {
    // console.log(data_handler.data)
    return data_handler.data.fxn_num == 8 && data_handler.data.fxn.indexOf("User") == 0
  },
  in_bounce: function () {
    // console.log(data_handler.data)
    return data_handler.data.fxn_num == 8 && data_handler.data.fxn.indexOf("Bounce") == 0
  },
}
