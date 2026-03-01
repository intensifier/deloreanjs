'use strict';

const seenDeprecatedMessages = new Set();

class BrowserSafeBabelLogger {
  constructor(file, filename) {
    this.file = file;
    this.filename = filename;
  }

  _buildMessage(msg) {
    let parts = `[BABEL] ${this.filename}`;
    if (msg) parts += `: ${msg}`;
    return parts;
  }

  warn(msg) {
    console.warn(this._buildMessage(msg));
  }

  error(msg, Constructor = Error) {
    throw new Constructor(this._buildMessage(msg));
  }

  deprecate(msg) {
    if (this.file?.opts?.suppressDeprecationMessages) return;

    const fullMessage = this._buildMessage(msg);
    if (seenDeprecatedMessages.has(fullMessage)) return;

    seenDeprecatedMessages.add(fullMessage);
    console.error(fullMessage);
  }

  verbose() {}

  debug() {}

  deopt(node, msg) {
    this.debug(msg);
  }
}

module.exports = BrowserSafeBabelLogger;
