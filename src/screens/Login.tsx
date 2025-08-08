import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../store/auth';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().min(4, 'Too short').required('Password is required'),
});

export default function LoginScreen() {
  const { login, initFromStorage, isInitializing } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

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
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Username"
              autoCapitalize="none"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {touched.username && errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title={isSubmitting ? 'Logging in...' : 'Login'} onPress={() => handleSubmit()} disabled={isSubmitting} />
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56 },
  containerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: 'crimson', marginBottom: 12 },
});
