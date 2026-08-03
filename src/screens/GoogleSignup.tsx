import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRoute } from '@react-navigation/native';
import Input from '../components/atoms/Input';
import RoundedButton from '../components/atoms/RoundedButton';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useAuthStore } from '../store/auth';

const GoogleSignupSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
});

type RouteParams = {
  idToken: string;
  verifiedEmail: string;
};

export default function GoogleSignup() {
  const route = useRoute<any>();
  const { idToken, verifiedEmail } = route.params as RouteParams;
  const completeGoogleSignup = useAuthStore(
    state => state.completeGoogleSignup,
  );
  const [error, setError] = React.useState<string | null>(null);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Choose your username</Text>
        <Text style={styles.description}>
          Your verified Google email is {verifiedEmail}. It remains your FinanZ
          account email.
        </Text>
        <Formik
          initialValues={{ username: '' }}
          validationSchema={GoogleSignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            try {
              await completeGoogleSignup(idToken, values.username);
            } catch (signupError: any) {
              setError(
                signupError?.message || 'Could not create your account.',
              );
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
            isValid,
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
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <RoundedButton
                title={isSubmitting ? 'Creating account...' : 'Create account'}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                fullWidth
              />
            </>
          )}
        </Formik>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 56,
    backgroundColor: '#0e0f14',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  description: { color: '#cbd5e1', lineHeight: 21, marginBottom: 24 },
  error: { color: 'crimson', marginBottom: 12 },
});
