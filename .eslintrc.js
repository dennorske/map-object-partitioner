/* eslint-disable */
"use strict";

module.exports = {
  "env": {
    "es6": true,
    "browser": true,
  },
  "rules": {
    //////// POSSIBLE ERRORS ////////

    "comma-dangle": [ 1, "always-multiline" ],
    "no-cond-assign": [ 2, "except-parens" ],
    "no-constant-condition": 1,
    "no-debugger": 2,
    "no-dupe-args": 2,
    "no-dupe-keys": 2,
    "no-duplicate-case": 2,
    "no-empty-character-class": 1,
    "no-extra-boolean-cast": 1,
    "no-extra-semi": 1,
    "no-func-assign": 2,
    "no-inner-declarations": 2,
    "no-invalid-regexp": 1,
    "no-irregular-whitespace": 2,
    "no-negated-in-lhs": 2,
    "no-obj-calls": 2,
    "no-sparse-arrays": 2,
    "no-unexpected-multiline": 2,
    "no-unreachable": 1,
    "use-isnan": 2,
    "valid-typeof": 2,

    //////// BEST PRACTICES ////////

    "array-callback-return": 1,
    "dot-location": [ 1, "property" ],
    "dot-notation": [ 1, { "allowKeywords": true } ],
    "eqeqeq": [ 2, "allow-null" ],
    "no-alert": 2,
    "no-caller": 2,
    "no-case-declarations": 1,
    "no-empty-pattern": 1,
    "no-eval": 2,
    "no-extend-native": 1,
    "no-extra-bind": 1,
    "no-extra-label": 1,
    "no-fallthrough": 1,
    "no-floating-decimal": 1,
    "no-implicit-coercion": 1,
    "no-implied-eval": 2,
    "no-iterator": 1,
    "no-lone-blocks": 1,
    "no-loop-func": 0,
    "no-multi-spaces": 0,
    "no-multi-str": 2,
    "no-native-reassign": 2,
    "no-new": 2,
    "no-new-func": 2,
    "no-new-wrappers": 2,
    "no-octal": 1,
    "no-octal-escape": 1,
    "no-proto": 2,
    "no-redeclare": 1,
    "no-return-assign": 2,
    "no-self-assign": 2,
    "no-self-compare": 1,
    "no-sequences": 1,
    "no-unmodified-loop-condition": 1,
    "no-unused-expressions": 1,
    "no-unused-labels": 1,
    "no-useless-call": 1,
    "no-useless-concat": 1,
    "no-void": 2,
    "no-warning-comments": 1,
    "no-with": 2,
    "wrap-iife": [ 1, "inside" ],
    "yoda": [ 1, "never" ],

    //////// STRICT ////////

    "strict": [ 1, "global" ],

    //////// VARIABLES ////////

    "no-catch-shadow": 1,
    "no-delete-var": 2,
    "no-label-var": 2,
    "no-shadow-restricted-names": 2,
    "no-undef": 2,
    "no-unused-vars": [ 1, { "vars": "local", "args": "none" } ],

    //////// NODE.JS AND COMMONJS ////////

    "handle-callback-err": 1,
    "no-new-require": 2,
    "no-sync": 1,

    //////// STYLISTIC ISSUES ////////

    "array-bracket-spacing": [ 1, "always" ],
    "block-spacing": [ 1, "always" ],
    "brace-style": [ 1, "1tbs", { "allowSingleLine": true } ],
    "comma-spacing": [ 1, { "before": false, "after": true } ],
    "comma-style": [ 1, "last" ],
    "computed-property-spacing": [ 1, "never" ],
    "func-style": 0,
    "indent": [ 1, 2, { "SwitchCase": 1 } ],
    "jsx-quotes": [ 1, "prefer-double" ],
    "key-spacing": [ 1, { "beforeColon": false, "afterColon": true, "mode": "minimum" } ],
    "keyword-spacing": [ 1, {
      "before": true,
      "after": true,
      "overrides": {
        "if": { "after": false },
        "for": { "after": false },
        "catch": { "after": false },
        "switch": { "after": false },
      },
    } ],
    "linebreak-style": [ 1, "unix" ],
    "max-len": [ 1, 200, 2 ],
    "new-parens": 2,
    "no-array-constructor": 2,
    "no-lonely-if": 1,
    "no-mixed-spaces-and-tabs": 1,
    "no-multiple-empty-lines": 0,
    "no-nested-ternary": 2,
    "no-new-object": 2,
    "no-spaced-func": 1,
    "no-trailing-spaces": 1,
    "no-unneeded-ternary": 1,
    "no-whitespace-before-property": 1,
    "object-curly-spacing": [ 1, "always" ],
    "operator-linebreak": [ 1, "after" ],
    "padded-blocks": [ 1, "never" ],
    "quote-props": [ 1, "consistent" ],
    "quotes": [ 1, "single", "avoid-escape" ],
    "semi": [ 2, "always" ],
    "semi-spacing": [ 1, { "before": false, "after": true } ],
    "space-before-blocks": [ 1, "always" ],
    "space-before-function-paren": [ 1, "never" ],
    "space-in-parens": [ 1, "never" ],
    "space-infix-ops": 1,
    "space-unary-ops": [ 1, { "words": true, "nonwords": false } ],
    "spaced-comment": [ 1, "always" ],

    //////// ECMASCRIPT 6 ////////

    "arrow-body-style": [ 1, "as-needed" ],
    "arrow-parens": [ 2, "always" ],
    "arrow-spacing": [ 1, { "before": true, "after": true } ],
    "constructor-super": 2,
    "generator-star-spacing": [ 1, { "before": true, "after": false } ],
    "no-class-assign": 2,
    "no-const-assign": 2,
    "no-dupe-class-members": 2,
    "no-new-symbol": 2,
    "no-this-before-super": 2,
    "no-useless-constructor": 1,
    "no-var": 2,
    "object-shorthand": [ 1, "always" ],
    "prefer-const": 0,
    "prefer-rest-params": 2,
    "prefer-spread": 1,
    "template-curly-spacing": 2,
    "yield-star-spacing": [ 1, { "before": false, "after": true } ],
  },
};
