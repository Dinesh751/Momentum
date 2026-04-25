import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import userService from '../../services/userService';
import { UserProfile } from '../../types';

// ---------------------------------------------------------------------------
// Change Password sheet
// ---------------------------------------------------------------------------

function ChangePasswordSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCurrent(''); setNext(''); setConfirm('');
    setShowCurrent(false); setShowNext(false); setShowConfirm(false);
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!current.trim()) { setError('Enter your current password'); return; }
    if (next.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (next !== confirm) { setError('Passwords do not match'); return; }
    setSaving(true);
    setError(null);
    try {
      await userService.changePassword(current, next);
      handleClose();
      Alert.alert('Password updated', 'Your password has been changed successfully.');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(msg ?? 'Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({
    label, value, onChange, show, onToggleShow,
  }: {
    label: string; value: string; onChange: (v: string) => void;
    show: boolean; onToggleShow: () => void;
  }) => (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{
          backgroundColor: '#f8fafc',
          borderWidth: 1.5,
          borderColor: '#e2e8f0',
          height: 48,
        }}
      >
        <TextInput
          style={{ flex: 1, color: '#111827', fontSize: 15 }}
          value={value}
          onChangeText={(t) => { onChange(t); setError(null); }}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={onToggleShow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            className="bg-white rounded-t-3xl px-6 pt-4"
            style={{ paddingBottom: 36 }}
            onStartShouldSetResponder={() => true}
          >
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">Change Password</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <PasswordField
              label="Current Password"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
            />
            <PasswordField
              label="New Password"
              value={next}
              onChange={setNext}
              show={showNext}
              onToggleShow={() => setShowNext((v) => !v)}
            />
            <PasswordField
              label="Confirm New Password"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
            />

            {error && (
              <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
            )}

            <TouchableOpacity
              className="bg-indigo-600 rounded-xl py-4 items-center"
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-bold text-base">Update Password</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Settings row
// ---------------------------------------------------------------------------

function SettingsRow({
  icon, label, value, onPress, destructive = false, hideChevron = false,
}: {
  icon: string; label: string; value?: string;
  onPress?: () => void; destructive?: boolean; hideChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      className="flex-row items-center px-4 py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
    >
      <View
        className="w-8 h-8 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: destructive ? '#fef2f2' : '#f1f5f9' }}
      >
        <Ionicons
          name={icon as any}
          size={17}
          color={destructive ? '#ef4444' : '#6b7280'}
        />
      </View>
      <Text
        className="flex-1 text-sm font-medium"
        style={{ color: destructive ? '#ef4444' : '#111827' }}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-sm text-gray-400 mr-2">{value}</Text>
      )}
      {!hideChevron && onPress && (
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 pt-6 pb-2">
      {title}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Inline display name edit
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [passwordSheetVisible, setPasswordSheetVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    userService.getProfile()
      .then((p) => setProfile(p))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const displayName = profile?.displayName ?? user?.displayName ?? '';
  const email = profile?.email ?? user?.email ?? '';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const openEditName = () => {
    setEditName(displayName);
    setNameError(null);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) { setNameError('Name cannot be empty'); return; }
    if (editName.trim() === displayName) { setIsEditingName(false); return; }
    setNameSaving(true);
    setNameError(null);
    try {
      const updated = await userService.updateProfile({ displayName: editName.trim() });
      setProfile((prev) => prev ? { ...prev, displayName: updated.displayName } : null);
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, displayName: updated.displayName } : null,
      }));
      setIsEditingName(false);
    } catch {
      setNameError('Failed to save. Please try again.');
    } finally {
      setNameSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              await logout();
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white"
        style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#f8fafc' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="close" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-gray-900">Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile avatar card */}
        <View className="items-center pt-8 pb-6">
          {profileLoading ? (
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              style={{ backgroundColor: '#eef2ff' }}
            >
              <ActivityIndicator color="#4f46e5" />
            </View>
          ) : (
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              style={{ backgroundColor: '#4f46e5' }}
            >
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
                {initials || '?'}
              </Text>
            </View>
          )}
          <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
          <Text className="text-sm text-gray-400 mt-0.5">{email}</Text>
          {profile?.lifetimePoints !== undefined && (
            <View
              className="flex-row items-center mt-3 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#eef2ff', gap: 5 }}
            >
              <Ionicons name="star" size={13} color="#4f46e5" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}>
                {profile.lifetimePoints.toLocaleString()} lifetime pts
              </Text>
            </View>
          )}
        </View>

        {/* Profile section */}
        <SectionHeader title="Profile" />
        <View className="bg-white rounded-2xl mx-4" style={{ overflow: 'hidden' }}>
          {/* Display name row — inline editable */}
          <View
            className="flex-row items-center px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
          >
            <View
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#f1f5f9' }}
            >
              <Ionicons name="person-outline" size={17} color="#6b7280" />
            </View>
            <Text className="text-sm font-medium text-gray-900 mr-3" style={{ width: 90 }}>
              Display Name
            </Text>
            {isEditingName ? (
              <View className="flex-1 flex-row items-center" style={{ gap: 8 }}>
                <View
                  className="flex-1 rounded-xl px-3"
                  style={{
                    backgroundColor: '#f8fafc',
                    borderWidth: 1.5,
                    borderColor: nameError ? '#ef4444' : '#6366f1',
                    height: 36,
                    justifyContent: 'center',
                  }}
                >
                  <TextInput
                    style={{ color: '#111827', fontSize: 14 }}
                    value={editName}
                    onChangeText={(t) => { setEditName(t); setNameError(null); }}
                    autoFocus
                    maxLength={50}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSaveName}
                  disabled={nameSaving}
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#eef2ff' }}
                >
                  {nameSaving
                    ? <ActivityIndicator size="small" color="#4f46e5" />
                    : <Ionicons name="checkmark" size={16} color="#4f46e5" />
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsEditingName(false)}
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#f1f5f9' }}
                >
                  <Ionicons name="close" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-between"
                onPress={openEditName}
                activeOpacity={0.6}
              >
                <Text className="text-sm text-gray-500">{displayName}</Text>
                <Ionicons name="pencil-outline" size={15} color="#d1d5db" />
              </TouchableOpacity>
            )}
          </View>
          {nameError && (
            <Text className="text-red-500 text-xs px-4 pb-2 ml-11">{nameError}</Text>
          )}

          {/* Email row — read only */}
          <View className="flex-row items-center px-4 py-4">
            <View
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#f1f5f9' }}
            >
              <Ionicons name="mail-outline" size={17} color="#6b7280" />
            </View>
            <Text className="text-sm font-medium text-gray-900 mr-3" style={{ width: 90 }}>
              Email
            </Text>
            <Text className="flex-1 text-sm text-gray-400" numberOfLines={1}>{email}</Text>
          </View>
        </View>

        {/* Account section */}
        <SectionHeader title="Account" />
        <View className="bg-white rounded-2xl mx-4" style={{ overflow: 'hidden' }}>
          <SettingsRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => setPasswordSheetVisible(true)}
          />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        {/* Logout */}
        <View className="mx-4 mt-8">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            className="rounded-2xl py-4 items-center flex-row justify-center"
            style={{ backgroundColor: '#fef2f2', gap: 8 }}
          >
            {loggingOut
              ? <ActivityIndicator color="#ef4444" />
              : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                  <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 15 }}>
                    Log Out
                  </Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>

      </ScrollView>

      <ChangePasswordSheet
        visible={passwordSheetVisible}
        onClose={() => setPasswordSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
