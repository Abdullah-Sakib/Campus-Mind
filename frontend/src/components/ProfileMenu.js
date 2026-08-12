import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, fonts } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = [
  { key: 'Profile', label: 'Profile', icon: 'person-outline', screen: 'Profile' },
  { key: 'Documents', label: 'Important Documents', icon: 'document-text-outline', screen: 'Documents' },
  { key: 'Projects', label: 'Projects', icon: 'briefcase-outline', screen: 'Projects' },
];

export default function ProfileMenu({ visible, onClose }) {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleNavigate = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    onClose();
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menuWrap} pointerEvents="box-none">
          <Pressable style={styles.menu} onPress={() => {}}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screen)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={20} color={colors.textPrimary} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color={colors.urgentText} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: colors.urgentText }]}>Logout</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuWrap: {
    position: 'absolute',
    top: 56,
    right: spacing.md,
    left: spacing.md,
    alignItems: 'flex-end',
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 230,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  menuIcon: { marginRight: spacing.sm },
  menuLabel: { ...fonts.body, fontWeight: '600', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
