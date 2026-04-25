import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TasksScreen from '../app/tasks/TasksScreen';
import BacklogScreen from '../app/tasks/BacklogScreen';

export type TasksStackParamList = {
  TasksList: undefined;
  Backlog: undefined;
};

const Stack = createNativeStackNavigator<TasksStackParamList>();

export default function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="Backlog" component={BacklogScreen} />
    </Stack.Navigator>
  );
}
