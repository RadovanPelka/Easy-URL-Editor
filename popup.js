var originalUrl
var paramsSection
var tabUrl
var btnOpenUrl

document.addEventListener("DOMContentLoaded", function() {
  chrome.tabs.getSelected(null, function(tab) {
    originalUrl = document.getElementById("originalUrl")
    paramsSection = document.getElementById("paramsSection")

    btnOpenUrl = document.getElementById("btnOpenUrl")
    var btnNewParam = document.getElementById("btnNewParam")

    originalUrl.addEventListener("keyup", function(e) {
      if (e.keyCode === 13) btnOpenUrl.click()
    })
    btnOpenUrl.addEventListener("click", function() {
      naviagateTo(originalUrl.value)
    })
    btnNewParam.addEventListener("click", function() {
      addNewParam()
    })

    tabUrl = tab.url
    originalUrl.value = tab.url
    var params = tab.url.split("?")
    if (params.length === 1) return

    params[1].split("&").forEach(value => {
      addNewParam(value)
    })
  })
})

function addNewParam(value = "=") {
  paramsSection.style.display = "block"
  var clone = document.getElementById("clone")
  var _val = value.split("=")
  var _new = clone.cloneNode(true)

  _new.removeAttribute("id")
  _new.setAttribute("param", true)
  _new.style.display = "block"

  var _key = _new.querySelector("[class='inputParamKey']")
  var _value = _new.querySelector("[class='inputParamValue']")
  var _delete = _new.querySelector("[class='deleteParam']")

  _key.value = _val[0]
  _value.value = _val.length === 1 ? "" : decodeURIComponent(_val[1])

  inputChanged = e => {
    var nodes = document.querySelectorAll("[param='true']")
    var newUrl = tabUrl.split("?")[0] + (nodes.length === 0 ? "" : "?")
    var array = []
    nodes.forEach(node => {
      var inputParamKey = node.querySelector("[class='inputParamKey']")
      var inputParamValue = node.querySelector("[class='inputParamValue']")
      if (inputParamKey.value === "") return
      if (inputParamValue.value === "") return array.push(inputParamKey.value)
      array.push(
        inputParamKey.value + "=" + encodeURIComponent(inputParamValue.value)
      )
    })
    newUrl += array.join("&")
    originalUrl.value = newUrl
    if (e.keyCode === 13) btnOpenUrl.click()
  }

  _delete.addEventListener("click", function() {
    _new.remove()
    var nodes = document.querySelectorAll("[param='true']")
    if(nodes.length === 0)
    paramsSection.style.display = "none"
    inputChanged()
  })

  _key.addEventListener("keyup", inputChanged)
  _value.addEventListener("keyup", inputChanged)

  paramsSection.appendChild(_new)
}

function naviagateTo(url) {
  chrome.tabs.update({ url })
  window.close()
}
