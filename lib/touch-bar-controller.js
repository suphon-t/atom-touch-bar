'use babel'

class TouchBarController {

  constructor() {
    this.touchBar = null
  }
  
  init() {}

  onAttach(main) {
    this.main = main
  }

  onDetach() {
    this.main = null
  }

  close() {
    if (this.main != null) {
      this.main.close()
    }
  }

  setTouchBar(touchBar) {
    this.touchBar = touchBar
    if (this.main != null) {
      this.main.updateTouchBar()
    }
  }

  getTouchBar() {
    return this.touchBar
  }
}

export default TouchBarController
