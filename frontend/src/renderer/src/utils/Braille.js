/* eslint-disable no-dupe-keys */
export const BRAILLE = {
  ' ': '⠀',
  '_': '⠸',
  '-': '⠤',
  ',': '⠠',
  ';': '⠰',
  ':': '⠱',
  '!': '⠖',
  '¡': '⠖',
  '?': '⠦',
  '¿': '⠦',
  '.': '⠨',
  '(': '⠷',
  '[': '⠪',
  '@': '⠈',
  '*': '⠡',
  '/': '⠌',
  "'": '⠄',
  '"': '⠐',
  '\\': '⠳',
  '&': '⠯',
  '%': '⠩',
  '^': '⠘',
  '+': '⠬',
  '<': '⠣',
  '>': '⠜',
  $: '⠫',
  0: '⠴',
  1: '⠂',
  2: '⠆',
  3: '⠒',
  4: '⠲',
  5: '⠢',
  6: '⠖',
  7: '⠶',
  8: '⠦',
  9: '⠔',
  A: '⠁',
  B: '⠃',
  C: '⠉',
  D: '⠙',
  E: '⠑',
  F: '⠋',
  G: '⠛',
  H: '⠓',
  I: '⠊',
  J: '⠚',
  K: '⠅',
  L: '⠇',
  M: '⠍',
  N: '⠝',
  O: '⠕',
  P: '⠏',
  Q: '⠟',
  R: '⠗',
  S: '⠎',
  T: '⠞',
  U: '⠥',
  V: '⠧',
  W: '⠺',
  X: '⠭',
  Y: '⠽',
  Z: '⠵',
  a: '⠁',
  b: '⠃',
  c: '⠉',
  d: '⠙',
  e: '⠑',
  f: '⠋',
  g: '⠛',
  h: '⠓',
  i: '⠊',
  j: '⠚',
  k: '⠅',
  l: '⠇',
  m: '⠍',
  n: '⠝',
  o: '⠕',
  p: '⠏',
  q: '⠟',
  r: '⠗',
  s: '⠎',
  t: '⠞',
  u: '⠥',
  v: '⠧',
  w: '⠺',
  x: '⠭',
  y: '⠽',
  z: '⠵',
  á: '⠷',
  é: '⠮',
  í: '⠌',
  ó: '⠬',
  ú: '⠾',
  ñ: '⠻',
  ü: '⠳',
  ']': '⠻',
  '#': '⠼',
  ')': '⠾',
  '=': '⠿'
}

export const ASCII = {
  ' ': ' ',
  '⠀': ' ',
  '⠸': '_',
  '⠤': '-',
  '⠠': ',',
  '⠰': ';',
  '⠱': ':',
  '⠖': '¡',
  '⠦': '¿',
  '⠨': '.',
  '⠷': '(',
  '⠪': '[',
  '⠈': '@',
  '⠡': '*',
  '⠌': 'í',
  '⠄': "'",
  '⠐': '"',
  '⠳': 'ü',
  '⠯': '&',
  '⠩': '%',
  '⠘': '^',
  '⠬': 'ó',
  '⠣': '<',
  '⠜': '>',
  '⠫': '$',
  '⠴': '0',
  '⠂': '1',
  '⠆': '2',
  '⠒': '3',
  '⠲': '4',
  '⠢': '5',
  '⠖': '6',
  '⠶': '7',
  '⠦': '8',
  '⠔': '9',
  '⠁': 'a',
  '⠃': 'b',
  '⠉': 'c',
  '⠙': 'd',
  '⠑': 'e',
  '⠋': 'f',
  '⠛': 'g',
  '⠓': 'h',
  '⠊': 'i',
  '⠚': 'j',
  '⠅': 'k',
  '⠇': 'l',
  '⠍': 'm',
  '⠝': 'n',
  '⠕': 'o',
  '⠏': 'p',
  '⠟': 'q',
  '⠗': 'r',
  '⠎': 's',
  '⠞': 't',
  '⠥': 'u',
  '⠧': 'v',
  '⠺': 'w',
  '⠭': 'x',
  '⠽': 'y',
  '⠵': 'z',
  '⠷': 'á',
  '⠮': 'é',
  '⠌': 'í',
  '⠬': 'ó',
  '⠾': 'ú',
  '⠻': 'ñ',
  '⠳': 'ü',
  ']': ']',
  '#': '#',
  ')': ')',
  '=': '='
}

export function convert(character) {
  return BRAILLE[character] ? BRAILLE[character] : '?'
}

export function read(symbol) {
  return ASCII[symbol] ? ASCII[symbol] : '?'
}

export function toBraille(text) {
  let brailleText = ''

  for (let i = 0; i < text.length; i++) {
    brailleText += convert(text[i])
  }

  return brailleText
}

export function toText(code) {
  let asciiText = ''

  for (let i = 0; i < code.length; i++) {
    asciiText += read(code[i])
  }

  return asciiText
}
