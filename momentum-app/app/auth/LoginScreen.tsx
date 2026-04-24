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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type FormData = { email: string; password: string };

const BG = '#08080f';
const CARD = '#12121e';
const BORDER = 'rgba(255,255,255,0.07)';
const INPUT_BG = '#1a1a2e';
const INPUT_BORDER = 'rgba(255,255,255,0.1)';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#6b6b9a';
const ACCENT = '#6366f1';

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      await login(email, password);
    } catch (err: any) {
      setError('root', {
        message: err.response?.data?.message ?? 'Login failed. Please try again.',
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
          {/* Hero */}
          <View style={{ alignItems: 'center', paddingTop: 64, paddingBottom: 52 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 28,
                backgroundColor: '#1c1c32',
                borderWidth: 1,
                borderColor: 'rgba(99,102,241,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: ACCENT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 24,
                elevation: 16,
              }}
            >
              <Ionicons name="flash" size={44} color="#818cf8" />
            </View>

            <Text
              style={{
                color: TEXT_PRIMARY,
                fontSize: 42,
                fontWeight: '900',
                marginTop: 24,
                letterSpacing: -1.5,
              }}
            >
              MOMENTUM
            </Text>
            <Text
              style={{
                color: ACCENT,
                fontSize: 11,
                fontWeight: '700',
                marginTop: 6,
                letterSpacing: 4,
              }}
            >
              BUILD · EARN · DOMINATE
            </Text>
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
              Welcome back
            </Text>
            <Text style={{ color: TEXT_SECONDARY, fontSize: 14, marginBottom: 28 }}>
              Your streak is waiting for you
            </Text>

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
              rules={{ required: 'Password is required' }}
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
                      placeholder="••••••••"
                      placeholderTextColor={TEXT_SECONDARY}
                      secureTextEntry
                      autoComplete="current-password"
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
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 24, alignItems: 'center' }}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                New here?{' '}
                <Text style={{ color: '#818cf8', fontWeight: '700' }}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
