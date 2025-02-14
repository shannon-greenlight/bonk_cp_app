const skin_button = {
  index: Math.floor(Math.random() * 10),
  tile_index: 0,
  tiles: [
    "burlap_tile.jpg",
    "tile1.jpg",
    "tile2.jpg",
    "tile2a.jpg",
    "tile2b.jpg",
    "tile3.jpg",
    "tile1a.jpg",
    "tile1b.jpg",
    "tile1bw.jpg",
    "water3.jpg",
    "water4.jpg",
    "water5.jpg",
  ],
  fonts: [
    "BlackOpsOne",
    "LeagueSpartanRegular",
    "MedievalSharpRegular",
    "PermanentMarker",
    "SpaceGroteskRegular",
    "UncialAntiquaRegular",
  ],
  skins: [
    {
      name: "Lonely",
      tile: "#aab",
      font: "LeagueSpartanRegular",
      gradient_from: "#a8a5c0",
      gradient_to: "#504e68",
    },
    {
      name: "Sunset",
      tile: "water5.jpg",
      font: "LeagueSpartanRegular",
      gradient_from: "#a0a8c5",
      gradient_to: "#807050",
    },
    {
      name: "Army",
      tile: "tile2a.jpg",
      font: "LeagueSpartanRegular",
      gradient_from: "#98a078",
      gradient_to: "#556b2f",
    },
    {
      name: "City Hall",
      tile: "tile3.jpg",
      font: "SpaceGroteskRegular",
      gradient_from: "#858080",
      gradient_to: "#44445a",
    },
    {
      name: "Newspaper",
      tile: "tile1bw.jpg",
      font: "SpaceGroteskRegular",
      gradient_from: "#888",
      gradient_to: "#555",
    },
    {
      name: "Classic",
      tile: "tile1b.jpg",
      font: "MedievalSharpRegular",
      gradient_from: "#a8a5c0",
      gradient_to: "#504e68",
    },
    {
      name: "Cowboy",
      tile: "tile1b.jpg",
      font: "SpaceGroteskRegular",
      gradient_from: "#c0a8a5",
      gradient_to: "#68504e",
    },
    {
      name: "Neutral",
      tile: "tile3.jpg",
      font: "LeagueSpartanRegular",
      gradient_from: "#aaa",
      gradient_to: "#777",
    },
    {
      name: "Minnesota",
      tile: "water3.jpg",
      font: "SpaceGroteskRegular",
      gradient_from: "#c8a8a5",
      gradient_to: "#504e68",
    },
    {
      name: "Gothic",
      tile: "tile1.jpg",
      font: "MedievalSharpRegular",
      gradient_from: "#a8a5c0",
      gradient_to: "#504e68",
    },
  ],
  set_tile: function () {
    const tile = this.skins[this.index].tile
    const root = document.documentElement
    if (tile.indexOf(".jpg") > 0 || tile.indexOf(".png") > 0) {
      root.style.setProperty("--params_background", `url("../img/${tile}")`) //
    } else {
      root.style.setProperty("--params_background", tile) //
    }
  },
  set_tile_from_tiles: function () {
    const tile = this.tiles[this.tile_index]
    const root = document.documentElement
    if (tile.indexOf(".jpg") > 0 || tile.indexOf(".png") > 0) {
      root.style.setProperty("--params_background", `url("../img/${tile}")`) //
    } else {
      root.style.setProperty("--params_background", tile) //
    }
    $("#skin_name").html(tile.split(".")[0])
  },
  set_font: function () {
    const font = this.skins[this.index].font
    const root = document.documentElement
    root.style.setProperty("--main_label_font", font) //
  },
  set_gradient: function () {
    const from = this.skins[this.index].gradient_from
    const to = this.skins[this.index].gradient_to
    const root = document.documentElement
    root.style.setProperty("--gradient_from", from)
    root.style.setProperty("--gradient_to", to)
  },
  set_skin: function () {
    // console.log(`Index: ${this.index}`)
    this.set_tile()
    this.set_font()
    this.set_gradient()
    // $("#skin_name").html(this.skins[this.index].tile.split(".")[0])
    $("#skin_name").html(this.skins[this.index].name)
  },
  inc: function () {
    this.index++
    this.index = this.index % this.skins.length
  },
  dec: function () {
    this.index--
    if (this.index < 0) this.index = this.skins.length - 1
  },
  next_tile: function () {
    this.tile_index++
    this.tile_index = this.tile_index % this.tiles.length
    this.set_tile_from_tiles()
  },
  render: function () {
    //this.index = Math.floor(Math.random() * this.skins.length)
    this.set_skin()
  },
  on_load: function () {
    const self = this
    $("#skin_name").on("click", function () {
      self.next_tile()
    })
    $("#skin_button_up").on("click", function () {
      self.inc()
      self.set_skin()
    })
    $("#skin_button_dn").on("click", function () {
      self.dec()
      self.set_skin()
    })
  },
}
