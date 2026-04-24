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
    <SafeAreaView className="flex-1 bg-indigo-600">
      {/* Hero */}
      <View className="items-center px-6 pt-6 pb-10">
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Ionicons name="flash" size={32} color="white" />
        </View>
        <Text className="text-4xl font-bold text-white tracking-tight">Momentum</Text>
        <Text className="text-indigo-200 text-sm mt-1">Build habits. Earn your streak.</Text>
      </View>

      {/* Form card */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 bg-white rounded-t-3xl">
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-2xl font-bold text-gray-900">Welcome back</Text>
            <Text className="text-gray-400 text-sm mt-1 mb-8">
              Sign in to continue your streak
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
                <View className="mb-4">
                  <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Email
                  </Text>
                  <View
                    className="flex-row items-center rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderWidth: 1.5,
                      borderColor: errors.email ? '#ef4444' : '#e2e8f0',
                    }}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={errors.email ? '#ef4444' : '#94a3b8'}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900 text-base"
                      placeholder="you@example.com"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.email && (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</Text>
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
                <View className="mb-7">
                  <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Password
                  </Text>
                  <View
                    className="flex-row items-center rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderWidth: 1.5,
                      borderColor: errors.password ? '#ef4444' : '#e2e8f0',
                    }}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={errors.password ? '#ef4444' : '#94a3b8'}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900 text-base"
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      autoComplete="current-password"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</Text>
                  )}
                </View>
              )}
            />

            {errors.root && (
              <View
                className="rounded-xl px-4 py-3 mb-5"
                style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}
              >
                <Text className="text-red-600 text-sm text-center">{errors.root.message}</Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-indigo-600 rounded-xl py-4 items-center"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-6 items-center"
              onPress={() => navigation.navigate('Register')}
            >
              <Text className="text-gray-400 text-sm">
                New here?{' '}
                <Text className="text-indigo-600 font-semibold">Create an account</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
