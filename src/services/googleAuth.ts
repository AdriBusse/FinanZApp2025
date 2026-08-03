import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { googleAuthConfig } from '../config/googleAuth';

export type GoogleAuthenticationResult =
  | { type: 'success'; idToken: string }
  | { type: 'cancelled' };

let configured = false;

export const configureGoogleAuth = (): void => {
  if (configured || !googleAuthConfig.webClientId) return;

  GoogleSignin.configure({
    webClientId: googleAuthConfig.webClientId,
    offlineAccess: false,
    ...(Platform.OS === 'ios' && googleAuthConfig.iosClientId
      ? { iosClientId: googleAuthConfig.iosClientId }
      : {}),
  });
  configured = true;
};

export const authenticateWithGoogle = async (
  forceAccountSelection = false,
): Promise<GoogleAuthenticationResult> => {
  configureGoogleAuth();
  if (!configured) {
    throw new Error('Google Sign-In client IDs are not configured.');
  }

  try {
    const hasPlayServices = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    if (!hasPlayServices) {
      throw new Error('Google Play Services is unavailable or out of date.');
    }

    if (forceAccountSelection) {
      await GoogleSignin.signOut();
    }

    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) return { type: 'cancelled' };
    if (isSuccessResponse(response) && response.data.idToken) {
      return { type: 'success', idToken: response.data.idToken };
    }

    throw new Error('Google Sign-In did not return an ID token.');
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      return { type: 'cancelled' };
    }
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      throw new Error('Google Play Services is unavailable or out of date.');
    }
    throw error;
  }
};

export const signOutFromGoogle = async (): Promise<void> => {
  configureGoogleAuth();
  if (!configured) return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // FinanZ logout must still succeed if the provider sign-out fails.
  }
};
