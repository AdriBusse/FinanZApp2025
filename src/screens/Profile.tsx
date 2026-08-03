import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/auth';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useQuery, useMutation } from '@apollo/client/react';
import { ME_QUERY } from '../queries/auth/me';
import { CHANGE_PASSWORD } from '../queries/mutations/auth/changePassword';
import {
  LINK_GOOGLE_ACCOUNT,
  SET_PASSWORD_FOR_GOOGLE_ACCOUNT,
} from '../queries/mutations/auth/googleAuth';
import { authenticateWithGoogle } from '../services/googleAuth';

type MeData = {
  me: {
    email?: string;
    linkedProviders: string[];
    hasPassword: boolean;
  } | null;
};

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { data, refetch } = useQuery<MeData>(ME_QUERY, {
    fetchPolicy: 'cache-first',
  });
  const [expanded, setExpanded] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [changePassword, { loading }] = useMutation<{
    changePassword: boolean;
  }>(CHANGE_PASSWORD);
  const [linkGoogleAccount, { loading: linkingGoogle }] = useMutation<{
    linkGoogleAccount: boolean;
  }>(LINK_GOOGLE_ACCOUNT);
  const [setPasswordForGoogleAccount, { loading: settingPassword }] =
    useMutation<{ setPasswordForGoogleAccount: boolean }>(
      SET_PASSWORD_FOR_GOOGLE_ACCOUNT,
    );

  // Read version from package.json (Metro supports JSON require)
  const pkg = require('../../package.json');
  const version: string = pkg?.version ?? '0.0.0';

  const email = data?.me?.email ?? user?.email ?? '—';
  const linkedProviders: string[] =
    data?.me?.linkedProviders ?? user?.linkedProviders ?? [];
  const googleConnected = linkedProviders.includes('GOOGLE');
  const hasPassword = data?.me?.hasPassword ?? user?.hasPassword ?? true;

  const onSubmit = async () => {
    if (
      (hasPassword && !currentPassword) ||
      !newPassword ||
      !confirmNewPassword
    ) {
      Alert.alert('Missing fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert(
        'Passwords do not match',
        'New password and confirmation must match.',
      );
      return;
    }
    try {
      let passwordUpdated = false;
      if (hasPassword) {
        const res = await changePassword({
          variables: { currentPassword, newPassword },
        });
        passwordUpdated = Boolean(res?.data?.changePassword);
      } else {
        const authentication = await authenticateWithGoogle(true);
        if (authentication.type === 'cancelled') return;
        const res = await setPasswordForGoogleAccount({
          variables: {
            idToken: authentication.idToken,
            newPassword,
          },
        });
        passwordUpdated = Boolean(res?.data?.setPasswordForGoogleAccount);
      }

      if (passwordUpdated) {
        await refetch();
        Alert.alert(
          'Success',
          hasPassword
            ? 'Password changed successfully.'
            : 'Password set successfully.',
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setExpanded(false);
      } else {
        Alert.alert('Failed', 'Could not change password.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to change password');
    }
  };

  const onConnectGoogle = async () => {
    try {
      const authentication = await authenticateWithGoogle(true);
      if (authentication.type === 'cancelled') return;
      const result = await linkGoogleAccount({
        variables: { idToken: authentication.idToken },
      });
      if (result?.data?.linkGoogleAccount) {
        await refetch();
        Alert.alert('Connected', 'Your Google account is now connected.');
      }
    } catch (linkError: any) {
      Alert.alert(
        'Could not connect Google',
        linkError?.message || 'Google account linking failed.',
      );
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        {/* User Info Box */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Account</Text>
          <Text style={styles.boxRow}>
            Username:{' '}
            <Text style={styles.boxRowValue}>
              {user?.username ?? 'Unknown'}
            </Text>
          </Text>
          <Text style={[styles.boxRow, { marginTop: 6 }]}>
            Email: <Text style={styles.boxRowValue}>{email}</Text>
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Connected accounts</Text>
          <View style={styles.connectedRow}>
            <View>
              <Text style={styles.providerName}>Google</Text>
              <Text style={styles.providerStatus}>
                {googleConnected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
            {googleConnected ? (
              <Text style={styles.connectedBadge}>Connected</Text>
            ) : (
              <Button
                title={
                  linkingGoogle ? 'Connecting...' : 'Connect Google account'
                }
                onPress={onConnectGoogle}
                disabled={linkingGoogle}
              />
            )}
          </View>
        </View>

        {/* Change Password Box with Accordion */}
        <View style={styles.box}>
          <TouchableOpacity
            onPress={() => setExpanded(e => !e)}
            style={styles.accordionHeader}
            accessibilityRole="button"
          >
            <Text style={styles.accordionTitle}>
              {hasPassword ? 'Change Password' : 'Set Password'}
            </Text>
            <Text style={styles.accordionChevron}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expanded && (
            <View style={styles.accordionBody}>
              {hasPassword ? (
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  placeholderTextColor="#7c8591"
                  secureTextEntry
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.reauthenticationHint}>
                  Google will ask you to verify the connected account before the
                  password is set.
                </Text>
              )}
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="#7c8591"
                secureTextEntry
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#7c8591"
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={{ height: 8 }} />
              <Button
                title={
                  loading || settingPassword
                    ? 'Updating...'
                    : hasPassword
                    ? 'Update Password'
                    : 'Set Password'
                }
                onPress={onSubmit}
                disabled={loading || settingPassword}
              />
            </View>
          )}
        </View>

        {/* Logout Box */}
        <View style={styles.box}>
          <Button title="Logout" onPress={() => logout()} />
        </View>

        <Text style={styles.version}>App version: {version}</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0e0f14' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666' },
  version: { marginTop: 4, color: '#888' },
  box: {
    backgroundColor: '#1e212b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  boxTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  boxRow: { color: '#94a3b8' },
  boxRowValue: { color: '#f8fafc', fontWeight: '700' },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accordionTitle: { fontSize: 16, fontWeight: '600' },
  accordionChevron: { fontSize: 16, color: '#666' },
  accordionBody: { paddingTop: 12 },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerName: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  providerStatus: { color: '#94a3b8', marginTop: 3 },
  connectedBadge: { color: '#86efac', fontWeight: '700' },
  reauthenticationHint: { color: '#cbd5e1', lineHeight: 20, marginBottom: 12 },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2b2f3a',
    borderRadius: 8,
    marginBottom: 10,
    color: '#f8fafc',
    backgroundColor: '#0e0f14',
  },
});
