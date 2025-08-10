import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Input from '../components/atoms/Input';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../store/auth';
import RoundedButton from '../components/atoms/RoundedButton';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().min(4, 'Too short').required('Password is required'),
});

export default function LoginScreen() {
  const { login, initFromStorage, isInitializing } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  if (isInitializing) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
      <Text style={styles.title}>FinanZ Login</Text>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setError(null);
          try {
            await login(values.username, values.password);
          } catch (e: any) {
            setError(e?.message || 'Login failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <Input
              placeholder="Username"
              autoCapitalize="none"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {touched.username && errors.username ? (
              <Text style={styles.error}>{errors.username}</Text>
            ) : null}

            <Input
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password ? (
              <Text style={styles.error}>{errors.password}</Text>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <RoundedButton
              title={isSubmitting ? 'Logging in...' : 'Login'}
              onPress={() => handleSubmit()}
              loading={isSubmitting}
              fullWidth
              style={{ marginTop: 8 }}
            />

            <View style={styles.linkRow}>
              <Text style={styles.linkHint}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56 },
  containerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: { color: 'crimson', marginBottom: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  linkHint: { color: '#cbd5e1' },
  link: { color: '#2e7d32', fontWeight: '700' },
});
