const busy_obj = {
  busy: false,
  busy_element: "",
  set_busy: function () {
    this.busy = true
    if (this.busy_element) this.busy_element.fadeTo(100, 0.4)
  },
  clear_busy: function () {
    this.busy = false
    if (this.busy_element) this.busy_element.fadeOut(100)
  },
  is_busy: function () {
    return this.busy
  },
  debug: function () {
    console.log(this.busy)
    console.log(this.busy_element)
  },
  on_load: function (busy_element) {
    // this.busy_element = busy_element ? busy_element : $("#busy_div")
    if (!busy_element) {
      console.error("Failed to find busy element.")
      return
    }
    this.busy_element = busy_element
    this.busy_element.css("z-index", "100")
    this.busy_element.find("img").attr("src", "../img/loading.gif")
    this.clear_busy()
  },
}
