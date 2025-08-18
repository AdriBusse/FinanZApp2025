import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.finanz.authtoken';

export async function isBiometryAvailable(): Promise<boolean> {
  try {
    const t = await Keychain.getSupportedBiometryType();
    return !!t;
  } catch {
    return false;
  }
}

export async function setSecureToken(token: string): Promise<void> {
  const supportsBio = await isBiometryAvailable();
  const options: any = {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    // Android requires securityLevel to ensure hardware-backed storage when possible
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  };

  if (supportsBio) {
    // Require current enrolled biometrics to access the token
    (options as any).accessControl =
      Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
  }

  await Keychain.setGenericPassword('auth', token, options);
}

export async function getSecureTokenWithBiometric(
  prompt?: string,
): Promise<string | null> {
  try {
    const supportsBio = await isBiometryAvailable();
    if (!supportsBio) return null; // Do not retrieve without biometric capability

    const result = await Keychain.getGenericPassword({
      service: SERVICE,
      authenticationPrompt: prompt || 'Unlock to access your account',
    } as any);
    if (result) {
      return result.password;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resetSecureToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE } as any);
  } catch {}
}
