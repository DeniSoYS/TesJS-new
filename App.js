import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from './firebaseConfig';
import MoveDetailScreen from './screens/MoveDetailScreen';

// ИМПОРТЫ РАБОЧИХ ЭКРАНОВ
import AddEventScreen from './screens/AddEventScreen';
import AddReminderScreen from './screens/AddReminderScreen';
import AddSickLeaveScreen from './screens/AddSickLeaveScreen';
import AddTourScreen from './screens/AddTourScreen';
import CalendarScreen from './screens/CalendarScreen';
import ConcertDetailScreen from './screens/ConcertDetailScreen';
import EmployeesListScreen from './screens/EmployeesListScreen';
import LoginScreen from './screens/LoginScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import RemindersScreen from './screens/RemindersScreen';
import SickLeaveScreen from './screens/SickLeaveScreen';
import TourDetailScreen from './screens/TourDetailScreen';
// В разделе импортов добавьте:
import AddMoveScreen from './screens/AddMoveScreen';
// ИМПОРТ SPLASH SCREEN
import SplashScreen from './components/SplashScreen';

// ✅ ВРЕМЕННЫЕ ПРОСТЫЕ КОМПОНЕНТЫ
const SimpleMoveDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
    <Text>Move Detail Screen - Работает!</Text>
  </View>
);

const SimpleAddTourScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
    <Text>Add Tour Screen - Работает!</Text>
  </View>
);

const SimpleAddMoveScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
    <Text>Add Move Screen - Работает!</Text>
  </View>
);

const SimpleTourDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
    <Text>Tour Detail Screen - Работает!</Text>
  </View>
);

// ✅ НАСТРОЙКА ОБРАБОТЧИКА УВЕДОМЛЕНИЙ
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Пользователь нажал на уведомление:', response);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role || 'user';
            setUserRole(role);
          } else {
            setUserRole('user');
          }
        } catch (error) {
          console.error('❌ Ошибка получения роли:', error);
          setUserRole('user');
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen 
              name="Calendar" 
              component={CalendarScreen}
              initialParams={{ email: user.email, role: userRole }}
            />
            <Stack.Screen name="AddEvent" component={AddEventScreen} />
            <Stack.Screen name="ConcertDetail" component={ConcertDetailScreen} />
            <Stack.Screen name="MyEvents" component={MyEventsScreen} />
            <Stack.Screen name="SickLeave" component={SickLeaveScreen} />
            <Stack.Screen name="AddSickLeave" component={AddSickLeaveScreen} />
            <Stack.Screen name="EmployeesList" component={EmployeesListScreen} />
            
            {/* ✅ ИСПОЛЬЗУЕМ ПРОСТЫЕ КОМПОНЕНТЫ */}
            <Stack.Screen name="AddTour" component={AddTourScreen} />
           <Stack.Screen name="AddMove" component={AddMoveScreen} />
           <Stack.Screen name="TourDetail" component={TourDetailScreen} />
           <Stack.Screen name="MoveDetail" component={MoveDetailScreen} />
            
            <Stack.Screen 
              name="Reminders" 
              component={RemindersScreen}
              options={({ navigation }) => ({
                headerShown: true,
                title: 'Напоминания',
                headerStyle: { backgroundColor: '#FFD700' },
                headerTintColor: '#3E2723',
                headerTitleStyle: { fontWeight: 'bold' },
                headerRight: () => 
                  userRole === 'admin' ? (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => navigation.navigate('AddReminder')}
                    >
                      <Ionicons name="add" size={28} color="#3E2723" />
                    </TouchableOpacity>
                  ) : null,
              })}
            />
            <Stack.Screen 
              name="AddReminder" 
              component={AddReminderScreen}
              initialParams={{ userRole: userRole }} // ✅ ДОБАВЬТЕ ЭТУ СТРОКУ
              options={{
                headerShown: true,
                title: 'Новое напоминание',
                headerStyle: { backgroundColor: '#FFD700' },
                headerTintColor: '#3E2723',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
    marginRight: 15,
  },
});
