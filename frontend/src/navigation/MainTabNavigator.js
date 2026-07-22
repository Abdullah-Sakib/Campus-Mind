import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/theme";

import HomeScreen from "../screens/HomeScreen";
import RoutineScreen from "../screens/RoutineScreen";
import TasksScreen from "../screens/TasksScreen";
import GpaScreen from "../screens/GpaScreen";
import NotesScreen from "../screens/NotesScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Routine: "checkmark-done",
  Tasks: "clipboard",
  GPA: "bar-chart",
  Notes: "reader",
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardDark,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Routine" component={RoutineScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="GPA" component={GpaScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
    </Tab.Navigator>
  );
}
