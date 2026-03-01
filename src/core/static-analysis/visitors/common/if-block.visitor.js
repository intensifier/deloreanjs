/* eslint-disable no-undef, no-restricted-globals, no-unused-expressions, eqeqeq, no-native-reassign, array-callback-return, no-unused-vars */
const t = require('babel-types');
//Turns consequent of if blocks into blocks
export default {
  IfStatement(path) {
    if (path.node.consequent.type != 'BlockStatement') {
      let block = t.blockStatement([path.node.consequent], []);
      path.node.consequent = block;
    }
  },
};
