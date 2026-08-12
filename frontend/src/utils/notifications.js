import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// How the app should present a notification while it's in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = 'task-deadlines';

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Task Deadlines',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5A4FE0',
    });
  }

  // Physical devices / emulators with Google Play services support local
  // notifications without any extra permission dance beyond this request.
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

const identifierForTask = (taskId, kind) => `task-${taskId}-${kind}`;

// Schedules "due tomorrow" and "due today" local notifications for a task,
// cancelling any previously-scheduled ones for the same task first so we
// never end up with duplicates (e.g. after editing the due date).
async function scheduleForTask(task) {
  const dueDate = new Date(task.dueDate);
  if (isNaN(dueDate.getTime())) return;

  await Notifications.cancelScheduledNotificationAsync(identifierForTask(task._id, 'tomorrow')).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(identifierForTask(task._id, 'today')).catch(() => {});

  if (task.status === 'submitted') return; // no need to remind about finished work

  const now = new Date();

  // "Due tomorrow" reminder — fires at 6:00 PM the day before the deadline
  const tomorrowTrigger = new Date(dueDate);
  tomorrowTrigger.setDate(tomorrowTrigger.getDate() - 1);
  tomorrowTrigger.setHours(18, 0, 0, 0);

  if (tomorrowTrigger > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: identifierForTask(task._id, 'tomorrow'),
      content: {
        title: `Task: ${task.title}`,
        body: `Deadline: Tomorrow, ${formatTime(dueDate)}`,
        data: { taskId: task._id, screen: 'Tasks' },
      },
      trigger: tomorrowTrigger,
    });
  }

  // "Due today" reminder — fires at 9:00 AM on the day of the deadline
  const todayTrigger = new Date(dueDate);
  todayTrigger.setHours(9, 0, 0, 0);

  if (todayTrigger > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: identifierForTask(task._id, 'today'),
      content: {
        title: `Task: ${task.title}`,
        body: `Deadline: Today, ${formatTime(dueDate)}`,
        data: { taskId: task._id, screen: 'Tasks' },
      },
      trigger: todayTrigger,
    });
  }
}

const formatTime = (date) => {
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  return hasTime
    ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : '11:59 PM';
};

// Fires an immediate notification for any newly-overdue pending task, once
// per task (tracked in-memory for the current app session — good enough
// since this runs on every Tasks/Home focus).
const notifiedOverdue = new Set();

async function notifyOverdue(tasks) {
  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== 'submitted' && new Date(t.dueDate) < now);

  for (const task of overdue) {
    if (notifiedOverdue.has(task._id)) continue;
    notifiedOverdue.add(task._id);

    await Notifications.scheduleNotificationAsync({
      identifier: identifierForTask(task._id, 'overdue'),
      content: {
        title: `Overdue: ${task.title}`,
        body: `Deadline: ${new Date(task.dueDate).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })}, ${formatTime(new Date(task.dueDate))}`,
        data: { taskId: task._id, screen: 'Tasks' },
      },
      trigger: null, // fire immediately
    });
  }
}

// Call this whenever the task list is (re)loaded — Home dashboard load and
// Tasks screen load are good places.
export async function syncTaskNotifications(tasks) {
  try {
    for (const task of tasks) {
      await scheduleForTask(task);
    }
    await notifyOverdue(tasks);
  } catch (err) {
    // Notifications are a nice-to-have; never let scheduling errors break the app.
    console.log('Notification scheduling failed:', err.message);
  }
}

export async function cancelTaskNotifications(taskId) {
  await Notifications.cancelScheduledNotificationAsync(identifierForTask(taskId, 'tomorrow')).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(identifierForTask(taskId, 'today')).catch(() => {});
}
