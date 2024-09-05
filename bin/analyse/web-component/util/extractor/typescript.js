/* eslint-disable indent */
const ts = require('typescript');

function FlatArray(array, depth = 1) {
  return array.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) && depth > 1 ? toFlatten.flat(depth - 1) : toFlatten);
  }, []);
}

// typescript extractor
function ts_extractor(fileName, className) {
  // Parse a file
  const program = ts.createProgram([fileName], {});
  const checker = program.getTypeChecker();

  // Get source of the file
  const sourceFile = program.getSourceFile(fileName);
  const properties = [];

  if (sourceFile) {
    // Use built-in TypeScript function to visit nodes in the AST (Abstract Syntax Tree)
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node) && node.name.escapedText === className) {
        // If the node is a class declaration
        node.members.forEach(member => {
          // TODO improvement: 
          // if (ts.isPropertyDeclaration(member) || !!member.symbol.valueDeclaration) {
          if (ts.isPropertyDeclaration(member)) {
            // If the member is a property declaration
            const type = member.type;

            // mostly to eliminate styles
            if (type && !member.modifiers?.some(modifier => [ts.SyntaxKind.StaticKeyword, ts.SyntaxKind.PrivateKeyword].includes(modifier.kind))) {
              let default_value = undefined;
              if (member.initializer) {
                default_value = getInitialValue(member.initializer);
              }

              const name = member.name.escapedText;
              let typeName;
              let primitive = true;
              let type_value = null;

              switch (type.kind) {
                case ts.SyntaxKind.StringKeyword:
                  typeName = "string";
                  break;
                case ts.SyntaxKind.NumberKeyword:
                  typeName = "number";
                  // eslint-disable-next-line indent
                  break;
                case ts.SyntaxKind.BooleanKeyword:
                  typeName = "boolean";
                  break;
                case ts.SyntaxKind.NullKeyword:
                  typeName = 'object'; // should not really happen but just in case
                  breakM;
                // eslint-disable-next-line indent
                default:
                  if (type.types) {
                    // ts.SyntaxKind.NullKeyword
                    const types = [];
                    for (let t of type.types) {
                      types.push(extract_type(checker, t));
                    }
                    typeName = 'alternative';
                    type_value = FlatArray(types) || [];
                  }
                  else {
                    primitive = false;
                    typeName = type.typeName?.escapedText;
                  }
                  break;
              }

              if (type_value === null && ts.isTypeReferenceNode(member.type)) {
                const symbol = checker.getSymbolAtLocation(member.type.typeName);
                if (!symbol) return null;
                const checknode = checker.getDeclaredTypeOfSymbol(symbol);

                type_value = extract_type(checker, checknode);
              }

              properties.push({ name, type: typeName, default_value, type_value, primitive, conditional: !!member.questionToken })
            }
          }
        });

      }
    });
  }

  function getInitialValue(initializer) {
    if (ts.isObjectLiteralExpression(initializer)) {
      const result = {};
      for (const property of initializer.properties) {
        if (ts.isPropertyAssignment(property)) {
          const name = property.name.escapedText;
          const value = getInitialValue(property.initializer);
          result[name] = value;
        }
      }
      return result;
    }
    if (ts.isNumericLiteral(initializer)) {
      return Number(initializer.text);
    }
    if (ts.isStringLiteral(initializer)) {
      return initializer.text;
    }
    if (ts.isBooleanLiteral(initializer)) {
      return initializer.kind === ts.SyntaxKind.TrueKeyword
    }
    if (initializer.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }

    return initializer.text;
  }

  return properties;
}
function extract_type(checker, node) {

  if (!node) return null;
  let value = null;

  // check its just a value 
  value = extract_value(checker, node);
  if (value !== null) return value;

  // check if object
  value = extract_object(checker, node);
  if (value !== null) return value;

  // check if array
  value = extract_array(checker, node);
  if (value !== null) return value;

  if (value === null) {

    // TODO this whole block is wrong! 
    // console.log(node)
    const symbol = checker.getSymbolAtLocation(node.typeName);
    if (symbol) {
      const declaredType = checker.getDeclaredTypeOfSymbol(symbol);

      if (declaredType.types) {
        return extract_array(checker, declaredType);
      }
    }

    else if (!ts.SyntaxKind[node.kind]) {
      if (node.node) {
        return extract_type(checker, node.node);
      }
    }
  }
  return value;
}
function extract_value(checker, node) {
  if (node.value) {
    return node.value;
  }
  if (node.text) {
    return node.text;
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.intrinsicName) return node.intrinsicName === "true";

  if (node.literal) { // Literal type
    return extract_value(checker, node.literal)
  }

  return null;
}
function extract_object(checker, node) {
  if (node.symbol?.members) {
    const object = {}
    node.symbol.members.forEach(member => {
      if (member.valueDeclaration) {
        object[member.valueDeclaration.name.escapedText] = extract_type(checker, member.valueDeclaration.type);
      }
    })
    return object;
  }

  return null;
}
function extract_array(checker, node) {
  let target_arr = [];
  if (node.types) {
    target_arr = node.types;
  }
  else if (node.elements) {
    target_arr = node.elements;
  }
  else {
    return null;
  }

  const array = [];
  target_arr.forEach(child => {
    array.push(extract_type(checker, child))
  });
  return array;
}

module.exports = {
  ts_extractor
}