import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type FormData = { displayName: string; email: string; password: string };

const BG = '#08080f';
const CARD = '#12121e';
const BORDER = 'rgba(255,255,255,0.07)';
const INPUT_BG = '#1a1a2e';
const INPUT_BORDER = 'rgba(255,255,255,0.1)';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#6b6b9a';
const ACCENT = '#6366f1';

export default function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async ({ email, password, displayName }: FormData) => {
    try {
      await register(email, password, displayName);
    } catch (err: any) {
      setError('root', {
        message: err.response?.data?.message ?? 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 36 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ marginBottom: 28 }}
            >
              <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: '#1c1c32',
                  borderWidth: 1,
                  borderColor: 'rgba(99,102,241,0.4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: ACCENT,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Ionicons name="flash" size={26} color="#818cf8" />
              </View>
              <View>
                <Text style={{ color: TEXT_PRIMARY, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
                  Join Momentum
                </Text>
                <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginTop: 2 }}>
                  START YOUR JOURNEY
                </Text>
              </View>
            </View>
          </View>

          {/* Form card */}
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: CARD,
              borderRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <Text style={{ color: TEXT_PRIMARY, fontSize: 24, fontWeight: '800', marginBottom: 4 }}>
              Create account
            </Text>
            <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginBottom: 28 }}>
              Fill in your details to get started
            </Text>

            {/* Display Name */}
            <Controller
              control={control}
              name="displayName"
              rules={{
                required: 'Display name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: TEXT_SECONDARY, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                    Display Name
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: INPUT_BG,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderWidth: 1.5,
                      borderColor: errors.displayName ? '#ef4444' : INPUT_BORDER,
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color={errors.displayName ? '#ef4444' : TEXT_SECONDARY} />
                    <TextInput
                      style={{ flex: 1, marginLeft: 12, color: TEXT_PRIMARY, fontSize: 16 }}
                      placeholder="Your name"
                      placeholderTextColor={TEXT_SECONDARY}
                      autoComplete="name"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.displayName && (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                      {errors.displayName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: TEXT_SECONDARY, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                    Email
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: INPUT_BG,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderWidth: 1.5,
                      borderColor: errors.email ? '#ef4444' : INPUT_BORDER,
                    }}
                  >
                    <Ionicons name="mail-outline" size={18} color={errors.email ? '#ef4444' : TEXT_SECONDARY} />
                    <TextInput
                      style={{ flex: 1, marginLeft: 12, color: TEXT_PRIMARY, fontSize: 16 }}
                      placeholder="you@example.com"
                      placeholderTextColor={TEXT_SECONDARY}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.email && (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                      {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 28 }}>
                  <Text style={{ color: TEXT_SECONDARY, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                    Password
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: INPUT_BG,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderWidth: 1.5,
                      borderColor: errors.password ? '#ef4444' : INPUT_BORDER,
                    }}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={errors.password ? '#ef4444' : TEXT_SECONDARY} />
                    <TextInput
                      style={{ flex: 1, marginLeft: 12, color: TEXT_PRIMARY, fontSize: 16 }}
                      placeholder="Min 8 characters"
                      placeholderTextColor={TEXT_SECONDARY}
                      secureTextEntry
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.password && (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 6, marginLeft: 4 }}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {errors.root && (
              <View
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>
                  {errors.root.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={{
                backgroundColor: ACCENT,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: ACCENT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 24, alignItems: 'center' }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                Already have an account?{' '}
                <Text style={{ color: '#818cf8', fontWeight: '700' }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
