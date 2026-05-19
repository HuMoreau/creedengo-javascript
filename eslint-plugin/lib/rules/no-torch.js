/*
 * creedengo JavaScript plugin - Provides rules to reduce the environmental footprint of your JavaScript programs
 * Copyright © 2023 Green Code Initiative (https://green-code-initiative.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const reactNativeTorchLibrary = "react-native-torch";

function getPropertyName(prop) {
  if (prop.key.type === "Identifier") return prop.key.name;
  if (prop.key.type === "Literal") return String(prop.key.value);
  return null;
}

function findProperty(objectExpression, name) {
  return objectExpression.properties.find(
    (p) => p.type === "Property" && getPropertyName(p) === name
  );
}

function objectHasTorchProperty(objectExpression) {
  return Boolean(findProperty(objectExpression, "torch"));
}

function advancedArrayHasTorch(arrayExpression) {
  return arrayExpression.elements.some(
    (el) => el && el.type === "ObjectExpression" && objectHasTorchProperty(el)
  );
}

function constraintsArgUsesTorchInAdvanced(arg) {
  if (arg.type !== "ObjectExpression") return false;
  const advancedProp = findProperty(arg, "advanced");
  if (!advancedProp || advancedProp.value.type !== "ArrayExpression") return false;
  return advancedArrayHasTorch(advancedProp.value);
}

function isApplyConstraintsCall(node) {
  const { callee } = node;
  if (callee.type !== "MemberExpression") return false;
  const methodName = callee.computed
    ? callee.property.type === "Literal" && callee.property.value
    : callee.property.name;
  return methodName === "applyConstraints" && node.arguments.length > 0;
}

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Should not programmatically enable torch mode",
      category: "eco-design",
      recommended: "warn",
    },
    messages: {
      ShouldNotProgrammaticallyEnablingTorchMode:
        "You should not programmatically enable torch mode",
    },
    schema: [],
  },
  create: function (context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === reactNativeTorchLibrary) {
          context.report({
            node,
            messageId: "ShouldNotProgrammaticallyEnablingTorchMode",
          });
        }
      },

      CallExpression(node) {
        if (
          isApplyConstraintsCall(node) &&
          constraintsArgUsesTorchInAdvanced(node.arguments[0])
        ) {
          context.report({
            node,
            messageId: "ShouldNotProgrammaticallyEnablingTorchMode",
          });
        }
      },
    };
  },
};
