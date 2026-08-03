import appConfig from '../../app.json';

export const googleAuthConfig = {
  webClientId: appConfig.googleAuth.webClientId,
  iosClientId: appConfig.googleAuth.iosClientId,
};
