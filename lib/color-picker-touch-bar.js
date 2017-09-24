'use babel'

import TouchBarController from './touch-bar-controller'

import { TouchBar } from 'remote'
const { TouchBarColorPicker, TouchBarLabel, TouchBarButton } = TouchBar

import { clipboard } from 'electron'

class ColorPickerTouchBar extends TouchBarController {

  constructor() {
    super()
    this.closeButton = new TouchBarButton({
      label: "Close",
      click: () => this.close()
    })
    this.colorPicker = new TouchBarColorPicker({
      change: () => this.updatePreview(),
      selectedColor: '#FF0000'
    })
    this.colorPreview = new TouchBarButton()
    this.instruction = new TouchBarLabel({label: "Tap to copy"})
    this.hexPreview = new TouchBarButton({click: () => this.copyHex()})
    this.rgbPreview = new TouchBarButton({click: () => this.copyRgb()})
    this.hslPreview = new TouchBarButton({click: () => this.copyHsl()})
    this.setTouchBar(new TouchBar({
      items: [
        this.colorPicker,
        this.colorPreview,
        this.instruction,
        this.hexPreview,
        this.rgbPreview,
        this.hslPreview
      ],
      escapeItem: this.closeButton
    }))
    this.updatePreview()
  }

  copyHex() {
    clipboard.writeText(this.generateHexCode())
    this.close()
  }

  copyRgb() {
    clipboard.writeText(this.generateRgbCode())
    this.close()
  }

  copyHsl() {
    clipboard.writeText(this.generateHslCode())
    this.close()
  }

  updatePreview() {
    this.colorPreview.backgroundColor = this.colorPicker.selectedColor
    this.hexPreview.label = this.generateHexCode()
    this.rgbPreview.label = this.generateRgbCode()
    this.hslPreview.label = this.generateHslCode()
  }

  generateHexCode() {
    return this.colorPicker.selectedColor
  }

  generateRgbCode() {
    let color = this.hexToRgb(this.colorPicker.selectedColor)
    return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')'
  }

  generateHslCode() {
    let color = this.rgbToHsl(this.hexToRgb(this.colorPicker.selectedColor))
    return 'hsl(' + color.h + '%, ' + color.s + '%, ' + color.l + '%)'
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHsl({r, g, b}) {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 100),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }
}

export default ColorPickerTouchBar
