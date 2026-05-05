import { Tabs, Stack } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../../context/AuthContext';

const TabLayout = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
    <StatusBar style="auto" />
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2f95dc',
      }}
    >
      {/* index */}
      <Tabs.Screen
        name='index'
        options={{
          href: null
        }}
      />

      {/* Nhân viên */}
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Nhân viên',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) => <Ionicons name='person-outline' size={24} color={color} />,
        }}
      />

      {/* Sản phẩm */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Sản phẩm',
          tabBarIcon: ({ color }) => <Ionicons name='cube-outline' size={24} color={color} />,
        }}
      />

      {/* Máy */}
      <Tabs.Screen
        name="machines"
        options={{
          title: 'Máy bán hàng',
          tabBarIcon: ({ color }) => <Ionicons name='hardware-chip-outline' size={24} color={color} />,
        }}
      />

      {/* Vé */}
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Vé',
          tabBarIcon: ({ color }) => <Ionicons name='ticket-outline' size={24} color={color} />,
        }}
      />

      {/* Thông tin */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Thông tin',
          tabBarIcon: ({ color }) => <Ionicons name='person-circle-outline' size={24} color={color} />,
        }}
      /> 
    </Tabs>
    </>
  )
}

export default TabLayout
