'use babel'

import { CompositeDisposable, Disposable } from 'atom'
import TouchBarController from './touch-bar-controller'
import StatusBarTouchBar from './status-bar-touch-bar'
import ColorPickerTouchBar from './color-picker-touch-bar'

const {TouchBar} = require('remote')

export default {

  activated: false,
  subscriptions: null,
  defaultTouchBar: null,
  colorPickerTouchBar: null,

  config: {
    replaceStatusBar: {
      description: 'Requires restart',
      type: 'boolean',
      default: true
    }
  },

  consumeStatusBar(statusBar) {
    if (this.defaultTouchBar != null) {
      this.defaultTouchBar.init()
    }
  },

  activate(state) {
    this.activated = true
    let replaceStatusBar = atom.config.get('atom-touch-bar.replaceStatusBar')
    this.defaultTouchBar = replaceStatusBar ? new StatusBarTouchBar() : new TouchBarController()
    this.colorPickerTouchBar = new ColorPickerTouchBar()
    this.attachController(this.defaultTouchBar)

    this.updateTouchBar()

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-touch-bar:color-picker': () => this.toggleColorPicker()
    }));
    this.subscriptions.add(new Disposable(() => {
      this.getWindow().setTouchBar(null)
    }))
  },

  close() {
    this.attachController(this.defaultTouchBar)
  },

  attachController(controller) {
    if (this.currentController != null)
      this.currentController.onDetach()
    this.currentController = controller
    if (this.currentController != null)
      this.currentController.onAttach(this)
    this.updateTouchBar()
  },

  toggleColorPicker() {
    if (this.currentController == this.colorPickerTouchBar) {
      this.close()
    } else {
      this.attachController(this.colorPickerTouchBar)
    }
  },

  updateTouchBar() {
    this.getWindow().setTouchBar(this.currentController.getTouchBar())
  },

  deactivate() {
    this.subscriptions.dispose()
    this.activated = false
  },

  getWindow() {
    return require('electron').remote.getCurrentWindow()
  },

  observeDOM : (function(){
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
