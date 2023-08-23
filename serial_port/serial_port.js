// Serial port info: https://serialport.io/docs/api-serialport

const { SerialPort, ReadlineParser } = require("serialport")
const tableify = require("tableify")
window.$ = window.jQuery = require("jquery")

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      document.getElementById("error").textContent = err.message
      return
    } else {
      // do nothing, leave the error for clearing manually
    }
    console.log("ports", ports)

    if (ports.length === 0) {
      document.getElementById("error").textContent = "No ports discovered"
    }

    tableHTML = tableify(ports)
    // tableHTML = tableHTML.replace("USB Serial Device", "Bonkulator")
    tableHTML = tableHTML.replace("path", "Port")
    tableHTML = tableHTML.replace("friendlyName", "Device")
    tableHTML = tableHTML.replace("vendorId", "Vendor ID")
    // console.log(tableHTML)
    document.getElementById("ports_table").innerHTML = tableHTML
    $("#ports_table tr").each(function (indx) {
      if (indx === 0) return
      const label = $(this).find("td:nth-child(6)").html()
      const vendorID = $(this).find("td:nth-child(7)").html()
      // console.log(`Label: ${label} vendorID: ${vendorID}`)
      if (label) {
        if (label.indexOf(device.port_label) === 0 && vendorID === "2341") {
          $(this)
            .addClass("enable_port")
            .find("td:nth-child(6)")
            .html(label.replace(device.port_label, device.type))
        } else {
          $(this).removeClass("enable_port")
        }
      }
    })
  })
}

function listPorts() {
  listSerialPorts()
  listPortsTimeout = setTimeout(listPorts, 2000)
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
let listPortsTimeout = setTimeout(listPorts, 2000)
console.log("Timeout: " + listPortsTimeout)

listSerialPorts()

let chosen_port = "COM1"
let port
let parser

let receive_data = function (text) {
  console.log("Receive Data Unset!")
}

let force_use_busy
function use_busy() {
  return device.type === "Bonkulator" && force_use_busy
}

function prep_request(cmd) {
  let res = { fail: cmd === "" }
  //   if (cmd === "") res.fail = true
  res.cmd = cmd + "\r"
  if (!res.fail) {
    console.log("Sending: " + cmd)
    if (use_busy()) {
      $("#busy_div").fadeIn(10)
      force_use_busy = false
    }
  }
  return res
}

function request_data(cmd) {
  // console.log("Requesting: " + cmd)
  const buff = Buffer.from(cmd)
  port.write(buff, function (err) {
    if (err) {
      return console.log("Error on write: ", err.message)
    }
    console.log(`Command: ${cmd} sent to serial port: ${chosen_port}`)
  })
}

;(function ($) {
  // console.log("Hey there!!!!!");
  document.title = `${device.title}`
  $("#busy_div").fadeOut(1).css("opacity", 1)
  $("#clr_error_button").on("click", () => (document.getElementById("error").innerHTML = "&nbsp;"))
  $("#ports").on("click", "tr.enable_port", function () {
    chosen_port = $(this).find("td:first-child").html()
    port = new SerialPort({ path: chosen_port, baudRate: 115200 }, function (err) {
      if (err) {
        console.log("Port Open Error: ", err.message)
        document.getElementById("error").textContent = err.message
        document.title = `${device.title} - ${err.message}!`
      } else {
        document.title = `${device.title} on ${chosen_port}`
        parser = port.pipe(new ReadlineParser({ delimiter: "\r\n\r\n" }))
        port.on("error", function (err) {
          console.log("Port Error: ", err.message)
        })
        parser.on("data", function (text) {
          if (text > "") {
            receive_data(text)
            if (true || use_busy()) $("#busy_div").fadeOut(10)
          }
        })
        console.log("Timeout: " + listPortsTimeout)
        clearTimeout(listPortsTimeout)
        $("#ports").fadeOut(600, function () {
          $("#control_div").fadeIn(600)
        })
        console.log(chosen_port)

        // request USB Direct mode
        port.write("U1\r", function (err) {
          if (err) {
            return console.log("Error on write: ", err.message)
          }
          console.log("USB Direct Mode Enabled.", port.read())
          setTimeout(function () {
            port.write("\r")
          }, 1000)
        })
      }
    })
  })
  $("#device_name").css({ "margin-bottom": "15px" })
  $("#busy_div img").attr("src", "../img/loading.gif")
  $("#head_div>img").attr("src", "../img/xparent_logo_444.png")
})(jQuery)
