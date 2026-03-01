/* eslint-disable no-undef, no-restricted-globals, no-unused-expressions, eqeqeq, no-native-reassign, array-callback-return, no-unused-vars */
/* deprecated */
const t = require('babel-types');
export default {
  /* continuations.kont${restore}(); */
  Program(path) {
    path.node.body.unshift(
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier('continuations'), t.identifier(`kont${restore}`)),
          [],
        ),
      ),
    );
  },
};
