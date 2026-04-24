import { StyleSheet, Pressable, Text, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { Link } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { useState } from 'react'

// themed component
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'
import Spacer from '../../components/Spacer'

const Login = () => {

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.title}>
                Đăng nhập
            </ThemedText>

            <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder='Email'
                keyboardType="email-address"
                onChangeText={setEmail}
                value={email}
            />
            <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder='Password'
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />

            <ThemedButton onPress={handleSubmit}>
                <Text style={{ color: '#f2f2f2'}}>Đăng nhập</Text>
            </ThemedButton>
            
        </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 30,
    },

    btn: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },

    pressed: {
        opacity: 0.8,
    },

    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: 'f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    },
})