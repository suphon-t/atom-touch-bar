'use babel'

import TouchBarController from './touch-bar-controller'
import StatusBarTouchBarItem from './status-bar-touch-bar-item'

import { TouchBar } from 'remote'
const { TouchBarSpacer } = TouchBar

class StatusBarTouchBar extends TouchBarController {

  constructor() {
    super()
    this.touchBar = null
    this.statusBarLoaded = false
    this.statusBarLeftView = null
    this.statusBarRightView = null
    this.thisupdatePending = false
    this.rebuildPending = false
    this.allowRebuild = false
    this.leftItems = []
    this.rightItems = []
    this.initObserveDOM()
  }

  init() {
    this.statusBarLoaded = true
    this.statusBarLeftView = document.getElementsByClassName('status-bar-left')[0]
    this.statusBarRightView = document.getElementsByClassName('status-bar-right')[0]
    let statusBar = document.getElementsByClassName('status-bar')[0];
    if (statusBar.classList == null) {
      statusBar.className = 'hidden'
    } else {
      statusBar.classList.add('hidden')
    }
    this.observeDOM(statusBar, () => {
      if (!this.updatePending) {
        this.updatePending = true
        setTimeout(() => this.updateTouchBar())
      }
    })
  }

  updateTouchBar() {
    let newLeftItems = Array.from(this.statusBarLeftView.children)
      .map(item => this.extractItem(item))
      .filter(item => item)
    let newRightItems = Array.from(this.statusBarRightView.children)
      .map(item => this.extractItem(item))
      .filter(item => item)

    if (!this.compareTouchBar(newLeftItems, newRightItems)) {
      if (this.allowRebuild) {
        this.rebuildTouchBar(newLeftItems, newRightItems)
        this.allowRebuild = false
      } else if (!this.rebuildPending) {
        this.rebuildPending = true
        setTimeout(() => {
          this.allowRebuild = true
          this.updateTouchBar()
          this.rebuildPending = false
        }, 10)
      }
    } else {
      this.updateTbItems(this.leftItems)
      this.updateTbItems(this.rightItems)
    }

    this.updatePending = false
  }

  compareTouchBar(newLeftItems, newRightItems) {
    return this.compareArray(newLeftItems, this.leftItems)
      && this.compareArray(newRightItems, this.rightItems)
  }

  compareArray(array1, array2) {
    if (array1.length != array2.length) return
    for (let i = 0; i < array1.length; i++) {
      if (array1[i].domItem != array2[i].domItem) return false
    }
    return true
  }

  rebuildTouchBar(newLeftItems, newRightItems) {
    this.leftItems = newLeftItems
    this.rightItems = newRightItems
    this.setTouchBar(new TouchBar([
      ...this.extractTbItems(this.leftItems),
      new TouchBarSpacer({size: 'flexible'}),
      ...this.extractTbItems(this.rightItems)
    ]))
  }

  extractTbItems(items) {
    return items.map(item => item.tbItem)
  }

  updateTbItems(items) {
    return items.map(item => item.update())
  }

  extractItem(item) {
    if (item.style != null && item.style.display == 'none') return null
    if (item.children != null && item.children.length == 1
       && item.children[0].tagName == 'SPAN') return null
    if (item.children != null && item.children.length == 1) {
      let target = item.children[0]
      if (target.tagName == 'A' && target.innerText) {
        return new StatusBarTouchBarItem({
          target: target,
          clickable: true
        })
      }
    }
    if (item.innerText) {
      return new StatusBarTouchBarItem({
        target: item,
        clickable: false
      })
    }
  }

  initObserveDOM() {
    this.observeDOM = (function() {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
          eventListenerSupported = window.addEventListener;

      return function(obj, callback){
          if( MutationObserver ){
              // define a new observer
              var obs = new MutationObserver(function(mutations, observer){
                  if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                      callback();
              });
              // have the observer observe foo for changes in children
              obs.observe( obj, { childList:true, subtree:true });
          }
          else if( eventListenerSupported ){
              obj.addEventListener('DOMNodeInserted', callback, false);
              obj.addEventListener('DOMNodeRemoved', callback, false);
          }
      };
    })()
  }
}

export default StatusBarTouchBar
