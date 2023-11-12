const the_queue = {
  queue: [],
  busy: false,
  enqueue: function (item) {
    this.queue.push(item)
  },
  dequeue: function () {
    if (this.busy) {
      console.log("Hey, I'm busy!")
    } else {
      return this.queue.shift()
    }
  },
  data_available: function () {
    return this.queue.length > 0 && !this.busy
  },
  debug: function () {
    console.log(this.queue)
  },
}

async function _send_cmd(cmd) {
  const res = prep_request(cmd)
  if (res.fail) return
  cmd = res.cmd
  the_queue.busy = true

  try {
    request_data(cmd)
  } catch (e) {
    console.log(e)
    data.err = e
  }
}

function send_cmd(cmd, force = false) {
  if (!waveform_obj.is_drawing() || force) {
    if (the_macro.is_recording() && cmd !== "\n") {
      the_macro.append(cmd)
    }
    the_queue.enqueue(cmd)
  }
}

refresh_screen = function () {
  send_cmd("\n")
}

// heartbeat manages the_queue
let param_changing = false
let timeout
setInterval(function () {
  param_changing = false
  if (the_queue.data_available()) {
    clearTimeout(timeout)
    _send_cmd(the_queue.dequeue())
  }
}, 250)

$("#activate_button").on("click", function () {
  send_cmd("!")
})

let params = $("#params")
params.on("change", "input", function () {
  switch ($(this).attr("type")) {
    case "radio":
    case "checkbox":
      dbugger.print("Radio/Checkbox Input changed: " + $(this).val(), false)
      send_cmd($(this).attr("name"))
      let cmd = $(this).val()
      send_cmd(cmd)
      break
    default:
  }
  // let cmd = $(this).val();
  // send_cmd(cmd);
})

params.on("click", ".param_val", function () {
  const selected = $(this).hasClass("selected")
  let my = $(this).find("input")
  let my_name = my.attr("name")
  let my_type = my.attr("type")
  dbugger.print("input clicked: " + my_name + " " + my_type, false)
  if (!selected) {
    send_cmd(my_name)
  } else {
    $("#param_value").css("top", 0)
    if (my_type === "number") {
    }
  }
})

const param_value = $("#params, #adj_div")
param_value.on("change focusin", "#param_input, input", function (e) {
  // console.log(e.currentTarget.name)
  dbugger.print("Changin!", false)
  clearTimeout(timeout)
  param_changing = true
})

param_value
  .on("change", "#param_input", function () {
    dbugger.print("param_value Changin!", false)
    if ($(this).attr("type") === "text" && !$(this).hasClass("sequence")) {
      send_cmd("$" + $(this).val())
    } else {
      send_cmd($(this).val())
    }
    param_changing = false
  })
  .on("keypress", "input.sequence", function (e) {
    // !!! Don't print anything to console in this fxn. Crashes Chrome when entering value
    // const regexp = new RegExp(`[UDTBCS\\r\\n]`);
    const regexp = new RegExp(`[${legal_values}\\r\\n]`)
    var txt = String.fromCharCode(e.which)
    if (!txt.match(regexp)) {
      return false
    }
  })
  .on("keypress", "input.text_input", function (e) {
    // !!! Don't print anything to console in this fxn. Crashes Chrome when entering value
    const regexp = new RegExp(`[^%#]+`)
    var txt = String.fromCharCode(e.which)
    if (!txt.match(regexp)) {
      return false
    }
  })

$("#control_div").on("click", "button[data-ref]", function () {
  let cmd = $(this).attr("data-ref")
  // $(this).prop("disabled", true)
  send_cmd(cmd)
})

$("#refresh_button").on("click", function () {
  // $("#control_div").fadeOut(50);
  refresh_screen()
})

function set_selected_param(selected_data) {
  // dbugger.print("Selected: ", selected_data)
  let selected_param = $("#params .param_div .selected input")
  // console.log("Selected param: ",selected_param);
  // console.log($("div.selected.param"))
  if (
    !(
      selected_data.type === "radio" ||
      (selected_data.type === "select" && selected_data.values.split(",").length === 1)
    )
  ) {
    // console.log("Component: " +the_input.attr("component"));
    // console.log("Component: " +selected_data.type);
    $("#param_head").html(`<strong>Enter ${selected_data.label}</strong>`)
    $("#param_value").html(data_handler.display_input(selected_data))
    let a = $("#param_value").detach()
    console.log(a)
    $("div.selected.param").append(a)
    switch (selected_param.attr("component")) {
      case "select":
        $("#param_value").css("top", 0)
        break
      default:
        dbugger.print(`Component: ${selected_param.attr("component")}`, false)
    }
    // $("#param_input").val(selected_param.find("input").val());
    $("#inc_controls").show()
  } else {
    // $("#input_div").hide();
  }
}

function set_param_nav_buttons() {
  $("#control_div #param_box button[data-ref]").prop("disabled", false)
  const num_params = $("#params .param_div").length
  dbugger.print(`Num params: ${num_params}`, false)
  $("#param_buttons button").prop("disabled", num_params < 2)
  const selected_type = $("#param_input").attr("type")
  $("#lr_buttons button, #inc_controls button").prop(
    "disabled",
    selected_type !== "number" && selected_type !== "text"
  )
  dbugger.print(`Selected type: ${selected_type}`, false)
}
