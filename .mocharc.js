module.exports = {
  // TODO: Remove the `exit` setting, it can hide broken tests.
  exit: true,
  spec: [
    './app/scripts/metamask-controller.test.js',
  ],
  recursive: true,
  require: ['test/env.js', 'test/setup.js'],
};
