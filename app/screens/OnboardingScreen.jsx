import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
// import Button from '../../components/Button/Button'
import { useNavigation } from '@react-navigation/native'; // nec for navigation

const OnboardingScreen = () => {

    const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>GUARDIAN AI</Text>
      <Image
        source={require('../../assets/logo2.jpg')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={styles.subTitle}>Guarding the Mind.</Text>
        <Text style={styles.subTitle}>Protecting Our Children</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  )
}

export default OnboardingScreen

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
headerText: {
  fontSize: 32,
  fontWeight: 'bold',
},
image: {
  width: 200,
  height: 200,
  margin: 20
},
textContainer: {
  backgroundColor: '#ffffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
},
subTitle: {
  fontSize: 18,
  color: '#000000ff',
  textAlign: 'center',
  fontFamily: 'Arial',
},
button: {
    padding: 10,
    backgroundColor: '#000000ff',
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 20,
    width: 200,
    gap: 10,
    },
    buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    }
})