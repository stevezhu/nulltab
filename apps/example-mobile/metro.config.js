const { makeMetroConfig } = require('@rnx-kit/metro-config');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const { createTsResolveRequest } = require('@stzhu/metro-ts-resolver');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(
  makeMetroConfig({
    ...config,
    resolver: {
      ...config.resolver,
      resolveRequest: createTsResolveRequest({
        projectDir: __dirname,
      }),
    },
  }),
);
