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
  const base: any = {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  };

  // Prefer strongest security level first
  const optionVariants: any[] = [
    { ...base, securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE },
    { ...base, securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE },
    { ...base },
  ];

  if (supportsBio) {
    optionVariants.forEach(o => {
      o.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET;
    });
  }

  // Try fallbacks without failing login flow
  for (const opts of optionVariants) {
    try {
      await Keychain.setGenericPassword('auth', token, opts);
      return;
    } catch {
      // try next option
    }
  }
}

export async function getSecureTokenWithBiometric(
  prompt?: string,
): Promise<string | null> {
  try {
    const supportsBio = await isBiometryAvailable();
    const options: any = supportsBio
      ? {
          service: SERVICE,
          authenticationPrompt: prompt || 'Unlock to access your account',
        }
      : { service: SERVICE };

    const result = await Keychain.getGenericPassword(options);
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
