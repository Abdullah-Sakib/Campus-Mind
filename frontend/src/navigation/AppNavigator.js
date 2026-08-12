import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/theme";
import { navigationRef } from "../utils/navigationRef";

import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

import AddClassScreen from "../screens/AddClassScreen";
import AddTaskScreen from "../screens/AddTaskScreen";
import AddCourseScreen from "../screens/AddCourseScreen";
import AddNoteScreen from "../screens/AddNoteScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import AddProjectScreen from "../screens/AddProjectScreen";

const RootStack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false, presentation: "modal" }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ presentation: "card" }}
      />
      <RootStack.Screen name="AddClass" component={AddClassScreen} />
      <RootStack.Screen name="AddTask" component={AddTaskScreen} />
      <RootStack.Screen name="AddCourse" component={AddCourseScreen} />
      <RootStack.Screen name="AddNote" component={AddNoteScreen} />
      <RootStack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ presentation: "card" }}
      />
      <RootStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: "card" }}
      />
      <RootStack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ presentation: "card" }}
      />
      <RootStack.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ presentation: "card" }}
      />
      <RootStack.Screen name="AddProject" component={AddProjectScreen} />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Swapping between RootNavigator and AuthNavigator mounts a completely
  // different navigator tree, which is what gives us "Android back button
  // can't return to authenticated screens after logout" for free — there's
  // no shared stack to pop back into.
  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
