import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Thông báo chỉ hoạt động trên thiết bị thật');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Không được cấp quyền thông báo');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id', // lấy từ app.json > expo > extra > eas > projectId
  });

  // android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tickets', {
      name: 'Phiếu fill hàng',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2f95dc',
      sound: 'default',
    });
  }

  return tokenData.data;
};

export const savePushToken = async (userId: string, token: string): Promise<void> => {
  const { error } = await supabase
    .from('User')
    .update({ pushToken: token })
    .eq('id', userId);
  if (error) throw error;
};

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
    channelId: 'tickets',
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(message),
  });
};

export const getUserPushToken = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('User')
    .select('pushToken')
    .eq('id', userId)
    .single();

  if (error || !data?.pushToken) return null;
  return data.pushToken;
};