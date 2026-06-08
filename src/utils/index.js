export function isPlainText(text) {
  let letters = 0;
  let symbols = 0;

  for (const ch of text) {
    if (/\s/u.test(ch)) continue;

    if (/\p{L}/u.test(ch)) {
      letters++;
    } else {
      symbols++;
    }
  }

  return letters > symbols;
}
