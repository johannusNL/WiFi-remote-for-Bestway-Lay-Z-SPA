

function topNav() {
    const x = document.getElementById("topnav")
    if (x.className === "topnav") {
        x.className += " responsive"
    } else {
        x.className = "topnav"
    }
}

function togglePlainText(id) {
    const x = document.getElementById(id)
    if (x.type === "password") {
        x.type = "text"
    } else {
        x.type = "password"
    }
}

function validatePassword(id) {
    const x = document.getElementById(id)
    if (x.value == "<enter password>") {
        alert("Please enter a password to continue.")
        return false
    }
    return true
}

// Function to update the displayed number
function updateNumber(opt, parent) {
    const parentElement = parent.parentElement
    const numDisplay = parentElement.querySelector(".numDisplay")
    let number = parseInt(numDisplay.textContent)
    if (opt == "up") number += 1
    if (opt == "dn") number -= 1
    numDisplay.textContent = number
}

function increaseNumber(id) {
    const x = document.getElementById(id)
    let val = Number(x.value)
    const max = x.max
    if (max > val) {
        val += 1
        x.value = val
    }
    const opt = "up"
    updateNumber(opt, x)
}

function decreaseNumber(id) {
    const x = document.getElementById(id)
    let val = Number(x.value)
    const min = x.min
    if (min < val) {
        val -= 1
        x.value = val
    }
    const opt = "dn"
    updateNumber(opt, x)
}

function buttonConfirm(elem, text = "", timeout = 3, reset = true) {
    const originalText = elem.innerHTML

    elem.innerHTML = text == "" ? "&check;" : text
    elem.disabled = true

    if (reset) {
        setTimeout(function () {
            elem.innerHTML = originalText
            elem.disabled = false
        }, timeout * 1000)
    }
}

function updateWifiSignalDisplay(rssi) {
    const meter = document.getElementById('wifiSignalMeter')
    if (!meter) return

    if (typeof rssi !== 'number' || Number.isNaN(rssi) || rssi >= 0) {
        meter.setAttribute('data-level', '0')
        meter.setAttribute('title', 'WiFi: no signal')
        return
    }

    // iPhone-like 3 segment scale
    let level = 1
    if (rssi > -60) level = 3
    else if (rssi > -75) level = 2

    meter.setAttribute('data-level', String(level))
    meter.setAttribute('title', 'WiFi: ' + rssi + ' dBm')
}

function startGlobalWifiSignalMonitor() {
    if (window.globalWifiSignalMonitor) return

    const meter = document.getElementById('wifiSignalMeter')
    if (!meter) return

    const socket = new WebSocket('ws://' + location.hostname + ':81/', ['arduino'])
    window.globalWifiSignalMonitor = socket

    socket.onmessage = function (event) {
        try {
            const msg = JSON.parse(event.data)
            if (msg && msg.CONTENT === 'OTHER' && typeof msg.RSSI === 'number') {
                updateWifiSignalDisplay(msg.RSSI)
            }
        } catch (e) { }
    }

    socket.onerror = function () {
        updateWifiSignalDisplay(NaN)
    }

    socket.onclose = function () {
        updateWifiSignalDisplay(NaN)
        setTimeout(function () {
            if (window.globalWifiSignalMonitor === socket) {
                startGlobalWifiSignalMonitor()
            }
        }, 5000)
    }
}

window.addEventListener('load', startGlobalWifiSignalMonitor)

