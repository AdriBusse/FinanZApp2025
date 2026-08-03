module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-native-.*|@react-native(-community)?|@react-navigation|gifted-charts-core|extract-files|apollo-upload-client)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
