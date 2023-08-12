// Serial port info: https://serialport.io/docs/api-serialport

const { SerialPort, ReadlineParser } = require("serialport")
const tableify = require("tableify")
window.$ = window.jQuery = require("jquery")

// const canvas_delay = 1005 // need to wait before drawing
const canvas_delay = 5 // need to wait before drawing

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      document.getElementById("error").textContent = err.message
      return
    } else {
      document.getElementById("error").textContent = ""
    }
    console.log("ports", ports)

    if (ports.length === 0) {
      document.getElementById("error").textContent = "No ports discovered"
    }

    tableHTML = tableify(ports)
    document.getElementById("ports_table").innerHTML = tableHTML
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

function prep_request(cmd) {
  let res = { fail: cmd === "" }
  //   if (cmd === "") res.fail = true
  res.cmd = cmd + "\r"
  if (!res.fail) {
    console.log("Sending: " + cmd)
    $("#busy_div").fadeIn(10)
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
  $("#busy_div").fadeOut(1).css("opacity", 1)
  $("#ports").on("click", "td:first-child", function () {
    chosen_port = $(this).html()
    document.title += ` on ${chosen_port}`
    port = new SerialPort({ path: chosen_port, baudRate: 115200 })
    parser = port.pipe(new ReadlineParser({ delimiter: "\r\n\r\n" }))
    // port.path = chosen_port
    port.on("error", function (err) {
      console.log("Error: ", err.message)
    })
    parser.on("data", function (text) {
      if (text > "") {
        receive_data(text)
        $("#busy_div").fadeOut(10)
      }
    })
    console.log("Timeout: " + listPortsTimeout)
    clearTimeout(listPortsTimeout)
    $("#ports").fadeOut(600, function () {
      $("#control_div").fadeIn(600)
    })
    console.log(chosen_port)

    // request USB Direct mode on Bonkulator
    port.write("U1\r", function (err) {
      if (err) {
        return console.log("Error on write: ", err.message)
      }
      console.log("USB Direct Mode Enabled.", port.read())
      setTimeout(function () {
        port.write("\r")
      }, 1000)
    })
  })
  $("#device_name").css({ "margin-bottom": "15px" })
  $("#busy_div img").attr("src", "img/loading.gif")
  $("#head_div>img").attr("src", "img/xparent_logo_444.png")
})(jQuery)
