module.exports = {
  "env": {
    "node": true,
    "mocha": true,
    "jest": true
  },
  "extends": [ "airbnb" ],
  "rules": {
    "import/no-extraneous-dependencies": 0,
		"no-plusplus": [2, { "allowForLoopAfterthoughts": true }]
  },
  "parserOptions": {
      "sourceType": "module"
  }
}
