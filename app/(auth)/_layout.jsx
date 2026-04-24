import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {

  return (
    <>
        <StatusBar style="auto" />
        <Stack screenOptions={{
            headerShown: false,
            animation: "none",
        }}/>
    </>
  )
}

export default AuthLayout

const styles = StyleSheet.create({})