module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  rules: {
    // Show Prettier formatting issues as warnings (not errors)
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto' // helps avoid CRLF/LF issues across OSes
      }
    ]
  }
};