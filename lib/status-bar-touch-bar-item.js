'use babel'

import {TouchBar} from 'remote'

const {TouchBarLabel, TouchBarButton} = TouchBar

class StatusBarTouchBarItem {

  constructor(options) {
    if (options == null) throw new Error('options must not be null')
    this.domItem = options.target
    if (options.clickable) {
      this.tbItem = new TouchBarButton({
        label: this.domItem.innerText,
        click: () => this.domItem.click()
      })
    } else {
      this.tbItem = new TouchBarLabel({
        label: this.domItem.innerText
      })
    }
  }

  update() {
    this.tbItem.label = this.domItem.innerText
    return this
  }
}


export default StatusBarTouchBarItem
