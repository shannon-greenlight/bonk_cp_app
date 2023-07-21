// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort, ReadlineParser } = require('serialport')
const tableify = require('tableify')
window.$ = window.jQuery = require('jquery');

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if(err) {
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }
    console.log('ports', ports);

    if (ports.length === 0) {
      document.getElementById('error').textContent = 'No ports discovered'
    }

    tableHTML = tableify(ports)
    document.getElementById('ports').innerHTML = tableHTML
  })
}

function listPorts() {
  listSerialPorts();
  setTimeout(listPorts, 2000);
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
// setTimeout(listPorts, 2000);

// listSerialPorts()

const port = new SerialPort({ path: 'COM15', baudRate: 57600 })
const parser = port.pipe(new ReadlineParser())
// parser.on('data', console.log)
parser.on('data', function(data)
{
  if(data>'') document.getElementById('message').innerHTML = data
})

// port.on('readable', function () {
//   console.log('Data:', port.read())
// })

port.write('Z', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
  // document.getElementById('message').innerHTML = port.read()
  console.log('message written')
  // console.log('Data:', port.read())
})

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
})
