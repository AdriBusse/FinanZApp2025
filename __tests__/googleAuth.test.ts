jest.mock('../src/config/googleAuth', () => ({
  googleAuthConfig: {
    webClientId: 'web-client.apps.googleusercontent.com',
    iosClientId: 'ios-client.apps.googleusercontent.com',
  },
}));

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  authenticateWithGoogle,
  configureGoogleAuth,
} from '../src/services/googleAuth';

const mockSignIn = GoogleSignin.signIn as jest.Mock;
const mockSignOut = GoogleSignin.signOut as jest.Mock;
const mockHasPlayServices = GoogleSignin.hasPlayServices as jest.Mock;

describe('Google auth adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(null);
    mockHasPlayServices.mockResolvedValue(true);
    configureGoogleAuth();
  });

  it('extracts an ID token from a successful authentication', async () => {
    mockSignIn.mockResolvedValue({
      type: 'success',
      data: { idToken: 'google-id-token' },
    });

    await expect(authenticateWithGoogle()).resolves.toEqual({
      type: 'success',
      idToken: 'google-id-token',
    });
  });

  it('returns cancellation without an error', async () => {
    mockSignIn.mockResolvedValue({ type: 'cancelled', data: null });

    await expect(authenticateWithGoogle()).resolves.toEqual({
      type: 'cancelled',
    });
  });

  it('reports unavailable Google Play Services', async () => {
    mockHasPlayServices.mockRejectedValue({
      code: 'PLAY_SERVICES_NOT_AVAILABLE',
    });

    await expect(authenticateWithGoogle()).rejects.toThrow(
      'Google Play Services is unavailable or out of date.',
    );
  });

  it('signs out before a fresh account-selection flow', async () => {
    mockSignIn.mockResolvedValue({
      type: 'success',
      data: { idToken: 'fresh-token' },
    });

    await authenticateWithGoogle(true);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });
});
