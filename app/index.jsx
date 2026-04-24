import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

//themed component
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import ThemedText from '../components/ThemedText'
import Spacer from '../components/Spacer'

const Home = () => {
  return (
    <ThemedView style={styles.container}>
        <ThemedLogo/>
        <Spacer height={20}/>

        <ThemedText style={styles.title} title={true}>Trang chủ</ThemedText>

        <Spacer height={20}/>
        <ThemedText>Vending Machine app</ThemedText>

        <Link style={styles.link} href={"/login"}>
            <ThemedText>Tới trang đăng nhập</ThemedText>
        </Link>

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.1)',
    },
    img:{
        
        marginVertical: 20,

    },
    link: {
        marginVertical: 10,
        borderBottomWidth: 1
    }
})