import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

import AddClassScreen from '../screens/AddClassScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import AddCourseScreen from '../screens/AddCourseScreen';
import AddNoteScreen from '../screens/AddNoteScreen';

const RootStack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} options={{ presentation: 'card' }} />
      <RootStack.Screen name="AddClass" component={AddClassScreen} />
      <RootStack.Screen name="AddTask" component={AddTaskScreen} />
      <RootStack.Screen name="AddCourse" component={AddCourseScreen} />
      <RootStack.Screen name="AddNote" component={AddNoteScreen} />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
