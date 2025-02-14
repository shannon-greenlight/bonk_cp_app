const outputs_obj = {
  render: function () {
    if (data_handler.in_bounce()) {
      $(".outputs .output").hide()
      $(".outputs .bounce").show()
    } else {
      //$(".outputs .output").show()
      for (let i = 0; i < data_handler.globals.num_outputs; i++) {
        $(`div.triggered_outputs div:nth-child(${i + 1})`).show()
        // $(`#t${i}`).prop("disabled", false)
      }
      for (let i = 0; i < 8; i++) {
        $(`div.group_outputs div:nth-child(${i + 1})`).show()
        // $(`#t${i}`).prop("disabled", false)
      }
      $(".outputs .bounce").hide()
    }
  },
  on_load: function () {
    $(".outputs div").on("click", function () {
      const output_num = parseInt($(this).html())
      const trig_num = parseInt($(this).parent().attr("id").replace("outputs", ""))
      dbugger.print(`Trigger: ${trig_num} Output: ${output_num}`, false)
      if (trig_num < 4) {
        outputs_group.toggle_output(output_num, trig_num)
      } else {
        groups_group.toggle_output(output_num, 4)
      }
    })
  },
}
