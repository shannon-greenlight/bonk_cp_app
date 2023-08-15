let dbugger = {
  debug_on: false,
  print: function (s, force) {
    if (this.debug_on || force) {
      console.log(s)
    }
  },
}
