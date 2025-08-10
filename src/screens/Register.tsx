import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import Input from '../components/atoms/Input';
import RoundedButton from '../components/atoms/RoundedButton';
import { SIGNUP_MUTATION } from '../graphql/auth';

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [error, setError] = useState<string | null>(null);
  const [signup, { loading }] = useMutation(SIGNUP_MUTATION);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Create an account</Text>
        <Formik
          initialValues={{ username: '', email: '', password: '' }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            try {
              await signup({ variables: { data: values } });
              // On success, go to Login so user can sign in
              navigation.navigate('Login');
            } catch (e: any) {
              setError(e?.message || 'Signup failed');
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
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
              />
              {touched.username && errors.username ? (
                <Text style={styles.error}>{errors.username}</Text>
              ) : null}

              <Input
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
              />
              {touched.email && errors.email ? (
                <Text style={styles.error}>{errors.email}</Text>
              ) : null}

              <Input
                placeholder="Password"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              {touched.password && errors.password ? (
                <Text style={styles.error}>{errors.password}</Text>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <RoundedButton
                title={isSubmitting || loading ? 'Signing up...' : 'Sign up'}
                onPress={() => handleSubmit()}
                loading={isSubmitting || loading}
                fullWidth
                style={{ marginTop: 8 }}
              />

              <View style={styles.linkRow}>
                <Text style={styles.linkHint}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.link}> Log in</Text>
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
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#fff' },
  error: { color: 'crimson', marginBottom: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  linkHint: { color: '#cbd5e1' },
  link: { color: '#2e7d32', fontWeight: '700' },
});
