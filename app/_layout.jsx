import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { useEffect } from 'react'
import { Colors } from "../constants/Colors"
import { StatusBar } from 'expo-status-bar'


const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/(auth)/login")
        }, 0)

        return () => clearTimeout(timer)
    }, [])

  return (
    <>
        <StatusBar value="auto" />
        <Stack screenOptions={{
            headerStyle: { backgroundColor: theme.navBackground },
            headerTintColor: theme.title,
        }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    </>
  )
}

export default RootLayout

const styles = StyleSheet.create({})