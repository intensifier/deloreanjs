/* eslint-disable no-undef, no-restricted-globals, no-unused-expressions, eqeqeq, no-native-reassign, array-callback-return, no-unused-vars */
export default {
  'ForStatement|DoWhileStatement|WhileStatement'(path) {
    let test = path.get('test');

    if (test.type == 'BinaryExpression' || test.type == 'CallExpression') {
      let hasTimepoint = false;
      path.traverse({
        ExpressionStatement(path) {
          if (isTimePoint(path.node)) hasTimepoint = true;
        },
      });
      if (hasTimepoint) {
        test.traverse({
          Identifier(path) {
            var isInMemberExpression = false;
            let parentPath = path.context.parentPath;
            while (
              parentPath.node.type != 'ForStatement' &&
              parentPath.node.type != 'WhileStatement' &&
              parentPath.node.type != 'DoWhileStatement'
            ) {
              if (parentPath.node.type == 'MemberExpression') {
                isInMemberExpression = true;
                break;
              }

              parentPath = parentPath.context.parentPath;
            }

            if (
              !isInMemberExpression &&
              !dependencies.some((dependency) => dependency.name == path.node.name)
            ) {
              dependencies.push({ name: path.node.name, type: 'loop' });
            }
          },
        });
      }
    }
  },
};
