const fs = require('fs');
const path = require('path');

function parseDotenv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return env;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return env;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      const quote = value[0];

      if (
        (quote === '"' || quote === "'") &&
        value[value.length - 1] === quote
      ) {
        value = value.slice(1, -1);
      }

      if (key) env[key] = value;
      return env;
    }, {});
}

const env = {
  ...parseDotenv(path.resolve(__dirname, '.env')),
  ...process.env,
};

function inlineEnvImports({ types: t }) {
  return {
    name: 'inline-env-imports',
    visitor: {
      ImportDeclaration(importPath) {
        if (importPath.node.source.value !== '@env') return;

        const declarations = importPath.node.specifiers.map(specifier => {
          if (!t.isImportSpecifier(specifier)) {
            throw importPath.buildCodeFrameError(
              'Only named imports are supported from @env.',
            );
          }

          const importedName = specifier.imported.name;
          const localName = specifier.local.name;
          const value = env[importedName];

          if (value === undefined) {
            throw importPath.buildCodeFrameError(
              `Missing environment variable: ${importedName}`,
            );
          }

          return t.variableDeclaration('const', [
            t.variableDeclarator(
              t.identifier(localName),
              t.stringLiteral(value),
            ),
          ]);
        });

        importPath.replaceWithMultiple(declarations);
      },
    },
  };
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [inlineEnvImports, 'react-native-worklets/plugin'],
};
