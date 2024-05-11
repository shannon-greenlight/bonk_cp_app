const outputs_obj = {
  build_outputs: function () {
    if (common_obj.in_bounce()) {
      $(".outputs .output").hide()
      $(".outputs .bounce").show()
    } else {
      $(".outputs .output").show()
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
