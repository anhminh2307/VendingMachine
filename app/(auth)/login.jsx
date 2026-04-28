import { StyleSheet, Pressable, Text, TextInput, Keyboard, TouchableWithoutFeedback, useColorScheme } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

// themed component
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'
import Spacer from '../../components/Spacer'

const Login = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleLogin = async() => {
        setLoading(true)
        setError('')
        
        const {data, error} = await supabase
        .from('User')
        .select('*')
        .eq('username', username)
        .single()

        if(error || !data){
            setError('Tên đăng nhập không tồn tại');
            setLoading(false);
            return;
        }

        if(data.username === username && data.password === password){
            router.replace('/(tabs)/employees')
        } else {
            setError("Mật khẩu không đúng")
        }
        setLoading(false)
    }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
            <Spacer />
            <ThemedText title={true} style={styles.title}>
                Đăng nhập
            </ThemedText>

            <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder='Tên đăng nhập'
                keyboardType="default"
                onChangeText={setUsername}
                value={username}
            />
            <ThemedTextInput
                style={{ width: '80%', marginBottom: 20 }}
                placeholder='Mật khẩu'
                autoCapitalize="none"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <ThemedButton onPress={handleLogin}>
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
        color: Colors.danger,
        padding: 10,
        backgroundColor: 'f5c1c8',
        marginHorizontal: 10,
    },
})