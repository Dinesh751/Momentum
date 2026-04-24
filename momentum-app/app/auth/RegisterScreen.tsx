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
    <SafeAreaView className="flex-1 bg-indigo-600">
      {/* Compact header */}
      <View className="px-6 pt-4 pb-8">
        <TouchableOpacity
          className="self-start mb-5"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="flash" size={20} color="white" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">Join Momentum</Text>
            <Text className="text-indigo-200 text-xs mt-0.5">Start your journey today</Text>
          </View>
        </View>
      </View>

      {/* Form card */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 bg-white rounded-t-3xl">
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-2xl font-bold text-gray-900">Create account</Text>
            <Text className="text-gray-400 text-sm mt-1 mb-8">
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
                <View className="mb-4">
                  <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Display Name
                  </Text>
                  <View
                    className="flex-row items-center rounded-xl px-4 py-3.5"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderWidth: 1.5,
                      borderColor: errors.displayName ? '#ef4444' : '#e2e8f0',
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={errors.displayName ? '#ef4444' : '#94a3b8'}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900 text-base"
                      placeholder="Your name"
                      placeholderTextColor="#94a3b8"
                      autoComplete="name"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {errors.displayName && (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
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
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              }}
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
                      placeholder="Min 8 characters"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      autoComplete="new-password"
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
                <Text className="text-white font-bold text-base">Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-6 items-center" onPress={() => navigation.goBack()}>
              <Text className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Text className="text-indigo-600 font-semibold">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
