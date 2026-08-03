/* global jest */

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-worklets', () =>
  require('./node_modules/react-native-worklets/src/mock'),
);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED: 'WHEN_UNLOCKED' },
  ACCESS_CONTROL: { BIOMETRY_CURRENT_SET: 'BIOMETRY_CURRENT_SET' },
  SECURITY_LEVEL: {
    SECURE_HARDWARE: 'SECURE_HARDWARE',
    SECURE_SOFTWARE: 'SECURE_SOFTWARE',
  },
  getSupportedBiometryType: jest.fn().mockResolvedValue(null),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn().mockResolvedValue(null),
    hasPlayServices: jest.fn().mockResolvedValue(true),
  },
  isCancelledResponse: response => response.type === 'cancelled',
  isSuccessResponse: response => response.type === 'success',
  isErrorWithCode: error =>
    typeof error === 'object' && error !== null && 'code' in error,
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('react-native-nitro-sound', () => ({
  __esModule: true,
  default: {
    startRecorder: jest.fn().mockResolvedValue('file://recording.m4a'),
    stopRecorder: jest.fn().mockResolvedValue('file://recording.m4a'),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
    stopPlayer: jest.fn().mockResolvedValue(undefined),
    removePlayBackListener: jest.fn(),
    removePlaybackEndListener: jest.fn(),
  },
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue(''),
}));

jest.mock('extract-files/isExtractableFile.mjs', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}));

jest.mock('apollo-upload-client/UploadHttpLink.mjs', () => ({
  __esModule: true,
  default: class MockUploadHttpLink {
    request() {
      return null;
    }
  },
}));
