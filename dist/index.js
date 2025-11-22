"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/tinycolor2/cjs/tinycolor.js
var require_tinycolor = __commonJS({
  "node_modules/tinycolor2/cjs/tinycolor.js"(exports2, module2) {
    "use strict";
    (function(global, factory) {
      typeof exports2 === "object" && typeof module2 !== "undefined" ? module2.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.tinycolor = factory());
    })(exports2, (function() {
      "use strict";
      function _typeof(obj) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
          return typeof obj2;
        } : function(obj2) {
          return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        }, _typeof(obj);
      }
      var trimLeft = /^\s+/;
      var trimRight = /\s+$/;
      function tinycolor(color, opts) {
        color = color ? color : "";
        opts = opts || {};
        if (color instanceof tinycolor) {
          return color;
        }
        if (!(this instanceof tinycolor)) {
          return new tinycolor(color, opts);
        }
        var rgb = inputToRGB(color);
        this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = Math.round(100 * this._a) / 100, this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;
        if (this._r < 1) this._r = Math.round(this._r);
        if (this._g < 1) this._g = Math.round(this._g);
        if (this._b < 1) this._b = Math.round(this._b);
        this._ok = rgb.ok;
      }
      tinycolor.prototype = {
        isDark: function isDark() {
          return this.getBrightness() < 128;
        },
        isLight: function isLight() {
          return !this.isDark();
        },
        isValid: function isValid() {
          return this._ok;
        },
        getOriginalInput: function getOriginalInput() {
          return this._originalInput;
        },
        getFormat: function getFormat() {
          return this._format;
        },
        getAlpha: function getAlpha() {
          return this._a;
        },
        getBrightness: function getBrightness() {
          var rgb = this.toRgb();
          return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1e3;
        },
        getLuminance: function getLuminance() {
          var rgb = this.toRgb();
          var RsRGB, GsRGB, BsRGB, R, G, B;
          RsRGB = rgb.r / 255;
          GsRGB = rgb.g / 255;
          BsRGB = rgb.b / 255;
          if (RsRGB <= 0.03928) R = RsRGB / 12.92;
          else R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
          if (GsRGB <= 0.03928) G = GsRGB / 12.92;
          else G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
          if (BsRGB <= 0.03928) B = BsRGB / 12.92;
          else B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
          return 0.2126 * R + 0.7152 * G + 0.0722 * B;
        },
        setAlpha: function setAlpha(value) {
          this._a = boundAlpha(value);
          this._roundA = Math.round(100 * this._a) / 100;
          return this;
        },
        toHsv: function toHsv() {
          var hsv = rgbToHsv(this._r, this._g, this._b);
          return {
            h: hsv.h * 360,
            s: hsv.s,
            v: hsv.v,
            a: this._a
          };
        },
        toHsvString: function toHsvString() {
          var hsv = rgbToHsv(this._r, this._g, this._b);
          var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
          return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
        },
        toHsl: function toHsl() {
          var hsl = rgbToHsl(this._r, this._g, this._b);
          return {
            h: hsl.h * 360,
            s: hsl.s,
            l: hsl.l,
            a: this._a
          };
        },
        toHslString: function toHslString() {
          var hsl = rgbToHsl(this._r, this._g, this._b);
          var h = Math.round(hsl.h * 360), s = Math.round(hsl.s * 100), l = Math.round(hsl.l * 100);
          return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
        },
        toHex: function toHex(allow3Char) {
          return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function toHexString(allow3Char) {
          return "#" + this.toHex(allow3Char);
        },
        toHex8: function toHex8(allow4Char) {
          return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
        },
        toHex8String: function toHex8String(allow4Char) {
          return "#" + this.toHex8(allow4Char);
        },
        toRgb: function toRgb() {
          return {
            r: Math.round(this._r),
            g: Math.round(this._g),
            b: Math.round(this._b),
            a: this._a
          };
        },
        toRgbString: function toRgbString() {
          return this._a == 1 ? "rgb(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" : "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function toPercentageRgb() {
          return {
            r: Math.round(bound01(this._r, 255) * 100) + "%",
            g: Math.round(bound01(this._g, 255) * 100) + "%",
            b: Math.round(bound01(this._b, 255) * 100) + "%",
            a: this._a
          };
        },
        toPercentageRgbString: function toPercentageRgbString() {
          return this._a == 1 ? "rgb(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function toName() {
          if (this._a === 0) {
            return "transparent";
          }
          if (this._a < 1) {
            return false;
          }
          return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function toFilter(secondColor) {
          var hex8String = "#" + rgbaToArgbHex(this._r, this._g, this._b, this._a);
          var secondHex8String = hex8String;
          var gradientType = this._gradientType ? "GradientType = 1, " : "";
          if (secondColor) {
            var s = tinycolor(secondColor);
            secondHex8String = "#" + rgbaToArgbHex(s._r, s._g, s._b, s._a);
          }
          return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
        },
        toString: function toString(format2) {
          var formatSet = !!format2;
          format2 = format2 || this._format;
          var formattedString = false;
          var hasAlpha = this._a < 1 && this._a >= 0;
          var needsAlphaFormat = !formatSet && hasAlpha && (format2 === "hex" || format2 === "hex6" || format2 === "hex3" || format2 === "hex4" || format2 === "hex8" || format2 === "name");
          if (needsAlphaFormat) {
            if (format2 === "name" && this._a === 0) {
              return this.toName();
            }
            return this.toRgbString();
          }
          if (format2 === "rgb") {
            formattedString = this.toRgbString();
          }
          if (format2 === "prgb") {
            formattedString = this.toPercentageRgbString();
          }
          if (format2 === "hex" || format2 === "hex6") {
            formattedString = this.toHexString();
          }
          if (format2 === "hex3") {
            formattedString = this.toHexString(true);
          }
          if (format2 === "hex4") {
            formattedString = this.toHex8String(true);
          }
          if (format2 === "hex8") {
            formattedString = this.toHex8String();
          }
          if (format2 === "name") {
            formattedString = this.toName();
          }
          if (format2 === "hsl") {
            formattedString = this.toHslString();
          }
          if (format2 === "hsv") {
            formattedString = this.toHsvString();
          }
          return formattedString || this.toHexString();
        },
        clone: function clone() {
          return tinycolor(this.toString());
        },
        _applyModification: function _applyModification(fn, args) {
          var color = fn.apply(null, [this].concat([].slice.call(args)));
          this._r = color._r;
          this._g = color._g;
          this._b = color._b;
          this.setAlpha(color._a);
          return this;
        },
        lighten: function lighten() {
          return this._applyModification(_lighten, arguments);
        },
        brighten: function brighten() {
          return this._applyModification(_brighten, arguments);
        },
        darken: function darken() {
          return this._applyModification(_darken, arguments);
        },
        desaturate: function desaturate() {
          return this._applyModification(_desaturate, arguments);
        },
        saturate: function saturate() {
          return this._applyModification(_saturate, arguments);
        },
        greyscale: function greyscale() {
          return this._applyModification(_greyscale, arguments);
        },
        spin: function spin() {
          return this._applyModification(_spin, arguments);
        },
        _applyCombination: function _applyCombination(fn, args) {
          return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function analogous() {
          return this._applyCombination(_analogous, arguments);
        },
        complement: function complement() {
          return this._applyCombination(_complement, arguments);
        },
        monochromatic: function monochromatic() {
          return this._applyCombination(_monochromatic, arguments);
        },
        splitcomplement: function splitcomplement() {
          return this._applyCombination(_splitcomplement, arguments);
        },
        // Disabled until https://github.com/bgrins/TinyColor/issues/254
        // polyad: function (number) {
        //   return this._applyCombination(polyad, [number]);
        // },
        triad: function triad() {
          return this._applyCombination(polyad, [3]);
        },
        tetrad: function tetrad() {
          return this._applyCombination(polyad, [4]);
        }
      };
      tinycolor.fromRatio = function(color, opts) {
        if (_typeof(color) == "object") {
          var newColor = {};
          for (var i in color) {
            if (color.hasOwnProperty(i)) {
              if (i === "a") {
                newColor[i] = color[i];
              } else {
                newColor[i] = convertToPercentage(color[i]);
              }
            }
          }
          color = newColor;
        }
        return tinycolor(color, opts);
      };
      function inputToRGB(color) {
        var rgb = {
          r: 0,
          g: 0,
          b: 0
        };
        var a = 1;
        var s = null;
        var v = null;
        var l = null;
        var ok = false;
        var format2 = false;
        if (typeof color == "string") {
          color = stringInputToObject(color);
        }
        if (_typeof(color) == "object") {
          if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format2 = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
          } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = convertToPercentage(color.s);
            v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, s, v);
            ok = true;
            format2 = "hsv";
          } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = convertToPercentage(color.s);
            l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, s, l);
            ok = true;
            format2 = "hsl";
          }
          if (color.hasOwnProperty("a")) {
            a = color.a;
          }
        }
        a = boundAlpha(a);
        return {
          ok,
          format: color.format || format2,
          r: Math.min(255, Math.max(rgb.r, 0)),
          g: Math.min(255, Math.max(rgb.g, 0)),
          b: Math.min(255, Math.max(rgb.b, 0)),
          a
        };
      }
      function rgbToRgb(r, g, b) {
        return {
          r: bound01(r, 255) * 255,
          g: bound01(g, 255) * 255,
          b: bound01(b, 255) * 255
        };
      }
      function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
          h = s = 0;
        } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }
        return {
          h,
          s,
          l
        };
      }
      function hslToRgb(h, s, l) {
        var r, g, b;
        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);
        function hue2rgb(p2, q2, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
          if (t < 1 / 2) return q2;
          if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
          return p2;
        }
        if (s === 0) {
          r = g = b = l;
        } else {
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
          r: r * 255,
          g: g * 255,
          b: b * 255
        };
      }
      function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max == min) {
          h = 0;
        } else {
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }
        return {
          h,
          s,
          v
        };
      }
      function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        var i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [v, q, p, p, t, v][mod], g = [t, v, v, q, p, p][mod], b = [p, p, t, v, v, q][mod];
        return {
          r: r * 255,
          g: g * 255,
          b: b * 255
        };
      }
      function rgbToHex(r, g, b, allow3Char) {
        var hex = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
          return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }
        return hex.join("");
      }
      function rgbaToHex(r, g, b, a, allow4Char) {
        var hex = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16)), pad2(convertDecimalToHex(a))];
        if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
          return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
        }
        return hex.join("");
      }
      function rgbaToArgbHex(r, g, b, a) {
        var hex = [pad2(convertDecimalToHex(a)), pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
        return hex.join("");
      }
      tinycolor.equals = function(color1, color2) {
        if (!color1 || !color2) return false;
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
      };
      tinycolor.random = function() {
        return tinycolor.fromRatio({
          r: Math.random(),
          g: Math.random(),
          b: Math.random()
        });
      };
      function _desaturate(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
      }
      function _saturate(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
      }
      function _greyscale(color) {
        return tinycolor(color).desaturate(100);
      }
      function _lighten(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
      }
      function _brighten(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var rgb = tinycolor(color).toRgb();
        rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
        rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
        rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
        return tinycolor(rgb);
      }
      function _darken(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
      }
      function _spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (hsl.h + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
      }
      function _complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
      }
      function polyad(color, number) {
        if (isNaN(number) || number <= 0) {
          throw new Error("Argument to polyad must be a positive number");
        }
        var hsl = tinycolor(color).toHsl();
        var result = [tinycolor(color)];
        var step = 360 / number;
        for (var i = 1; i < number; i++) {
          result.push(tinycolor({
            h: (hsl.h + i * step) % 360,
            s: hsl.s,
            l: hsl.l
          }));
        }
        return result;
      }
      function _splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({
          h: (h + 72) % 360,
          s: hsl.s,
          l: hsl.l
        }), tinycolor({
          h: (h + 216) % 360,
          s: hsl.s,
          l: hsl.l
        })];
      }
      function _analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;
        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];
        for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results; ) {
          hsl.h = (hsl.h + part) % 360;
          ret.push(tinycolor(hsl));
        }
        return ret;
      }
      function _monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;
        while (results--) {
          ret.push(tinycolor({
            h,
            s,
            v
          }));
          v = (v + modification) % 1;
        }
        return ret;
      }
      tinycolor.mix = function(color1, color2, amount) {
        amount = amount === 0 ? 0 : amount || 50;
        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();
        var p = amount / 100;
        var rgba = {
          r: (rgb2.r - rgb1.r) * p + rgb1.r,
          g: (rgb2.g - rgb1.g) * p + rgb1.g,
          b: (rgb2.b - rgb1.b) * p + rgb1.b,
          a: (rgb2.a - rgb1.a) * p + rgb1.a
        };
        return tinycolor(rgba);
      };
      tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
      };
      tinycolor.isReadable = function(color1, color2, wcag2) {
        var readability = tinycolor.readability(color1, color2);
        var wcag2Parms, out;
        out = false;
        wcag2Parms = validateWCAG2Parms(wcag2);
        switch (wcag2Parms.level + wcag2Parms.size) {
          case "AAsmall":
          case "AAAlarge":
            out = readability >= 4.5;
            break;
          case "AAlarge":
            out = readability >= 3;
            break;
          case "AAAsmall":
            out = readability >= 7;
            break;
        }
        return out;
      };
      tinycolor.mostReadable = function(baseColor, colorList, args) {
        var bestColor = null;
        var bestScore = 0;
        var readability;
        var includeFallbackColors, level, size;
        args = args || {};
        includeFallbackColors = args.includeFallbackColors;
        level = args.level;
        size = args.size;
        for (var i = 0; i < colorList.length; i++) {
          readability = tinycolor.readability(baseColor, colorList[i]);
          if (readability > bestScore) {
            bestScore = readability;
            bestColor = tinycolor(colorList[i]);
          }
        }
        if (tinycolor.isReadable(baseColor, bestColor, {
          level,
          size
        }) || !includeFallbackColors) {
          return bestColor;
        } else {
          args.includeFallbackColors = false;
          return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
        }
      };
      var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
      };
      var hexNames = tinycolor.hexNames = flip(names);
      function flip(o) {
        var flipped = {};
        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
          }
        }
        return flipped;
      }
      function boundAlpha(a) {
        a = parseFloat(a);
        if (isNaN(a) || a < 0 || a > 1) {
          a = 1;
        }
        return a;
      }
      function bound01(n, max) {
        if (isOnePointZero(n)) n = "100%";
        var processPercent = isPercentage(n);
        n = Math.min(max, Math.max(0, parseFloat(n)));
        if (processPercent) {
          n = parseInt(n * max, 10) / 100;
        }
        if (Math.abs(n - max) < 1e-6) {
          return 1;
        }
        return n % max / parseFloat(max);
      }
      function clamp01(val) {
        return Math.min(1, Math.max(0, val));
      }
      function parseIntFromHex(val) {
        return parseInt(val, 16);
      }
      function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
      }
      function isPercentage(n) {
        return typeof n === "string" && n.indexOf("%") != -1;
      }
      function pad2(c) {
        return c.length == 1 ? "0" + c : "" + c;
      }
      function convertToPercentage(n) {
        if (n <= 1) {
          n = n * 100 + "%";
        }
        return n;
      }
      function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
      }
      function convertHexToDecimal(h) {
        return parseIntFromHex(h) / 255;
      }
      var matchers = (function() {
        var CSS_INTEGER = "[-\\+]?\\d+%?";
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        return {
          CSS_UNIT: new RegExp(CSS_UNIT),
          rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
          rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
          hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
          hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
          hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
          hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
          hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
          hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
          hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
          hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
      })();
      function isValidCSSUnit(color) {
        return !!matchers.CSS_UNIT.exec(color);
      }
      function stringInputToObject(color) {
        color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
        var named = false;
        if (names[color]) {
          color = names[color];
          named = true;
        } else if (color == "transparent") {
          return {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
            format: "name"
          };
        }
        var match;
        if (match = matchers.rgb.exec(color)) {
          return {
            r: match[1],
            g: match[2],
            b: match[3]
          };
        }
        if (match = matchers.rgba.exec(color)) {
          return {
            r: match[1],
            g: match[2],
            b: match[3],
            a: match[4]
          };
        }
        if (match = matchers.hsl.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            l: match[3]
          };
        }
        if (match = matchers.hsla.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            l: match[3],
            a: match[4]
          };
        }
        if (match = matchers.hsv.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            v: match[3]
          };
        }
        if (match = matchers.hsva.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            v: match[3],
            a: match[4]
          };
        }
        if (match = matchers.hex8.exec(color)) {
          return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            a: convertHexToDecimal(match[4]),
            format: named ? "name" : "hex8"
          };
        }
        if (match = matchers.hex6.exec(color)) {
          return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
          };
        }
        if (match = matchers.hex4.exec(color)) {
          return {
            r: parseIntFromHex(match[1] + "" + match[1]),
            g: parseIntFromHex(match[2] + "" + match[2]),
            b: parseIntFromHex(match[3] + "" + match[3]),
            a: convertHexToDecimal(match[4] + "" + match[4]),
            format: named ? "name" : "hex8"
          };
        }
        if (match = matchers.hex3.exec(color)) {
          return {
            r: parseIntFromHex(match[1] + "" + match[1]),
            g: parseIntFromHex(match[2] + "" + match[2]),
            b: parseIntFromHex(match[3] + "" + match[3]),
            format: named ? "name" : "hex"
          };
        }
        return false;
      }
      function validateWCAG2Parms(parms) {
        var level, size;
        parms = parms || {
          level: "AA",
          size: "small"
        };
        level = (parms.level || "AA").toUpperCase();
        size = (parms.size || "small").toLowerCase();
        if (level !== "AA" && level !== "AAA") {
          level = "AA";
        }
        if (size !== "small" && size !== "large") {
          size = "small";
        }
        return {
          level,
          size
        };
      }
      return tinycolor;
    }));
  }
});

// node_modules/tinygradient/index.js
var require_tinygradient = __commonJS({
  "node_modules/tinygradient/index.js"(exports2, module2) {
    "use strict";
    var tinycolor = require_tinycolor();
    var RGBA_MAX = { r: 256, g: 256, b: 256, a: 1 };
    var HSVA_MAX = { h: 360, s: 1, v: 1, a: 1 };
    function stepize(start, end, steps) {
      let step = {};
      for (let k in start) {
        if (start.hasOwnProperty(k)) {
          step[k] = steps === 0 ? 0 : (end[k] - start[k]) / steps;
        }
      }
      return step;
    }
    function interpolate(step, start, i, max) {
      let color = {};
      for (let k in start) {
        if (start.hasOwnProperty(k)) {
          color[k] = step[k] * i + start[k];
          color[k] = color[k] < 0 ? color[k] + max[k] : max[k] !== 1 ? color[k] % max[k] : color[k];
        }
      }
      return color;
    }
    function interpolateRgb(stop1, stop2, steps) {
      const start = stop1.color.toRgb();
      const end = stop2.color.toRgb();
      const step = stepize(start, end, steps);
      let gradient2 = [stop1.color];
      for (let i = 1; i < steps; i++) {
        const color = interpolate(step, start, i, RGBA_MAX);
        gradient2.push(tinycolor(color));
      }
      return gradient2;
    }
    function interpolateHsv(stop1, stop2, steps, mode) {
      const start = stop1.color.toHsv();
      const end = stop2.color.toHsv();
      if (start.s === 0 || end.s === 0) {
        return interpolateRgb(stop1, stop2, steps);
      }
      let trigonometric;
      if (typeof mode === "boolean") {
        trigonometric = mode;
      } else {
        const trigShortest = start.h < end.h && end.h - start.h < 180 || start.h > end.h && start.h - end.h > 180;
        trigonometric = mode === "long" && trigShortest || mode === "short" && !trigShortest;
      }
      const step = stepize(start, end, steps);
      let gradient2 = [stop1.color];
      let diff;
      if (start.h <= end.h && !trigonometric || start.h >= end.h && trigonometric) {
        diff = end.h - start.h;
      } else if (trigonometric) {
        diff = 360 - end.h + start.h;
      } else {
        diff = 360 - start.h + end.h;
      }
      step.h = Math.pow(-1, trigonometric ? 1 : 0) * Math.abs(diff) / steps;
      for (let i = 1; i < steps; i++) {
        const color = interpolate(step, start, i, HSVA_MAX);
        gradient2.push(tinycolor(color));
      }
      return gradient2;
    }
    function computeSubsteps(stops, steps) {
      const l = stops.length;
      steps = parseInt(steps, 10);
      if (isNaN(steps) || steps < 2) {
        throw new Error("Invalid number of steps (< 2)");
      }
      if (steps < l) {
        throw new Error("Number of steps cannot be inferior to number of stops");
      }
      let substeps = [];
      for (let i = 1; i < l; i++) {
        const step = (steps - 1) * (stops[i].pos - stops[i - 1].pos);
        substeps.push(Math.max(1, Math.round(step)));
      }
      let totalSubsteps = 1;
      for (let n = l - 1; n--; ) totalSubsteps += substeps[n];
      while (totalSubsteps !== steps) {
        if (totalSubsteps < steps) {
          const min = Math.min.apply(null, substeps);
          substeps[substeps.indexOf(min)]++;
          totalSubsteps++;
        } else {
          const max = Math.max.apply(null, substeps);
          substeps[substeps.indexOf(max)]--;
          totalSubsteps--;
        }
      }
      return substeps;
    }
    function computeAt(stops, pos, method, max) {
      if (pos < 0 || pos > 1) {
        throw new Error("Position must be between 0 and 1");
      }
      let start, end;
      for (let i = 0, l = stops.length; i < l - 1; i++) {
        if (pos >= stops[i].pos && pos < stops[i + 1].pos) {
          start = stops[i];
          end = stops[i + 1];
          break;
        }
      }
      if (!start) {
        start = end = stops[stops.length - 1];
      }
      const step = stepize(start.color[method](), end.color[method](), (end.pos - start.pos) * 100);
      const color = interpolate(step, start.color[method](), (pos - start.pos) * 100, max);
      return tinycolor(color);
    }
    var TinyGradient = class _TinyGradient {
      /**
       * @param {StopInput[]|ColorInput[]} stops
       * @returns {TinyGradient}
       */
      constructor(stops) {
        if (stops.length < 2) {
          throw new Error("Invalid number of stops (< 2)");
        }
        const havingPositions = stops[0].pos !== void 0;
        let l = stops.length;
        let p = -1;
        let lastColorLess = false;
        this.stops = stops.map((stop, i) => {
          const hasPosition = stop.pos !== void 0;
          if (havingPositions ^ hasPosition) {
            throw new Error("Cannot mix positionned and not posionned color stops");
          }
          if (hasPosition) {
            const hasColor = stop.color !== void 0;
            if (!hasColor && (lastColorLess || i === 0 || i === l - 1)) {
              throw new Error("Cannot define two consecutive position-only stops");
            }
            lastColorLess = !hasColor;
            stop = {
              color: hasColor ? tinycolor(stop.color) : null,
              colorLess: !hasColor,
              pos: stop.pos
            };
            if (stop.pos < 0 || stop.pos > 1) {
              throw new Error("Color stops positions must be between 0 and 1");
            } else if (stop.pos < p) {
              throw new Error("Color stops positions are not ordered");
            }
            p = stop.pos;
          } else {
            stop = {
              color: tinycolor(stop.color !== void 0 ? stop.color : stop),
              pos: i / (l - 1)
            };
          }
          return stop;
        });
        if (this.stops[0].pos !== 0) {
          this.stops.unshift({
            color: this.stops[0].color,
            pos: 0
          });
          l++;
        }
        if (this.stops[l - 1].pos !== 1) {
          this.stops.push({
            color: this.stops[l - 1].color,
            pos: 1
          });
        }
      }
      /**
       * Return new instance with reversed stops
       * @return {TinyGradient}
       */
      reverse() {
        let stops = [];
        this.stops.forEach(function(stop) {
          stops.push({
            color: stop.color,
            pos: 1 - stop.pos
          });
        });
        return new _TinyGradient(stops.reverse());
      }
      /**
       * Return new instance with looped stops
       * @return {TinyGradient}
       */
      loop() {
        let stops1 = [];
        let stops2 = [];
        this.stops.forEach((stop) => {
          stops1.push({
            color: stop.color,
            pos: stop.pos / 2
          });
        });
        this.stops.slice(0, -1).forEach((stop) => {
          stops2.push({
            color: stop.color,
            pos: 1 - stop.pos / 2
          });
        });
        return new _TinyGradient(stops1.concat(stops2.reverse()));
      }
      /**
       * Generate gradient with RGBa interpolation
       * @param {number} steps
       * @return {tinycolor[]}
       */
      rgb(steps) {
        const substeps = computeSubsteps(this.stops, steps);
        let gradient2 = [];
        this.stops.forEach((stop, i) => {
          if (stop.colorLess) {
            stop.color = interpolateRgb(this.stops[i - 1], this.stops[i + 1], 2)[1];
          }
        });
        for (let i = 0, l = this.stops.length; i < l - 1; i++) {
          const rgb = interpolateRgb(this.stops[i], this.stops[i + 1], substeps[i]);
          gradient2.splice(gradient2.length, 0, ...rgb);
        }
        gradient2.push(this.stops[this.stops.length - 1].color);
        return gradient2;
      }
      /**
       * Generate gradient with HSVa interpolation
       * @param {number} steps
       * @param {boolean|'long'|'short'} [mode=false]
       *    - false to step in clockwise
       *    - true to step in trigonometric order
       *    - 'short' to use the shortest way
       *    - 'long' to use the longest way
       * @return {tinycolor[]}
       */
      hsv(steps, mode) {
        const substeps = computeSubsteps(this.stops, steps);
        let gradient2 = [];
        this.stops.forEach((stop, i) => {
          if (stop.colorLess) {
            stop.color = interpolateHsv(this.stops[i - 1], this.stops[i + 1], 2, mode)[1];
          }
        });
        for (let i = 0, l = this.stops.length; i < l - 1; i++) {
          const hsv = interpolateHsv(this.stops[i], this.stops[i + 1], substeps[i], mode);
          gradient2.splice(gradient2.length, 0, ...hsv);
        }
        gradient2.push(this.stops[this.stops.length - 1].color);
        return gradient2;
      }
      /**
       * Generate CSS3 command (no prefix) for this gradient
       * @param {String} [mode=linear] - 'linear' or 'radial'
       * @param {String} [direction] - default is 'to right' or 'ellipse at center'
       * @return {String}
       */
      css(mode, direction) {
        mode = mode || "linear";
        direction = direction || (mode === "linear" ? "to right" : "ellipse at center");
        let css = mode + "-gradient(" + direction;
        this.stops.forEach(function(stop) {
          css += ", " + (stop.colorLess ? "" : stop.color.toRgbString() + " ") + stop.pos * 100 + "%";
        });
        css += ")";
        return css;
      }
      /**
       * Returns the color at specific position with RGBa interpolation
       * @param {number} pos, between 0 and 1
       * @return {tinycolor}
       */
      rgbAt(pos) {
        return computeAt(this.stops, pos, "toRgb", RGBA_MAX);
      }
      /**
       * Returns the color at specific position with HSVa interpolation
       * @param {number} pos, between 0 and 1
       * @return {tinycolor}
       */
      hsvAt(pos) {
        return computeAt(this.stops, pos, "toHsv", HSVA_MAX);
      }
    };
    module2.exports = function(stops) {
      if (arguments.length === 1) {
        if (!Array.isArray(arguments[0])) {
          throw new Error('"stops" is not an array');
        }
        stops = arguments[0];
      } else {
        stops = Array.prototype.slice.call(arguments);
      }
      return new TinyGradient(stops);
    };
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ClientHandler: () => ClientHandler,
  Clientlogger: () => Clientlogger,
  CommandBuilder: () => CommandBuilder,
  ComponentHelpers: () => ComponentHelpers,
  ComponentManager: () => ComponentManager,
  CooldownManager: () => CooldownManager,
  EnhancedEmbedBuilder: () => EnhancedEmbedBuilder,
  HotReloadManager: () => HotReloadManager,
  InputSanitizer: () => InputSanitizer,
  Logger: () => Logger,
  PerformanceManager: () => PerformanceManager,
  PermissionManager: () => PermissionManager,
  RateLimiter: () => RateLimiter
});
module.exports = __toCommonJS(index_exports);

// src/utils/getPaths.ts
var import_promises = __toESM(require("fs/promises"));
var import_path = __toESM(require("path"));
async function getFilePaths(directory, nesting) {
  let filePaths = [];
  if (!directory) return filePaths;
  try {
    const items = await import_promises.default.readdir(directory, { withFileTypes: true });
    for (const item of items) {
      const itemPath = import_path.default.join(directory, item.name);
      if (item.isFile()) {
        filePaths.push(itemPath);
      }
      if (nesting && item.isDirectory()) {
        const nestedFiles = await getFilePaths(itemPath, true);
        filePaths = [...filePaths, ...nestedFiles];
      }
    }
  } catch (error) {
    console.error(`[XtonCoreUtils] Error reading directory ${directory}:`, error);
  }
  return filePaths;
}
async function getFolderPaths(directory, nesting) {
  let folderPaths = [];
  if (!directory) return folderPaths;
  try {
    const items = await import_promises.default.readdir(directory, { withFileTypes: true });
    for (const item of items) {
      const itemPath = import_path.default.join(directory, item.name);
      if (item.isDirectory()) {
        folderPaths.push(itemPath);
        if (nesting) {
          const nestedFolders = await getFolderPaths(itemPath, true);
          folderPaths = [...folderPaths, ...nestedFolders];
        }
      }
    }
  } catch (error) {
    console.error(`[XtonCoreUtils] Error reading directory ${directory}:`, error);
  }
  return folderPaths;
}

// src/utils/buildCommandTree.ts
var import_path2 = __toESM(require("path"));
async function buildCommandTree(commandsDir) {
  const commandTree = [];
  if (!commandsDir) return [];
  const commandFilePaths = await getFilePaths(commandsDir, true);
  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = import_path2.default.resolve(commandFilePath);
      const commandModule = require(absolutePath);
      let { data, run, deleted, ...rest } = commandModule.default || commandModule;
      if (!data) throw new Error(`File ${commandFilePath} must export "data".`);
      if (!run) throw new Error(`File ${commandFilePath} must export a "run" function.`);
      if (!data.name) throw new Error(`File ${commandFilePath} must have a command name.`);
      if (!data.description) throw new Error(`File ${commandFilePath} must have a command description.`);
      try {
        data = data.toJSON ? data.toJSON() : data;
      } catch (error) {
      }
      commandTree.push({
        ...data,
        ...rest,
        deleted,
        run
      });
    } catch (error) {
      console.error(`[XtonCoreBuilder] Error loading command from ${commandFilePath}:`, error);
    }
  }
  return commandTree;
}

// src/utils/buildCommandTreeLazy.ts
var import_path3 = __toESM(require("path"));
async function buildCommandTreeLazy(commandsDir) {
  const commandTree = [];
  if (!commandsDir) return [];
  const startTime = Date.now();
  const commandFilePaths = await getFilePaths(commandsDir, true);
  for (const commandFilePath of commandFilePaths) {
    try {
      const absolutePath = import_path3.default.resolve(commandFilePath);
      const metadata = await loadCommandMetadata(absolutePath);
      if (!metadata) continue;
      const lazyCommand = {
        ...metadata,
        _loaded: false,
        _filePath: absolutePath
      };
      commandTree.push(lazyCommand);
    } catch (error) {
      console.error(`[LazyLoader] Error loading metadata from ${commandFilePath}:`, error);
    }
  }
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Loaded ${commandTree.length} command metadata in ${loadTime}ms`);
  return commandTree;
}
async function loadCommandMetadata(filePath) {
  try {
    delete require.cache[require.resolve(filePath)];
    const commandModule = require(filePath);
    const { data, deleted, cooldown, permissions, aliases: aliases2, category, ownerOnly, guildOnly, nsfw, customData, ...rest } = commandModule.default || commandModule;
    if (!data) {
      console.warn(`[LazyLoader] File ${filePath} missing "data" export`);
      return null;
    }
    const commandData = data.toJSON ? data.toJSON() : data;
    if (!commandData.name || !commandData.description) {
      console.warn(`[LazyLoader] File ${filePath} missing name or description`);
      return null;
    }
    return {
      ...commandData,
      ...rest,
      filePath,
      deleted,
      cooldown,
      permissions,
      aliases: aliases2,
      category,
      ownerOnly,
      guildOnly,
      nsfw,
      customData
    };
  } catch (error) {
    console.error(`[LazyLoader] Error loading metadata from ${filePath}:`, error);
    return null;
  }
}
async function loadCommandFunction(command) {
  if (command._loaded) return;
  try {
    const startTime = Date.now();
    delete require.cache[require.resolve(command._filePath)];
    const commandModule = require(command._filePath);
    const { run, autocomplete } = commandModule.default || commandModule;
    if (!run) {
      throw new Error(`Command ${command.name} missing "run" function`);
    }
    command.run = run;
    command.autocomplete = autocomplete;
    command._loaded = true;
    const loadTime = Date.now() - startTime;
    console.log(`[LazyLoader] Loaded function for "${command.name}" in ${loadTime}ms`);
  } catch (error) {
    console.error(`[LazyLoader] Error loading function for ${command.name}:`, error);
    throw error;
  }
}
async function preloadCommands(commands, commandNames) {
  const startTime = Date.now();
  const preloadTasks = [];
  for (const command of commands) {
    if (commandNames.includes(command.name)) {
      preloadTasks.push(loadCommandFunction(command));
    }
  }
  await Promise.all(preloadTasks);
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Preloaded ${commandNames.length} commands in ${loadTime}ms`);
}
async function preloadAllCommands(commands) {
  const startTime = Date.now();
  const preloadTasks = commands.map((cmd) => loadCommandFunction(cmd));
  await Promise.all(preloadTasks);
  const loadTime = Date.now() - startTime;
  console.log(`[LazyLoader] Preloaded all ${commands.length} commands in ${loadTime}ms`);
}

// src/utils/getAppCommands.ts
async function getAppCommands(client, guildId) {
  let applicationCommands;
  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = await client.application.commands;
  }
  await applicationCommands.fetch();
  return applicationCommands;
}

// src/utils/areCommandsDifferent.ts
function areCommandsDifferent(existingCommand, localCommand) {
  if (localCommand.description !== existingCommand.description || (localCommand.options?.length || 0) !== existingCommand.options?.length) {
    return true;
  } else {
    return false;
  }
}

// src/logger.ts
var import_winston = require("winston");
var import_fs = __toESM(require("fs"));
var import_path4 = __toESM(require("path"));

// node_modules/gradient-string/node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/gradient-string/node_modules/chalk/source/vendor/supports-color/index.js
var import_node_process = __toESM(require("process"), 1);
var import_node_os = __toESM(require("os"), 1);
var import_node_tty = __toESM(require("tty"), 1);
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : import_node_process.default.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
var { env } = import_node_process.default;
var flagForceColor;
if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
  flagForceColor = 0;
} else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
  flagForceColor = 1;
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (import_node_process.default.platform === "win32") {
    const osRelease = import_node_os.default.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => key in env)) {
      return 3;
    }
    if (["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if (env.TERM === "xterm-ghostty") {
    return 3;
  }
  if (env.TERM === "wezterm") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var supportsColor = {
  stdout: createSupportsColor({ isTTY: import_node_tty.default.isatty(1) }),
  stderr: createSupportsColor({ isTTY: import_node_tty.default.isatty(2) })
};
var supports_color_default = supportsColor;

// node_modules/gradient-string/node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/gradient-string/node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = supports_color_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles2 = /* @__PURE__ */ Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === void 0 ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk2 = (...strings) => strings.join(" ");
  applyOptions(chalk2, options);
  Object.setPrototypeOf(chalk2, createChalk.prototype);
  return chalk2;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, {
  ...styles2,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === void 0) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self2, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self2;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self2, string) => {
  if (self2.level <= 0 || !string) {
    return self2[IS_EMPTY] ? "" : string;
  }
  let styler = self2[STYLER];
  if (styler === void 0) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== void 0) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// node_modules/gradient-string/dist/index.js
var import_tinygradient = __toESM(require_tinygradient(), 1);
var gradient = (...colors) => {
  let gradient2;
  let options;
  if (colors.length === 0) {
    throw new Error("Missing gradient colors");
  }
  if (!Array.isArray(colors[0])) {
    if (colors.length === 1) {
      throw new Error(`Expected an array of colors, received ${JSON.stringify(colors[0])}`);
    }
    gradient2 = (0, import_tinygradient.default)(...colors);
  } else {
    gradient2 = (0, import_tinygradient.default)(colors[0]);
    options = validateOptions(colors[1]);
  }
  const fn = (str, deprecatedOptions) => {
    return applyGradient(str ? str.toString() : "", gradient2, deprecatedOptions ?? options);
  };
  fn.multiline = (str, deprecatedOptions) => multiline(str ? str.toString() : "", gradient2, deprecatedOptions ?? options);
  return fn;
};
var getColors = (gradient2, options, count) => {
  return options.interpolation?.toLowerCase() === "hsv" ? gradient2.hsv(count, options.hsvSpin?.toLowerCase() || false) : gradient2.rgb(count);
};
function applyGradient(str, gradient2, opts) {
  const options = validateOptions(opts);
  const colorsCount = Math.max(str.replace(/\s/g, "").length, gradient2.stops.length);
  const colors = getColors(gradient2, options, colorsCount);
  let result = "";
  for (const s of str) {
    result += s.match(/\s/g) ? s : source_default.hex(colors.shift()?.toHex() || "#000")(s);
  }
  return result;
}
function multiline(str, gradient2, opts) {
  const options = validateOptions(opts);
  const lines = str.split("\n");
  const maxLength = Math.max(...lines.map((l) => l.length), gradient2.stops.length);
  const colors = getColors(gradient2, options, maxLength);
  const results = [];
  for (const line of lines) {
    const lineColors = colors.slice(0);
    let lineResult = "";
    for (const l of line) {
      lineResult += source_default.hex(lineColors.shift()?.toHex() || "#000")(l);
    }
    results.push(lineResult);
  }
  return results.join("\n");
}
function validateOptions(opts) {
  const options = { interpolation: "rgb", hsvSpin: "short", ...opts };
  if (opts !== void 0 && typeof opts !== "object") {
    throw new TypeError(`Expected \`options\` to be an \`object\`, got \`${typeof opts}\``);
  }
  if (typeof options.interpolation !== "string") {
    throw new TypeError(`Expected \`options.interpolation\` to be \`rgb\` or \`hsv\`, got \`${typeof options.interpolation}\``);
  }
  if (options.interpolation.toLowerCase() === "hsv" && typeof options.hsvSpin !== "string") {
    throw new TypeError(`Expected \`options.hsvSpin\` to be a \`short\` or \`long\`, got \`${typeof options.hsvSpin}\``);
  }
  return options;
}
var aliases = {
  atlas: { colors: ["#feac5e", "#c779d0", "#4bc0c8"], options: {} },
  cristal: { colors: ["#bdfff3", "#4ac29a"], options: {} },
  teen: { colors: ["#77a1d3", "#79cbca", "#e684ae"], options: {} },
  mind: { colors: ["#473b7b", "#3584a7", "#30d2be"], options: {} },
  morning: { colors: ["#ff5f6d", "#ffc371"], options: { interpolation: "hsv" } },
  vice: { colors: ["#5ee7df", "#b490ca"], options: { interpolation: "hsv" } },
  passion: { colors: ["#f43b47", "#453a94"], options: {} },
  fruit: { colors: ["#ff4e50", "#f9d423"], options: {} },
  instagram: { colors: ["#833ab4", "#fd1d1d", "#fcb045"], options: {} },
  retro: {
    colors: ["#3f51b1", "#5a55ae", "#7b5fac", "#8f6aae", "#a86aa4", "#cc6b8e", "#f18271", "#f3a469", "#f7c978"],
    options: {}
  },
  summer: { colors: ["#fdbb2d", "#22c1c3"], options: {} },
  rainbow: { colors: ["#ff0000", "#ff0100"], options: { interpolation: "hsv", hsvSpin: "long" } },
  pastel: { colors: ["#74ebd5", "#74ecd5"], options: { interpolation: "hsv", hsvSpin: "long" } }
};
function gradientAlias(alias) {
  const result = (str) => gradient(...alias.colors)(str, alias.options);
  result.multiline = (str = "") => gradient(...alias.colors).multiline(str, alias.options);
  return result;
}
var dist_default = gradient;
var atlas = gradientAlias(aliases.atlas);
var cristal = gradientAlias(aliases.cristal);
var teen = gradientAlias(aliases.teen);
var mind = gradientAlias(aliases.mind);
var morning = gradientAlias(aliases.morning);
var vice = gradientAlias(aliases.vice);
var passion = gradientAlias(aliases.passion);
var fruit = gradientAlias(aliases.fruit);
var instagram = gradientAlias(aliases.instagram);
var retro = gradientAlias(aliases.retro);
var summer = gradientAlias(aliases.summer);
var rainbow = gradientAlias(aliases.rainbow);
var pastel = gradientAlias(aliases.pastel);
gradient.atlas = atlas;
gradient.cristal = cristal;
gradient.teen = teen;
gradient.mind = mind;
gradient.morning = morning;
gradient.vice = vice;
gradient.passion = passion;
gradient.fruit = fruit;
gradient.instagram = instagram;
gradient.retro = retro;
gradient.summer = summer;
gradient.rainbow = rainbow;
gradient.pastel = pastel;

// src/logger.ts
var logDir = "Logs";
if (!import_fs.default.existsSync(logDir)) {
  import_fs.default.mkdirSync(logDir, { recursive: true });
}
var filename = import_path4.default.join(logDir, `Client.log`);
var errorFilename = import_path4.default.join(logDir, `Error.log`);
var debugFilename = import_path4.default.join(logDir, `Debug.log`);
var Clientlogger = (0, import_winston.createLogger)({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: import_winston.format.combine(
    import_winston.format.errors({ stack: true }),
    import_winston.format.label({ label: import_path4.default.basename(process.mainModule?.filename ?? "unknown") }),
    import_winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    import_winston.format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] })
  ),
  transports: [
    // Console transport with colors and gradients
    new import_winston.transports.Console({
      format: import_winston.format.combine(
        import_winston.format.colorize(),
        import_winston.format.printf((info) => {
          const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
          const timestamp = dist_default.rainbow(`${info.timestamp}`);
          const core = dist_default.pastel.multiline("XtonCore");
          let message = `[${timestamp}] ${info.level} [${core}] [${info.label}] [${memory}MB] : ${info.message}`;
          if (info.stack) {
            message += `
${info.stack}`;
          }
          return message;
        })
      )
    }),
    // Main log file
    new import_winston.transports.File({
      filename,
      format: import_winston.format.combine(
        import_winston.format.json(),
        import_winston.format.timestamp()
      ),
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    }),
    // Error-only log file
    new import_winston.transports.File({
      filename: errorFilename,
      level: "error",
      format: import_winston.format.combine(
        import_winston.format.json(),
        import_winston.format.timestamp()
      ),
      maxsize: 5242880,
      // 5MB
      maxFiles: 3
    }),
    // Debug log file (only in development)
    ...process.env.NODE_ENV !== "production" ? [
      new import_winston.transports.File({
        filename: debugFilename,
        level: "debug",
        format: import_winston.format.combine(
          import_winston.format.json(),
          import_winston.format.timestamp()
        ),
        maxsize: 10485760,
        // 10MB
        maxFiles: 2
      })
    ] : []
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new import_winston.transports.File({ filename: import_path4.default.join(logDir, "exceptions.log") })
  ],
  rejectionHandlers: [
    new import_winston.transports.File({ filename: import_path4.default.join(logDir, "rejections.log") })
  ]
});
var EnhancedLogger = class _EnhancedLogger {
  logger;
  context;
  constructor(logger, context = "XtonCore") {
    this.logger = logger;
    this.context = context;
  }
  formatMessage(message, meta) {
    return meta ? `[${this.context}] ${message} ${JSON.stringify(meta)}` : `[${this.context}] ${message}`;
  }
  info(message, meta) {
    this.logger.info(this.formatMessage(message, meta));
  }
  error(message, error, p0, reason) {
    if (error instanceof Error) {
      this.logger.error(this.formatMessage(message), { error: error.message, stack: error.stack });
    } else {
      this.logger.error(this.formatMessage(message, error));
    }
  }
  warn(message, meta) {
    this.logger.warn(this.formatMessage(message, meta));
  }
  debug(message, meta) {
    this.logger.debug(this.formatMessage(message, meta));
  }
  verbose(message, meta) {
    this.logger.verbose(this.formatMessage(message, meta));
  }
  performance(operation, duration, meta) {
    this.logger.info(this.formatMessage(`Performance: ${operation} took ${duration}ms`, meta));
  }
  command(commandName, userId, guildId) {
    this.logger.info(this.formatMessage(`Command executed: ${commandName}`, {
      userId,
      guildId: guildId || "DM"
    }));
  }
  createChild(context) {
    return new _EnhancedLogger(this.logger, `${this.context}:${context}`);
  }
};
var Logger = new EnhancedLogger(Clientlogger);

// src/utils/registerCommands.ts
async function registerCommands({
  client,
  commands: localCommands,
  guild
}) {
  const applicationCommands = await getAppCommands(client, guild);
  for (const localCommand of localCommands) {
    const {
      name,
      name_localizations,
      description,
      description_localizations,
      default_member_permissions,
      dm_permission,
      options
    } = localCommand;
    const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);
    if (existingCommand) {
      if (localCommand.deleted) {
        await applicationCommands.delete(existingCommand.id);
        let message = `\u{1F5D1} Deleted command "${name}".`;
        Clientlogger.info(message);
        continue;
      }
      if (areCommandsDifferent(existingCommand, localCommand)) {
        await applicationCommands.edit(existingCommand.id, {
          description,
          options
        });
        let message = `\u{1F501} Edited command "${name}".`;
        Clientlogger.info(message);
      }
    } else {
      if (localCommand.deleted) {
        let message2 = `\u23E9 Skipping registering command "${name}" as it's set to delete.`;
        Clientlogger.info(message2);
        continue;
      }
      await applicationCommands.create({
        name,
        name_localizations,
        description,
        description_localizations,
        default_member_permissions,
        dm_permission,
        options
      });
      let message = `\u2705 Registered command "${name}".`;
      Clientlogger.info(message);
    }
  }
}

// src/index.ts
var import_node_url = require("url");

// src/managers/PerformanceManager.ts
var import_promises2 = __toESM(require("fs/promises"));
var import_path5 = __toESM(require("path"));
var PerformanceManager = class {
  metrics;
  commandStats;
  startTime;
  statsFile;
  constructor() {
    this.startTime = Date.now();
    this.statsFile = import_path5.default.join(process.cwd(), "stats", "command-stats.json");
    this.metrics = {
      commandExecutions: /* @__PURE__ */ new Map(),
      commandErrors: /* @__PURE__ */ new Map(),
      commandTimes: /* @__PURE__ */ new Map(),
      memoryUsage: [],
      uptime: 0
    };
    this.commandStats = /* @__PURE__ */ new Map();
    this.initializeStatsDirectory();
    this.loadStats();
    this.startMemoryMonitoring();
  }
  async initializeStatsDirectory() {
    try {
      await import_promises2.default.mkdir(import_path5.default.dirname(this.statsFile), { recursive: true });
    } catch (error) {
      Clientlogger.error("Failed to create stats directory:", error);
    }
  }
  async loadStats() {
    try {
      const data = await import_promises2.default.readFile(this.statsFile, "utf-8");
      const savedStats = JSON.parse(data);
      for (const [name, stats] of Object.entries(savedStats)) {
        this.commandStats.set(name, {
          ...stats,
          lastUsed: new Date(stats.lastUsed)
        });
      }
      Clientlogger.info(`Loaded stats for ${this.commandStats.size} commands`);
    } catch (error) {
      Clientlogger.info("No existing stats file found, starting fresh");
    }
  }
  async saveStats() {
    try {
      const statsObject = Object.fromEntries(this.commandStats);
      await import_promises2.default.writeFile(this.statsFile, JSON.stringify(statsObject, null, 2));
    } catch (error) {
      Clientlogger.error("Failed to save stats:", error);
    }
  }
  startMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
      this.metrics.memoryUsage.push(memUsage);
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
      this.metrics.uptime = Date.now() - this.startTime;
    }, 3e4);
    setInterval(() => {
      this.saveStats();
    }, 3e5);
  }
  recordCommandExecution(commandName, executionTime) {
    this.metrics.commandExecutions.set(
      commandName,
      (this.metrics.commandExecutions.get(commandName) || 0) + 1
    );
    const times = this.metrics.commandTimes.get(commandName) || [];
    times.push(executionTime);
    if (times.length > 50) times.shift();
    this.metrics.commandTimes.set(commandName, times);
    const stats = this.commandStats.get(commandName) || {
      name: commandName,
      uses: 0,
      errors: 0,
      lastUsed: /* @__PURE__ */ new Date(),
      averageExecutionTime: 0
    };
    stats.uses++;
    stats.lastUsed = /* @__PURE__ */ new Date();
    stats.averageExecutionTime = times.reduce((a, b) => a + b, 0) / times.length;
    this.commandStats.set(commandName, stats);
  }
  recordCommandError(commandName) {
    this.metrics.commandErrors.set(
      commandName,
      (this.metrics.commandErrors.get(commandName) || 0) + 1
    );
    const stats = this.commandStats.get(commandName);
    if (stats) {
      stats.errors++;
      this.commandStats.set(commandName, stats);
    }
  }
  getCommandStats(commandName) {
    if (commandName) {
      return this.commandStats.get(commandName) || null;
    }
    return Array.from(this.commandStats.values());
  }
  getTopCommands(limit = 10) {
    return Array.from(this.commandStats.values()).sort((a, b) => b.uses - a.uses).slice(0, limit);
  }
  getPerformanceMetrics() {
    return { ...this.metrics };
  }
  getMemoryUsage() {
    const current = process.memoryUsage().heapUsed / 1024 / 1024;
    const average = this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length || 0;
    const peak = Math.max(...this.metrics.memoryUsage, current);
    return { current, average, peak };
  }
  generateReport() {
    const topCommands = this.getTopCommands(5);
    const memory = this.getMemoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1e3);
    let report = `\u{1F4CA} **Performance Report**
`;
    report += `\u23F1\uFE0F Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor(uptime % 3600 / 60)}m
`;
    report += `\u{1F4BE} Memory: ${memory.current.toFixed(2)}MB (avg: ${memory.average.toFixed(2)}MB, peak: ${memory.peak.toFixed(2)}MB)

`;
    report += `\u{1F3C6} **Top Commands:**
`;
    topCommands.forEach((cmd, i) => {
      report += `${i + 1}. ${cmd.name}: ${cmd.uses} uses (${cmd.averageExecutionTime.toFixed(2)}ms avg)
`;
    });
    return report;
  }
};

// src/managers/CooldownManager.ts
var CooldownManager = class {
  cooldowns;
  cleanupInterval;
  constructor() {
    this.cooldowns = /* @__PURE__ */ new Map();
    this.startCleanup();
  }
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.cooldowns.entries()) {
        if (data.expiresAt <= now) {
          this.cooldowns.delete(key);
        }
      }
    }, 6e4);
  }
  getCooldownKey(userId, commandName) {
    return `${userId}-${commandName}`;
  }
  setCooldown(userId, commandName, duration) {
    const key = this.getCooldownKey(userId, commandName);
    const expiresAt = Date.now() + duration * 1e3;
    this.cooldowns.set(key, {
      userId,
      commandName,
      expiresAt
    });
    Clientlogger.debug(`Set cooldown for user ${userId} on command ${commandName} for ${duration}s`);
  }
  getCooldown(userId, commandName) {
    const key = this.getCooldownKey(userId, commandName);
    const cooldown = this.cooldowns.get(key);
    if (!cooldown) return null;
    if (cooldown.expiresAt <= Date.now()) {
      this.cooldowns.delete(key);
      return null;
    }
    return cooldown;
  }
  getRemainingTime(userId, commandName) {
    const cooldown = this.getCooldown(userId, commandName);
    if (!cooldown) return 0;
    return Math.max(0, Math.ceil((cooldown.expiresAt - Date.now()) / 1e3));
  }
  isOnCooldown(userId, commandName) {
    return this.getCooldown(userId, commandName) !== null;
  }
  removeCooldown(userId, commandName) {
    const key = this.getCooldownKey(userId, commandName);
    return this.cooldowns.delete(key);
  }
  clearUserCooldowns(userId) {
    let cleared = 0;
    for (const [key, data] of this.cooldowns.entries()) {
      if (data.userId === userId) {
        this.cooldowns.delete(key);
        cleared++;
      }
    }
    return cleared;
  }
  getAllCooldowns() {
    return Array.from(this.cooldowns.values());
  }
  getCooldownCount() {
    return this.cooldowns.size;
  }
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cooldowns.clear();
  }
};

// src/managers/ComponentManager.ts
var import_path6 = __toESM(require("path"));
var ComponentManager = class {
  client;
  handlers;
  componentsPath;
  constructor(client, componentsPath) {
    this.client = client;
    this.handlers = [];
    this.componentsPath = componentsPath;
  }
  async initialize() {
    if (this.componentsPath) {
      await this.loadComponents();
    }
    this.setupEventListeners();
    Clientlogger.info(`Component Manager initialized with ${this.handlers.length} handlers`);
  }
  async loadComponents() {
    if (!this.componentsPath) return;
    try {
      const componentFiles = await getFilePaths(this.componentsPath, true);
      for (const filePath of componentFiles) {
        try {
          const absolutePath = import_path6.default.resolve(filePath);
          const componentModule = require(absolutePath);
          const handler = componentModule.default || componentModule;
          if (this.isValidHandler(handler)) {
            this.handlers.push(handler);
            Clientlogger.debug(`Loaded component handler: ${handler.customId}`);
          } else {
            Clientlogger.warn(`Invalid component handler in ${filePath}`);
          }
        } catch (error) {
          Clientlogger.error(`Error loading component from ${filePath}:`, error);
        }
      }
    } catch (error) {
      Clientlogger.error("Error loading components:", error);
    }
  }
  isValidHandler(handler) {
    return handler && (typeof handler.customId === "string" || handler.customId instanceof RegExp) && ["button", "selectMenu", "modal"].includes(handler.type) && typeof handler.run === "function";
  }
  setupEventListeners() {
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isSelectMenu()) {
        await this.handleSelectMenuInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModalInteraction(interaction);
      }
    });
  }
  async handleButtonInteraction(interaction) {
    const handler = this.findHandler(interaction.customId, "button");
    if (handler) {
      try {
        await handler.run(interaction, this.client, this);
      } catch (error) {
        Clientlogger.error(`Error executing button handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }
  async handleSelectMenuInteraction(interaction) {
    const handler = this.findHandler(interaction.customId, "selectMenu");
    if (handler) {
      try {
        await handler.run(interaction, this.client, this);
      } catch (error) {
        Clientlogger.error(`Error executing select menu handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }
  async handleModalInteraction(interaction) {
    const handler = this.findHandler(interaction.customId, "modal");
    if (handler) {
      try {
        await handler.run(interaction, this.client, this);
      } catch (error) {
        Clientlogger.error(`Error executing modal handler for ${interaction.customId}:`, error);
        await this.handleInteractionError(interaction, error);
      }
    }
  }
  findHandler(customId, type) {
    return this.handlers.find((handler) => {
      if (handler.type !== type) return false;
      if (typeof handler.customId === "string") {
        return handler.customId === customId;
      } else if (handler.customId instanceof RegExp) {
        return handler.customId.test(customId);
      }
      return false;
    }) || null;
  }
  async handleInteractionError(interaction, error) {
    const errorMessage = "There was an error while processing this interaction!";
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (followUpError) {
      Clientlogger.error("Failed to send error message to user:", followUpError);
    }
  }
  addHandler(handler) {
    if (this.isValidHandler(handler)) {
      this.handlers.push(handler);
      Clientlogger.debug(`Added component handler: ${handler.customId}`);
    } else {
      throw new Error("Invalid component handler");
    }
  }
  removeHandler(customId, type) {
    const index = this.handlers.findIndex(
      (handler) => handler.customId === customId && handler.type === type
    );
    if (index !== -1) {
      this.handlers.splice(index, 1);
      Clientlogger.debug(`Removed component handler: ${customId}`);
      return true;
    }
    return false;
  }
  getHandlers() {
    return [...this.handlers];
  }
  getHandlerCount() {
    return this.handlers.length;
  }
};

// src/managers/PermissionManager.ts
var import_discord = require("discord.js");
var PermissionManager = class {
  ownerIds;
  blacklistedUsers;
  blacklistedGuilds;
  permissionCache;
  constructor(ownerIds = []) {
    this.ownerIds = new Set(ownerIds);
    this.blacklistedUsers = /* @__PURE__ */ new Set();
    this.blacklistedGuilds = /* @__PURE__ */ new Set();
    this.permissionCache = /* @__PURE__ */ new Map();
    this.startCacheCleanup();
  }
  startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.permissionCache.entries()) {
        if (data.expiresAt <= now) {
          this.permissionCache.delete(key);
        }
      }
    }, 3e5);
  }
  addOwner(userId) {
    this.ownerIds.add(userId);
    Clientlogger.info(`Added owner: ${userId}`);
  }
  removeOwner(userId) {
    const removed = this.ownerIds.delete(userId);
    if (removed) {
      Clientlogger.info(`Removed owner: ${userId}`);
    }
    return removed;
  }
  isOwner(userId) {
    return this.ownerIds.has(userId);
  }
  blacklistUser(userId) {
    this.blacklistedUsers.add(userId);
    Clientlogger.info(`Blacklisted user: ${userId}`);
  }
  unblacklistUser(userId) {
    const removed = this.blacklistedUsers.delete(userId);
    if (removed) {
      Clientlogger.info(`Removed user from blacklist: ${userId}`);
    }
    return removed;
  }
  isUserBlacklisted(userId) {
    return this.blacklistedUsers.has(userId);
  }
  blacklistGuild(guildId) {
    this.blacklistedGuilds.add(guildId);
    Clientlogger.info(`Blacklisted guild: ${guildId}`);
  }
  unblacklistGuild(guildId) {
    const removed = this.blacklistedGuilds.delete(guildId);
    if (removed) {
      Clientlogger.info(`Removed guild from blacklist: ${guildId}`);
    }
    return removed;
  }
  isGuildBlacklisted(guildId) {
    return this.blacklistedGuilds.has(guildId);
  }
  async checkPermissions(interaction, command) {
    if (this.isUserBlacklisted(interaction.user.id)) {
      return { allowed: false, reason: "User is blacklisted" };
    }
    if (interaction.guildId && this.isGuildBlacklisted(interaction.guildId)) {
      return { allowed: false, reason: "Guild is blacklisted" };
    }
    if (command.ownerOnly && !this.isOwner(interaction.user.id)) {
      return { allowed: false, reason: "This command is owner-only" };
    }
    if (command.guildOnly && !interaction.guildId) {
      return { allowed: false, reason: "This command can only be used in servers" };
    }
    if (command.nsfw && interaction.channel && !("nsfw" in interaction.channel && interaction.channel.nsfw)) {
      return { allowed: false, reason: "This command can only be used in NSFW channels" };
    }
    if (command.permissions && command.permissions.length > 0 && interaction.member instanceof import_discord.GuildMember) {
      const hasPermissions = await this.checkDiscordPermissions(interaction.member, command.permissions);
      if (!hasPermissions.allowed) {
        return hasPermissions;
      }
    }
    return { allowed: true };
  }
  async checkDiscordPermissions(member, requiredPermissions) {
    try {
      const cacheKey = `${member.id}-${member.guild.id}`;
      const cached = this.permissionCache.get(cacheKey);
      let memberPermissions;
      if (cached && cached.expiresAt > Date.now()) {
        memberPermissions = cached.permissions;
      } else {
        await member.fetch();
        memberPermissions = member.permissions.toArray();
        this.permissionCache.set(cacheKey, {
          permissions: memberPermissions,
          expiresAt: Date.now() + 6e5
        });
      }
      const permissions = new import_discord.PermissionsBitField(memberPermissions);
      const missing = [];
      for (const permission of requiredPermissions) {
        if (!permissions.has(permission)) {
          missing.push(permission.toString());
        }
      }
      if (missing.length > 0) {
        return {
          allowed: false,
          reason: `Missing permissions: ${missing.join(", ")}`
        };
      }
      return { allowed: true };
    } catch (error) {
      Clientlogger.error("Error checking Discord permissions:", error);
      return { allowed: false, reason: "Error checking permissions" };
    }
  }
  getUserPermissions(userId, guildId) {
    if (!guildId) return [];
    const cacheKey = `${userId}-${guildId}`;
    const cached = this.permissionCache.get(cacheKey);
    return cached && cached.expiresAt > Date.now() ? cached.permissions : [];
  }
  clearPermissionCache(userId, guildId) {
    if (userId && guildId) {
      this.permissionCache.delete(`${userId}-${guildId}`);
    } else {
      this.permissionCache.clear();
    }
    Clientlogger.debug("Permission cache cleared");
  }
  getStats() {
    return {
      owners: this.ownerIds.size,
      blacklistedUsers: this.blacklistedUsers.size,
      blacklistedGuilds: this.blacklistedGuilds.size,
      cachedPermissions: this.permissionCache.size
    };
  }
};

// src/managers/RateLimiter.ts
var RateLimiter = class {
  limits;
  defaultLimit;
  defaultWindow;
  // in seconds
  cleanupInterval;
  constructor(defaultLimit = 5, defaultWindow = 60) {
    this.limits = /* @__PURE__ */ new Map();
    this.defaultLimit = defaultLimit;
    this.defaultWindow = defaultWindow;
    this.startCleanup();
  }
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.limits.entries()) {
        if (data.resetTime <= now) {
          this.limits.delete(key);
        }
      }
    }, 3e4);
  }
  getKey(identifier, action = "default") {
    return `${identifier}:${action}`;
  }
  checkLimit(identifier, action = "default", limit = this.defaultLimit, windowSeconds = this.defaultWindow) {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const windowMs = windowSeconds * 1e3;
    let data = this.limits.get(key);
    if (!data || data.resetTime <= now) {
      data = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
    }
    if (data.blocked && data.resetTime > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime,
        blocked: true
      };
    }
    if (data.resetTime <= now) {
      data.blocked = false;
      data.count = 0;
      data.resetTime = now + windowMs;
    }
    const allowed = data.count < limit;
    if (allowed) {
      data.count++;
    } else {
      data.blocked = true;
      Clientlogger.warn(`Rate limit exceeded for ${identifier}:${action}`);
    }
    this.limits.set(key, data);
    return {
      allowed,
      remaining: Math.max(0, limit - data.count),
      resetTime: data.resetTime,
      blocked: data.blocked
    };
  }
  isBlocked(identifier, action = "default") {
    const key = this.getKey(identifier, action);
    const data = this.limits.get(key);
    if (!data) return false;
    const now = Date.now();
    if (data.resetTime <= now) {
      this.limits.delete(key);
      return false;
    }
    return data.blocked;
  }
  getRemainingTime(identifier, action = "default") {
    const key = this.getKey(identifier, action);
    const data = this.limits.get(key);
    if (!data) return 0;
    const now = Date.now();
    return Math.max(0, Math.ceil((data.resetTime - now) / 1e3));
  }
  clearLimit(identifier, action) {
    if (action) {
      const key = this.getKey(identifier, action);
      return this.limits.delete(key);
    } else {
      let cleared = 0;
      for (const key of this.limits.keys()) {
        if (key.startsWith(`${identifier}:`)) {
          this.limits.delete(key);
          cleared++;
        }
      }
      return cleared > 0;
    }
  }
  getStats() {
    const now = Date.now();
    let blocked = 0;
    let active = 0;
    for (const data of this.limits.values()) {
      if (data.resetTime > now) {
        active++;
        if (data.blocked) {
          blocked++;
        }
      }
    }
    return {
      totalLimits: this.limits.size,
      blockedLimits: blocked,
      activeLimits: active
    };
  }
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
};

// src/managers/HotReloadManager.ts
var import_fs2 = __toESM(require("fs"));
var import_path7 = __toESM(require("path"));
var HotReloadManager = class {
  watchers;
  enabled;
  reloadCallbacks;
  constructor(enabled = process.env.NODE_ENV === "development") {
    this.watchers = /* @__PURE__ */ new Map();
    this.enabled = enabled;
    this.reloadCallbacks = /* @__PURE__ */ new Map();
  }
  watchDirectory(directory, callback, options = {}) {
    if (!this.enabled) return;
    const { recursive = true, extensions = [".js", ".ts"] } = options;
    try {
      if (!import_fs2.default.existsSync(directory)) {
        Clientlogger.warn(`Hot reload: Directory ${directory} does not exist`);
        return;
      }
      const watcher = import_fs2.default.watch(directory, { recursive }, async (eventType, filename2) => {
        if (!filename2) return;
        const filePath = import_path7.default.join(directory, filename2);
        const ext = import_path7.default.extname(filename2);
        if (extensions.length > 0 && !extensions.includes(ext)) {
          return;
        }
        const callbackKey = `${directory}:${filename2}`;
        if (this.reloadCallbacks.has(callbackKey)) {
          return;
        }
        this.reloadCallbacks.set(callbackKey, callback);
        setTimeout(async () => {
          try {
            Clientlogger.info(`Hot reload: ${eventType} detected for ${filename2}`);
            await callback(filePath);
          } catch (error) {
            Clientlogger.error(`Hot reload error for ${filePath}:`, error);
          } finally {
            this.reloadCallbacks.delete(callbackKey);
          }
        }, 100);
      });
      this.watchers.set(directory, watcher);
      Clientlogger.info(`Hot reload: Watching ${directory} for changes`);
    } catch (error) {
      Clientlogger.error(`Failed to watch directory ${directory}:`, error);
    }
  }
  stopWatching(directory) {
    const watcher = this.watchers.get(directory);
    if (watcher) {
      watcher.close();
      this.watchers.delete(directory);
      Clientlogger.info(`Hot reload: Stopped watching ${directory}`);
      return true;
    }
    return false;
  }
  stopAllWatching() {
    for (const [directory, watcher] of this.watchers.entries()) {
      watcher.close();
      Clientlogger.info(`Hot reload: Stopped watching ${directory}`);
    }
    this.watchers.clear();
    this.reloadCallbacks.clear();
  }
  isEnabled() {
    return this.enabled;
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAllWatching();
    }
    Clientlogger.info(`Hot reload: ${enabled ? "Enabled" : "Disabled"}`);
  }
  getWatchedDirectories() {
    return Array.from(this.watchers.keys());
  }
  getStats() {
    return {
      enabled: this.enabled,
      watchedDirectories: this.watchers.size,
      pendingCallbacks: this.reloadCallbacks.size
    };
  }
  destroy() {
    this.stopAllWatching();
  }
};

// src/index.ts
var import_figlet = __toESM(require("figlet"));
var import_path8 = __toESM(require("path"));

// src/utils/EmbedBuilder.ts
var import_discord2 = require("discord.js");
var EnhancedEmbedBuilder = class {
  static createBasic(title, description, color) {
    const embed = new import_discord2.EmbedBuilder();
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (color) embed.setColor(color);
    embed.setTimestamp();
    return embed;
  }
  static createSuccess(title = "\u2705 Success", description) {
    return this.createBasic(title, description, 65280);
  }
  static createError(title = "\u274C Error", description) {
    return this.createBasic(title, description, 16711680);
  }
  static createWarning(title = "\u26A0\uFE0F Warning", description) {
    return this.createBasic(title, description, 16776960);
  }
  static createInfo(title = "\u2139\uFE0F Information", description) {
    return this.createBasic(title, description, 39423);
  }
  static createLoading(title = "\u23F3 Loading...", description) {
    return this.createBasic(title, description, 8421504);
  }
  static createUserProfile(user) {
    const embed = new import_discord2.EmbedBuilder().setTitle(`${user.username}'s Profile`).setThumbnail(user.displayAvatarURL({ size: 256 })).setColor(39423).addFields(
      { name: "Username", value: user.username, inline: true },
      { name: "Discriminator", value: user.discriminator || "None", inline: true },
      { name: "ID", value: user.id, inline: true },
      { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1e3)}:F>`, inline: false },
      { name: "Bot Account", value: user.bot ? "Yes" : "No", inline: true }
    ).setTimestamp();
    return embed;
  }
  static createGuildInfo(guild) {
    const embed = new import_discord2.EmbedBuilder().setTitle(`${guild.name} Server Information`).setThumbnail(guild.iconURL({ size: 256 })).setColor(39423).addFields(
      { name: "Server Name", value: guild.name, inline: true },
      { name: "Server ID", value: guild.id, inline: true },
      { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
      { name: "Members", value: guild.memberCount.toString(), inline: true },
      { name: "Created", value: `<t:${Math.floor(guild.createdTimestamp / 1e3)}:F>`, inline: false },
      { name: "Verification Level", value: guild.verificationLevel.toString(), inline: true },
      { name: "Boost Level", value: guild.premiumTier.toString(), inline: true },
      { name: "Boost Count", value: guild.premiumSubscriptionCount?.toString() || "0", inline: true }
    ).setTimestamp();
    if (guild.description) {
      embed.addFields({ name: "Description", value: guild.description, inline: false });
    }
    return embed;
  }
  static createCommandHelp(commandName, description, usage, examples = [], aliases2 = []) {
    const embed = new import_discord2.EmbedBuilder().setTitle(`\u{1F4D6} Command: ${commandName}`).setDescription(description).setColor(39423).addFields(
      { name: "Usage", value: `\`${usage}\``, inline: false }
    ).setTimestamp();
    if (examples.length > 0) {
      embed.addFields({
        name: "Examples",
        value: examples.map((ex) => `\`${ex}\``).join("\n"),
        inline: false
      });
    }
    if (aliases2.length > 0) {
      embed.addFields({
        name: "Aliases",
        value: aliases2.map((alias) => `\`${alias}\``).join(", "),
        inline: false
      });
    }
    return embed;
  }
  static createPagination(items, page, itemsPerPage = 10, title = "Results") {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = items.slice(startIndex, endIndex);
    const embed = new import_discord2.EmbedBuilder().setTitle(title).setDescription(pageItems.join("\n") || "No items found").setColor(39423).setFooter({ text: `Page ${page} of ${totalPages} \u2022 ${items.length} total items` }).setTimestamp();
    return embed;
  }
  static createStats(stats) {
    const embed = new import_discord2.EmbedBuilder().setTitle("\u{1F4CA} Statistics").setColor(39423).setTimestamp();
    for (const [key, value] of Object.entries(stats)) {
      embed.addFields({
        name: key,
        value: value.toString(),
        inline: true
      });
    }
    return embed;
  }
  static createProgressBar(current, max, length = 20, title) {
    const percentage = Math.min(100, Math.max(0, current / max * 100));
    const filledLength = Math.round(percentage / 100 * length);
    const emptyLength = length - filledLength;
    const filledBar = "\u2588".repeat(filledLength);
    const emptyBar = "\u2591".repeat(emptyLength);
    const progressBar = filledBar + emptyBar;
    const embed = new import_discord2.EmbedBuilder().setColor(percentage === 100 ? 65280 : 39423).addFields({
      name: title || "Progress",
      value: `${progressBar} ${percentage.toFixed(1)}%
${current}/${max}`,
      inline: false
    }).setTimestamp();
    return embed;
  }
  // Color constants
  static COLORS = {
    SUCCESS: 65280,
    ERROR: 16711680,
    WARNING: 16776960,
    INFO: 39423,
    LOADING: 8421504,
    PURPLE: 10040012,
    ORANGE: 16747520,
    PINK: 16738740,
    CYAN: 65535,
    LIME: 3329330,
    GOLD: 16766720,
    SILVER: 12632256,
    BRONZE: 13467442
  };
};

// src/utils/ComponentHelpers.ts
var import_discord3 = require("discord.js");
var ComponentHelpers = class {
  // Button Builders
  static createButton(customId, label, style = import_discord3.ButtonStyle.Primary, options = {}) {
    const button = new import_discord3.ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
    if (options.emoji) button.setEmoji(options.emoji);
    if (options.disabled) button.setDisabled(true);
    if (options.url && style === import_discord3.ButtonStyle.Link) {
      button.setURL(options.url);
    }
    return button;
  }
  static createLinkButton(url, label, emoji) {
    const button = new import_discord3.ButtonBuilder().setURL(url).setLabel(label).setStyle(import_discord3.ButtonStyle.Link);
    if (emoji) button.setEmoji(emoji);
    return button;
  }
  // Predefined button sets
  static createConfirmButtons(confirmId = "confirm", cancelId = "cancel") {
    return new import_discord3.ActionRowBuilder().addComponents(
      this.createButton(confirmId, "Confirm", import_discord3.ButtonStyle.Success, { emoji: "\u2705" }),
      this.createButton(cancelId, "Cancel", import_discord3.ButtonStyle.Danger, { emoji: "\u274C" })
    );
  }
  static createPaginationButtons(currentPage, totalPages, baseId = "page") {
    const row = new import_discord3.ActionRowBuilder();
    row.addComponents(
      this.createButton(`${baseId}_first`, "First", import_discord3.ButtonStyle.Secondary, {
        emoji: "\u23EE\uFE0F",
        disabled: currentPage === 1
      })
    );
    row.addComponents(
      this.createButton(`${baseId}_prev`, "Previous", import_discord3.ButtonStyle.Secondary, {
        emoji: "\u25C0\uFE0F",
        disabled: currentPage === 1
      })
    );
    row.addComponents(
      this.createButton(`${baseId}_current`, `${currentPage}/${totalPages}`, import_discord3.ButtonStyle.Primary, {
        disabled: true
      })
    );
    row.addComponents(
      this.createButton(`${baseId}_next`, "Next", import_discord3.ButtonStyle.Secondary, {
        emoji: "\u25B6\uFE0F",
        disabled: currentPage === totalPages
      })
    );
    row.addComponents(
      this.createButton(`${baseId}_last`, "Last", import_discord3.ButtonStyle.Secondary, {
        emoji: "\u23ED\uFE0F",
        disabled: currentPage === totalPages
      })
    );
    return row;
  }
  static createNumberButtons(baseId = "number", start = 1, end = 5) {
    const row = new import_discord3.ActionRowBuilder();
    for (let i = start; i <= Math.min(end, start + 4); i++) {
      row.addComponents(
        this.createButton(`${baseId}_${i}`, i.toString(), import_discord3.ButtonStyle.Secondary)
      );
    }
    return row;
  }
  // Select Menu Builders
  static createSelectMenu(customId, placeholder, options, settings = {}) {
    const selectMenu = new import_discord3.StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder);
    const menuOptions = options.map((option) => {
      const menuOption = new import_discord3.StringSelectMenuOptionBuilder().setLabel(option.label).setValue(option.value);
      if (option.description) menuOption.setDescription(option.description);
      if (option.emoji) menuOption.setEmoji(option.emoji);
      if (option.default) menuOption.setDefault(true);
      return menuOption;
    });
    selectMenu.addOptions(menuOptions);
    if (settings.minValues) selectMenu.setMinValues(settings.minValues);
    if (settings.maxValues) selectMenu.setMaxValues(settings.maxValues);
    if (settings.disabled) selectMenu.setDisabled(true);
    return selectMenu;
  }
  static createSelectMenuRow(customId, placeholder, options, settings) {
    return new import_discord3.ActionRowBuilder().addComponents(
      this.createSelectMenu(customId, placeholder, options, settings)
    );
  }
  // Modal Builders
  static createModal(customId, title, inputs) {
    const modal = new import_discord3.ModalBuilder().setCustomId(customId).setTitle(title);
    const rows = [];
    for (const input of inputs) {
      const textInput = new import_discord3.TextInputBuilder().setCustomId(input.customId).setLabel(input.label).setStyle(input.style || import_discord3.TextInputStyle.Short);
      if (input.placeholder) textInput.setPlaceholder(input.placeholder);
      if (input.required !== void 0) textInput.setRequired(input.required);
      if (input.minLength) textInput.setMinLength(input.minLength);
      if (input.maxLength) textInput.setMaxLength(input.maxLength);
      if (input.value) textInput.setValue(input.value);
      rows.push(new import_discord3.ActionRowBuilder().addComponents(textInput));
    }
    modal.addComponents(...rows);
    return modal;
  }
  // Utility functions
  static createButtonRow(...buttons) {
    return new import_discord3.ActionRowBuilder().addComponents(...buttons);
  }
  static disableAllComponents(components) {
    return components.map((row) => {
      const newRow = new import_discord3.ActionRowBuilder();
      newRow.components = row.components.map((component) => {
        if ("setDisabled" in component) {
          component.setDisabled(true);
        }
        return component;
      });
      return newRow;
    });
  }
  static createLoadingButton(customId = "loading", label = "Loading...") {
    return new import_discord3.ActionRowBuilder().addComponents(
      this.createButton(customId, label, import_discord3.ButtonStyle.Secondary, {
        emoji: "\u23F3",
        disabled: true
      })
    );
  }
  // Common select menu options
  static COMMON_OPTIONS = {
    BOOLEAN: [
      { label: "Yes", value: "true", emoji: "\u2705" },
      { label: "No", value: "false", emoji: "\u274C" }
    ],
    PRIORITY: [
      { label: "Low", value: "low", emoji: "\u{1F7E2}" },
      { label: "Medium", value: "medium", emoji: "\u{1F7E1}" },
      { label: "High", value: "high", emoji: "\u{1F7E0}" },
      { label: "Critical", value: "critical", emoji: "\u{1F534}" }
    ],
    DIFFICULTY: [
      { label: "Easy", value: "easy", emoji: "\u{1F7E2}" },
      { label: "Medium", value: "medium", emoji: "\u{1F7E1}" },
      { label: "Hard", value: "hard", emoji: "\u{1F534}" },
      { label: "Expert", value: "expert", emoji: "\u26AB" }
    ]
  };
};

// src/utils/InputSanitizer.ts
var InputSanitizer = class {
  static DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];
  static SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\;)|(\|)|(\*)|(%)|(<)|(>)|(\{)|(\})|(\[)|(\]))/gi,
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/gi
  ];
  static sanitizeString(input, options = {}) {
    const {
      maxLength = 2e3,
      allowHtml = false,
      allowSql = false,
      customPatterns = []
    } = options;
    if (!input || typeof input !== "string") {
      return "";
    }
    let sanitized = input.trim();
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    if (!allowHtml) {
      for (const pattern of this.DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, "");
      }
    }
    if (!allowSql) {
      for (const pattern of this.SQL_INJECTION_PATTERNS) {
        sanitized = sanitized.replace(pattern, "");
      }
    }
    for (const pattern of customPatterns) {
      sanitized = sanitized.replace(pattern, "");
    }
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    return sanitized;
  }
  static sanitizeDiscordContent(content) {
    return this.sanitizeString(content, {
      maxLength: 2e3,
      allowHtml: false,
      allowSql: false,
      customPatterns: [
        /(@everyone|@here)/gi,
        // Prevent mass mentions
        /discord\.gg\/[a-zA-Z0-9]+/gi,
        // Remove invite links
        /https?:\/\/[^\s]+\.exe/gi
        // Remove executable links
      ]
    });
  }
  static validateUserId(userId) {
    return /^\d{17,19}$/.test(userId);
  }
  static validateGuildId(guildId) {
    return /^\d{17,19}$/.test(guildId);
  }
  static validateChannelId(channelId) {
    return /^\d{17,19}$/.test(channelId);
  }
  static escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  static sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, "_").substring(0, 255);
  }
};

// src/utils/CommandBuilder.ts
var import_discord4 = require("discord.js");
var CommandBuilder = class {
  static createSlashCommand(name, description) {
    return new import_discord4.SlashCommandBuilder().setName(name).setDescription(description);
  }
  static createUserContextMenu(name) {
    return new import_discord4.ContextMenuCommandBuilder().setName(name).setType(import_discord4.ApplicationCommandType.User);
  }
  static createMessageContextMenu(name) {
    return new import_discord4.ContextMenuCommandBuilder().setName(name).setType(import_discord4.ApplicationCommandType.Message);
  }
  static addCommonOptions(builder, options = {}) {
    const { guildOnly = false, ownerOnly = false, nsfw = false } = options;
    if (guildOnly) {
      builder.setDMPermission(false);
    }
    if (nsfw) {
      builder.setNSFW(true);
    }
    return builder;
  }
  static createSubcommandGroup(builder, name, description) {
    return builder.addSubcommandGroup(
      (group) => group.setName(name).setDescription(description)
    );
  }
  static addStringOption(builder, name, description, options = {}) {
    return builder.addStringOption((option) => {
      option.setName(name).setDescription(description);
      if (options.required) option.setRequired(true);
      if (options.choices) option.addChoices(...options.choices);
      if (options.autocomplete) option.setAutocomplete(true);
      if (options.maxLength) option.setMaxLength(options.maxLength);
      if (options.minLength) option.setMinLength(options.minLength);
      return option;
    });
  }
  static addIntegerOption(builder, name, description, options = {}) {
    return builder.addIntegerOption((option) => {
      option.setName(name).setDescription(description);
      if (options.required) option.setRequired(true);
      if (options.choices) option.addChoices(...options.choices);
      if (options.autocomplete) option.setAutocomplete(true);
      if (options.maxValue) option.setMaxValue(options.maxValue);
      if (options.minValue) option.setMinValue(options.minValue);
      return option;
    });
  }
  static addBooleanOption(builder, name, description, required = false) {
    return builder.addBooleanOption(
      (option) => option.setName(name).setDescription(description).setRequired(required)
    );
  }
  static addUserOption(builder, name, description, required = false) {
    return builder.addUserOption(
      (option) => option.setName(name).setDescription(description).setRequired(required)
    );
  }
  static addChannelOption(builder, name, description, options = {}) {
    return builder.addChannelOption((option) => {
      option.setName(name).setDescription(description);
      if (options.required) option.setRequired(true);
      if (options.channelTypes) option.addChannelTypes(...options.channelTypes);
      return option;
    });
  }
  static addRoleOption(builder, name, description, required = false) {
    return builder.addRoleOption(
      (option) => option.setName(name).setDescription(description).setRequired(required)
    );
  }
  static addAttachmentOption(builder, name, description, required = false) {
    return builder.addAttachmentOption(
      (option) => option.setName(name).setDescription(description).setRequired(required)
    );
  }
  // Predefined permission sets
  static PERMISSIONS = {
    ADMIN: [import_discord4.PermissionFlagsBits.Administrator],
    MODERATOR: [
      import_discord4.PermissionFlagsBits.ManageMessages,
      import_discord4.PermissionFlagsBits.ManageRoles,
      import_discord4.PermissionFlagsBits.KickMembers
    ],
    MANAGE_GUILD: [import_discord4.PermissionFlagsBits.ManageGuild],
    MANAGE_CHANNELS: [import_discord4.PermissionFlagsBits.ManageChannels],
    MANAGE_ROLES: [import_discord4.PermissionFlagsBits.ManageRoles],
    BAN_MEMBERS: [import_discord4.PermissionFlagsBits.BanMembers],
    KICK_MEMBERS: [import_discord4.PermissionFlagsBits.KickMembers],
    MANAGE_MESSAGES: [import_discord4.PermissionFlagsBits.ManageMessages],
    SEND_MESSAGES: [import_discord4.PermissionFlagsBits.SendMessages],
    VIEW_CHANNEL: [import_discord4.PermissionFlagsBits.ViewChannel]
  };
  // Common channel types
  static CHANNEL_TYPES = {
    TEXT: [import_discord4.ChannelType.GuildText],
    VOICE: [import_discord4.ChannelType.GuildVoice],
    CATEGORY: [import_discord4.ChannelType.GuildCategory],
    NEWS: [import_discord4.ChannelType.GuildNews],
    STAGE: [import_discord4.ChannelType.GuildStageVoice],
    FORUM: [import_discord4.ChannelType.GuildForum],
    TEXT_AND_NEWS: [import_discord4.ChannelType.GuildText, import_discord4.ChannelType.GuildNews],
    ALL_GUILD: [
      import_discord4.ChannelType.GuildText,
      import_discord4.ChannelType.GuildVoice,
      import_discord4.ChannelType.GuildCategory,
      import_discord4.ChannelType.GuildNews,
      import_discord4.ChannelType.GuildStageVoice,
      import_discord4.ChannelType.GuildForum
    ]
  };
};

// src/index.ts
var ClientHandler = class _ClientHandler {
  _client;
  _commandsPath;
  _eventsPath;
  _validationsPath;
  _componentsPath;
  _guild;
  _options;
  _validationFuncs;
  _commands;
  _commandsMap;
  // Enhanced managers
  _performanceManager;
  _cooldownManager;
  _componentManager;
  _permissionManager;
  _rateLimiter;
  _hotReloadManager;
  _logger;
  static async create(options) {
    const handler = new _ClientHandler(options);
    await handler._initialize();
    return handler;
  }
  constructor(options) {
    const {
      client,
      commandsPath,
      eventsPath,
      validationsPath,
      componentsPath,
      guild,
      ownerIds = [],
      enableHotReload = process.env.NODE_ENV === "development",
      lazyLoading = true,
      // ⚡ Lazy loading enabled by default
      preloadCommands: preloadCommandsList = [],
      rateLimiting = { enabled: true, defaultLimit: 5, defaultWindow: 60 },
      performance = { enabled: true, trackMemory: true }
    } = options;
    if (!client) {
      throw new Error('Property "client" is required when instantiating ClientHandler.');
    }
    this._client = client;
    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._validationsPath = validationsPath;
    this._componentsPath = componentsPath;
    this._guild = guild;
    this._options = options;
    this._commands = [];
    this._commandsMap = /* @__PURE__ */ new Map();
    this._validationFuncs = [];
    this._logger = Logger.createChild("ClientHandler");
    this._performanceManager = new PerformanceManager();
    this._cooldownManager = new CooldownManager();
    this._componentManager = new ComponentManager(client, componentsPath);
    this._permissionManager = new PermissionManager(ownerIds);
    this._rateLimiter = new RateLimiter(
      rateLimiting.defaultLimit,
      rateLimiting.defaultWindow
    );
    this._hotReloadManager = new HotReloadManager(enableHotReload);
    if (this._validationsPath && !commandsPath) {
      throw new Error(
        'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "validationsPath"'
      );
    }
  }
  async _initialize() {
    const startTime = Date.now();
    try {
      const figletData = await new Promise((resolve, reject) => {
        (0, import_figlet.default)("XtonCore", (err, data) => {
          if (err) {
            this._logger.error("Figlet error:", err);
            reject(err);
            return;
          }
          resolve(data);
        });
      });
      if (figletData) {
        console.log(dist_default.rainbow(figletData));
      }
      this._logger.info("XtonCore Enhanced v2.0 is Starting...");
    } catch (error) {
      this._logger.warn("Could not display startup banner.");
    }
    const initTasks = [];
    initTasks.push(this._initializeManagers());
    if (this._commandsPath) {
      initTasks.push(this._commandsInit());
    }
    if (this._eventsPath) {
      initTasks.push(this._eventsInit());
    }
    await Promise.all(initTasks);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 Parallel loading completed in ${loadTime}ms`);
    if (this._commandsPath) {
      this._client.once("ready", async () => {
        this._registerSlashCommands();
        if (this._validationsPath) {
          await this._validationsInit();
        }
        this._handleCommands();
        this._handleAutocomplete();
        this._logger.info("All systems initialized successfully!");
      });
    }
    this._setupHotReload();
  }
  async _initializeManagers() {
    try {
      const startTime = Date.now();
      if (this._componentsPath) {
        await this._componentManager.initialize();
      }
      const loadTime = Date.now() - startTime;
      this._logger.debug(`Enhanced managers initialized in ${loadTime}ms`);
    } catch (error) {
      this._logger.error("Error initializing managers:", error);
    }
  }
  _setupHotReload() {
    if (!this._hotReloadManager.isEnabled()) return;
    if (this._commandsPath) {
      this._hotReloadManager.watchDirectory(this._commandsPath, async (filePath) => {
        this._logger.info(`Reloading commands due to change in ${filePath}`);
        await this._commandsInit();
        this._registerSlashCommands();
      });
    }
    if (this._eventsPath) {
      this._hotReloadManager.watchDirectory(this._eventsPath, async (filePath) => {
        this._logger.info(`Reloading events due to change in ${filePath}`);
        this._logger.warn("Event changes detected. Consider restarting for full reload.");
      });
    }
    if (this._componentsPath) {
      this._hotReloadManager.watchDirectory(this._componentsPath, async (filePath) => {
        this._logger.info(`Reloading components due to change in ${filePath}`);
        await this._componentManager.initialize();
      });
    }
  }
  async _commandsInit() {
    const startTime = Date.now();
    const lazyLoading = this._options.lazyLoading !== false;
    let commandArray;
    if (lazyLoading) {
      this._logger.info("\u26A1 Using lazy loading for commands...");
      commandArray = await buildCommandTreeLazy(this._commandsPath);
      if (this._options.preloadCommands && this._options.preloadCommands.length > 0) {
        await preloadCommands(commandArray, this._options.preloadCommands);
      }
    } else {
      this._logger.info("Loading all commands (lazy loading disabled)...");
      commandArray = await buildCommandTree(this._commandsPath);
    }
    this._commands = commandArray;
    this._commandsMap.clear();
    for (const cmd of commandArray) {
      if (cmd.name) {
        this._commandsMap.set(cmd.name, cmd);
      }
    }
    const loadTime = Date.now() - startTime;
    const loadType = lazyLoading ? "metadata" : "commands";
    this._logger.debug(`Loaded ${commandArray.length} ${loadType} in ${loadTime}ms`);
  }
  _registerSlashCommands() {
    registerCommands({
      client: this._client,
      commands: this._commands,
      guild: this._guild
    }).catch((error) => Clientlogger.error("Error during slash command registration:", error));
  }
  async _eventsInit() {
    if (!this._eventsPath) return;
    const startTime = Date.now();
    const eventPaths = await getFolderPaths(this._eventsPath);
    let totalEvents = 0;
    for (const eventPath of eventPaths) {
      const eventName = import_path8.default.basename(eventPath);
      const eventFuncPaths = await getFilePaths(eventPath, true);
      eventFuncPaths.sort();
      if (!eventName) continue;
      totalEvents += eventFuncPaths.length;
      this._client.on(eventName, async (...args) => {
        for (const eventFuncPath of eventFuncPaths) {
          try {
            const absolutePath = import_path8.default.resolve(eventFuncPath);
            const eventModule = require(absolutePath);
            const eventFunc = eventModule.default || eventModule;
            if (typeof eventFunc === "function") {
              const cantRunEvent = await eventFunc(...args, this._client, this);
              if (cantRunEvent) break;
            } else {
              Clientlogger.warn(`Event file ${eventFuncPath} does not export a default function.`);
            }
          } catch (error) {
            if (error instanceof Error) {
              Clientlogger.error(`Error loading event module from ${eventFuncPath}: ${error.message}`, error);
            } else {
              Clientlogger.error(`Error loading event module from ${eventFuncPath}: Unknown error`, error);
            }
          }
        }
      });
    }
    const loadTime = Date.now() - startTime;
    this._logger.debug(`Loaded ${totalEvents} event handlers in ${loadTime}ms`);
  }
  async _validationsInit() {
    if (!this._validationsPath) return;
    const validationFilePaths = await getFilePaths(this._validationsPath, true);
    validationFilePaths.sort();
    for (const validationFilePath of validationFilePaths) {
      try {
        const absolutePath = import_path8.default.resolve(validationFilePath);
        const fileURL = (0, import_node_url.pathToFileURL)(absolutePath).href;
        const validationModule = await import(fileURL);
        const validationFunc = validationModule.default || validationModule;
        if (typeof validationFunc !== "function") {
          throw new Error(`Validation file ${validationFilePath} must export a function by default.`);
        }
        this._validationFuncs.push(validationFunc);
      } catch (error) {
        if (error instanceof Error) {
          Clientlogger.error(`Error loading validation module from ${validationFilePath}: ${error.message}`, error);
        } else {
          Clientlogger.error(`Error loading validation module from ${validationFilePath}: Unknown error`, error);
        }
      }
    }
  }
  _handleCommands() {
    this._client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this._commandsMap.get(interaction.commandName);
      if (!command) return;
      const startTime = Date.now();
      const userId = interaction.user.id;
      const guildId = interaction.guildId;
      try {
        if (this._options.rateLimiting?.enabled) {
          const rateLimit = this._rateLimiter.checkLimit(userId, "command");
          if (!rateLimit.allowed) {
            const remainingTime = this._rateLimiter.getRemainingTime(userId, "command");
            await interaction.reply({
              content: `\u23F0 You're being rate limited! Please wait ${remainingTime} seconds before using commands again.`,
              ephemeral: true
            });
            return;
          }
        }
        const permissionCheck = await this._permissionManager.checkPermissions(interaction, command);
        if (!permissionCheck.allowed) {
          await interaction.reply({
            content: `\u274C ${permissionCheck.reason}`,
            ephemeral: true
          });
          return;
        }
        if (command.cooldown && command.cooldown > 0) {
          if (this._cooldownManager.isOnCooldown(userId, command.name)) {
            const remainingTime = this._cooldownManager.getRemainingTime(userId, command.name);
            await interaction.reply({
              content: `\u23F3 This command is on cooldown! Please wait ${remainingTime} seconds.`,
              ephemeral: true
            });
            return;
          }
        }
        if (this._validationFuncs.length) {
          let canRun = true;
          for (const validationFunc of this._validationFuncs) {
            const cantRunCommand = await Promise.resolve(validationFunc(interaction, command, this, this._client));
            if (cantRunCommand) {
              canRun = false;
              break;
            }
          }
          if (!canRun) return;
        }
        const lazyCommand = command;
        if (lazyCommand._loaded === false && lazyCommand._filePath) {
          this._logger.debug(`\u26A1 Lazy loading function for "${command.name}"...`);
          await loadCommandFunction(lazyCommand);
        }
        if (!command.run) {
          throw new Error(`Command "${command.name}" has no run function`);
        }
        await command.run({
          interaction,
          client: this._client,
          handler: this
        });
        if (command.cooldown && command.cooldown > 0) {
          this._cooldownManager.setCooldown(userId, command.name, command.cooldown);
        }
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandExecution(command.name, executionTime);
        this._logger.command(command.name, userId, guildId ?? void 0);
      } catch (error) {
        const executionTime = Date.now() - startTime;
        this._performanceManager.recordCommandError(command.name);
        this._logger.error(`Error executing command ${command.name}:`, error);
        try {
          const errorMessage = process.env.NODE_ENV === "development" ? `\u274C Command error: ${error instanceof Error ? error.message : "Unknown error"}` : "\u274C There was an error while executing this command!";
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
          } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
          }
        } catch (followUpError) {
          this._logger.error("Error sending error message to user:", followUpError);
        }
      }
    });
  }
  _handleAutocomplete() {
    this._client.on("interactionCreate", async (interaction) => {
      if (!interaction.isAutocomplete()) return;
      const command = this._commandsMap.get(interaction.commandName);
      if (!command || !command.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        this._logger.error(`Error in autocomplete for ${command.name}:`, error);
      }
    });
  }
  // Public getters for accessing managers and data
  get commands() {
    return this._commands;
  }
  get commandMap() {
    return this._commandsMap;
  }
  get client() {
    return this._client;
  }
  get performanceManager() {
    return this._performanceManager;
  }
  get cooldownManager() {
    return this._cooldownManager;
  }
  get componentManager() {
    return this._componentManager;
  }
  get permissionManager() {
    return this._permissionManager;
  }
  get rateLimiter() {
    return this._rateLimiter;
  }
  get hotReloadManager() {
    return this._hotReloadManager;
  }
  // Utility methods
  async reloadCommands() {
    if (!this._commandsPath) {
      throw new Error("No commands path configured");
    }
    const startTime = Date.now();
    this._logger.info("Manually reloading commands...");
    await this._commandsInit();
    this._registerSlashCommands();
    const loadTime = Date.now() - startTime;
    this._logger.info(`Commands reloaded successfully in ${loadTime}ms`);
  }
  async reloadComponents() {
    if (!this._componentsPath) {
      throw new Error("No components path configured");
    }
    const startTime = Date.now();
    this._logger.info("Manually reloading components...");
    await this._componentManager.initialize();
    const loadTime = Date.now() - startTime;
    this._logger.info(`Components reloaded successfully in ${loadTime}ms`);
  }
  /**
   * ⚡ Reload everything in parallel for maximum speed
   */
  async reloadAll() {
    const startTime = Date.now();
    this._logger.info("\u26A1 Reloading all modules in parallel...");
    const reloadTasks = [];
    if (this._commandsPath) {
      reloadTasks.push(
        this._commandsInit().then(() => {
          this._registerSlashCommands();
        })
      );
    }
    if (this._componentsPath) {
      reloadTasks.push(this._componentManager.initialize());
    }
    if (this._eventsPath) {
      reloadTasks.push(this._eventsInit());
    }
    await Promise.all(reloadTasks);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 All modules reloaded successfully in ${loadTime}ms`);
  }
  /**
   * ⚡ Preload specific commands (useful for frequently used commands)
   * @param commandNames - Array of command names to preload
   */
  async preloadCommands(commandNames) {
    const startTime = Date.now();
    this._logger.info(`\u26A1 Preloading ${commandNames.length} commands...`);
    const lazyCommands = this._commands.filter((cmd) => {
      const lazyCm = cmd;
      return lazyCm._loaded === false && commandNames.includes(cmd.name);
    });
    await preloadCommands(lazyCommands, commandNames);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 Preloaded ${commandNames.length} commands in ${loadTime}ms`);
  }
  /**
   * ⚡ Preload all commands (useful for production)
   */
  async preloadAllCommands() {
    const startTime = Date.now();
    this._logger.info("\u26A1 Preloading all commands...");
    const lazyCommands = this._commands.filter((cmd) => {
      const lazyCmd = cmd;
      return lazyCmd._loaded === false;
    });
    if (lazyCommands.length === 0) {
      this._logger.info("All commands already loaded");
      return;
    }
    await preloadAllCommands(lazyCommands);
    const loadTime = Date.now() - startTime;
    this._logger.info(`\u26A1 Preloaded all ${lazyCommands.length} commands in ${loadTime}ms`);
  }
  /**
   * Get lazy loading statistics
   */
  getLazyLoadingStats() {
    const total = this._commands.length;
    const loaded = this._commands.filter((cmd) => {
      const lazyCmd = cmd;
      return lazyCmd._loaded !== false;
    }).length;
    const unloaded = total - loaded;
    const percentage = total > 0 ? Math.round(loaded / total * 100) : 0;
    return { total, loaded, unloaded, percentage };
  }
  getStats() {
    return {
      commands: this._commands.length,
      performance: this._performanceManager.getPerformanceMetrics(),
      cooldowns: this._cooldownManager.getCooldownCount(),
      components: this._componentManager.getHandlerCount(),
      permissions: this._permissionManager.getStats(),
      rateLimiter: this._rateLimiter.getStats(),
      hotReload: this._hotReloadManager.getStats()
    };
  }
  generateReport() {
    const stats = this.getStats();
    const performanceReport = this._performanceManager.generateReport();
    let report = `\u{1F680} **XtonCore Enhanced Status Report**

`;
    report += performanceReport + "\n\n";
    report += `\u{1F4CA} **System Stats:**
`;
    report += `\u2022 Commands: ${stats.commands}
`;
    report += `\u2022 Active Cooldowns: ${stats.cooldowns}
`;
    report += `\u2022 Component Handlers: ${stats.components}
`;
    report += `\u2022 Rate Limits: ${stats.rateLimiter.activeLimits} active, ${stats.rateLimiter.blockedLimits} blocked
`;
    report += `\u2022 Hot Reload: ${stats.hotReload.enabled ? "Enabled" : "Disabled"} (${stats.hotReload.watchedDirectories} directories)
`;
    return report;
  }
  // Cleanup method
  destroy() {
    this._logger.info("Shutting down XtonCore Enhanced...");
    this._cooldownManager.destroy();
    this._rateLimiter.destroy();
    this._hotReloadManager.destroy();
    this._logger.info("XtonCore Enhanced shutdown complete");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClientHandler,
  Clientlogger,
  CommandBuilder,
  ComponentHelpers,
  ComponentManager,
  CooldownManager,
  EnhancedEmbedBuilder,
  HotReloadManager,
  InputSanitizer,
  Logger,
  PerformanceManager,
  PermissionManager,
  RateLimiter
});
