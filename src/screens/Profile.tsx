import React from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/auth';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useQuery, useMutation } from '@apollo/client';
import { ME_QUERY, CHANGE_PASSWORD_MUTATION } from '../graphql/auth';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const { data } = useQuery(ME_QUERY, { fetchPolicy: 'cache-first' });
  const [expanded, setExpanded] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);

  // Read version from package.json (Metro supports JSON require)
  const pkg = require('../../package.json');
  const version: string = pkg?.version ?? '0.0.0';

  const email = data?.me?.email ?? user?.email ?? '—';

  const onSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Missing fields', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Passwords do not match', 'New password and confirmation must match.');
      return;
    }
    try {
      const res = await changePassword({ variables: { currentPassword, newPassword } });
      if (res?.data?.changePassword) {
        Alert.alert('Success', 'Password changed successfully.');
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

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        {/* User Info Box */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Account</Text>
          <Text style={styles.boxRow}>Username: <Text style={styles.boxRowValue}>{user?.username ?? 'Unknown'}</Text></Text>
          <Text style={[styles.boxRow, { marginTop: 6 }]}>Email: <Text style={styles.boxRowValue}>{email}</Text></Text>
        </View>

        {/* Change Password Box with Accordion */}
        <View style={styles.box}>
          <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.accordionHeader} accessibilityRole="button">
            <Text style={styles.accordionTitle}>Change Password</Text>
            <Text style={styles.accordionChevron}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expanded && (
            <View style={styles.accordionBody}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor="#7c8591"
                secureTextEntry
                autoCapitalize="none"
              />
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
              <Button title={loading ? 'Updating...' : 'Update Password'} onPress={onSubmit} disabled={loading} />
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
  boxTitle: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', marginBottom: 8 },
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
