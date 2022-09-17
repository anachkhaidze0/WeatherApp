import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, SafeAreaView, Alert, FlatList, ActivityIndicator, TouchableOpacity} from 'react-native';
import * as Location from 'expo-location'


export default function App() {
  // API key for openweathermap.org
  const API_KEY = 'cb89b749eed791ebe2d3ec37160d993b'

  // Variables
  const [location, setLocation] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [weather, SetWeather] = useState(null)
  const [icon, setIcon] = useState(null)
  const [sunset, setSunset] = useState(null)
  const [sunrise, setSunrise] = useState(null)
  const [hourly, setHourly] = useState(null)
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pressedToday, setPressedToday] = useState(true)
  const [pressedWeek, setPressedWeek] = useState(false)


  // This functions handle to move between hourly and daily forecast
  const toggleToday = () => {
    if(!pressedToday){
      setPressedToday(!pressedToday)
      setPressedWeek(!pressedWeek)
    }
  }

  const toggleWeek = () => {
    if(!pressedWeek){
      setPressedWeek(!pressedWeek)
      setPressedToday(!pressedToday)
    }
  }

  // Getting API
  useEffect(() => {
    (async () => {
      // Lets user to give permission and getting user's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if ( status !== 'granted' ) {
        Alert.alert("Permission accsess was denied!")
        setErrorMessage('Permission denied!')
        setLoading(false)
        return
      }

      // Getting city name by location
      let location = await Location.getCurrentPositionAsync({})
      let city = await Location.reverseGeocodeAsync(location.coords)
      setLocation(city[0].city)

      // Getting weather from openweathermap.org
      const weather = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&exclude=minutely&appid=${API_KEY}`);
      const data = await weather.json()

      // Slice hourly weather data
      const hourlyWeather = data.hourly.slice(0, 12)
      setHourly(hourlyWeather)


      // Slice daily weather data
      const dailyWeather = data.daily.slice(0, 7)
      setDaily(dailyWeather)

      // This function is for formatting hours nicely
      const format = n => ('0' + n).slice(-2) 
     
      // Displaying sunrise and sunset time
      const sunrise = data.current.sunrise
      const sunset = data.current.sunset 
      const sunriseToTime = new Date(sunrise * 1000)
      const sunsetToTime = new Date(sunset * 1000)
      let sunriseTime = format(sunriseToTime.getHours()) + ':' + format(sunriseToTime.getMinutes());
      let sunsetTime = format(sunsetToTime.getHours()) + ':' + format(sunsetToTime.getMinutes());

      setSunrise(sunriseTime)
      setSunset(sunsetTime)

      // Displaing current weather and Icon
      const currentWeather = Math.floor(data.current.temp)
      const currentIcon = data.current.weather[0].icon
      SetWeather(currentWeather)
      setIcon(currentIcon)


      setLoading(false)
    })()
  }, [])

  // Conditionally render text
  let text

  if ( errorMessage ) {
    text = errorMessage
  } else if ( location ) {
    const json = JSON.stringify(location)
    text = JSON.parse(json)
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        // This will render when page is on loading state
        <View>
          <ActivityIndicator style={styles.loader} size="large" color="#ffffff" />
        </View>
      ) : errorMessage ? (
        // This will render if permission was denied
        <View style={styles.denied}>
          <Text style={styles.deniedText}>{text}</Text>
        </View>
      ) : (
        // This will render if everything is okay
        <View style={styles.container}>
          <View style={styles.header}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Image source={require('./assets/menu.png')} style={styles.menu} />
        </View>
        
        <Text style={styles.title}>{text}</Text>
        <Text style={styles.temperature}>{weather}°</Text>
        <Image source={{uri: `http://openweathermap.org/img/wn/${icon}@2x.png`}} style={styles.mainIcon} />
        <View style={styles.sunTimeContainer}>
          <Text style={styles.sunTime}><Text style={styles.sunText}>Sunrise</Text> {"\n"} {sunrise}</Text>
          <Text style={styles.sunTime}><Text style={styles.sunText}>Sunset</Text> {"\n"} {sunset}</Text>
        </View>

      
        <View style={styles.bottomContainer}>
          <Image source={require('./assets/curve.png')} style={styles.curve} />
          
          <View>
            <View style={styles.touchableContainer}>
              <TouchableOpacity onPress={() => toggleToday()}>
                <Text style={pressedToday ? styles.todayButton : styles.borderNone}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleWeek()}>
                <Text style={pressedWeek ?  styles.weekButton : styles.borderNone}>Week</Text>
              </TouchableOpacity>
            </View>

            <FlatList horizontal
              data={hourly}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(hour) => {
              let hourlyIcon = hour.item.weather[0].icon 
              let hours = new Date(hour.item.dt * 1000)
              return <View style={pressedToday ? styles.hoursContainer : styles.hidden}>
                <Text style={styles.hours}>{hours.toLocaleTimeString().slice(0, 5)}</Text>
                <Image
                  source={{
                    uri: `http://openweathermap.org/img/wn/${hourlyIcon}@4x.png`,
                  }} 
                  style= {{width: 60, height: 60}}
                />
                <Text style={styles.detailedTemperature}>{Math.round(hour.item.temp)}°</Text>
              </View>
              }}
            />

            <FlatList horizontal
              data={daily}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(day) => {
              let dailyIcon = day.item.weather[0].icon
              let days = new Date(day.item.dt * 1000)
              let weekDay = days.toLocaleString('default', {weekday: ''}).slice(0, 3)
              return <View style={pressedWeek ? styles.daysContainer : styles.hidden}>
                <Text style={styles.hours}>{weekDay}</Text>
                <Image
                  source={{
                    uri: `http://openweathermap.org/img/wn/${dailyIcon}@4x.png`,
                  }} 
                  style= {{width: 60, height: 60}}
                />
                <Text style={styles.detailedTemperature}>{Math.round(day.item.temp.day)}°</Text>
              </View>
              }}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>©4Twiggers/Ana Chkhaidze</Text>
        </View>
      </View>  
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6b56fd',
  },
  loader: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  denied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deniedText: {
    color: 'white',
    fontSize: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 17
  },
  menu: {
    width: 30,
    height: 30,
    marginTop: 50,
    marginRight: 30,
    
  },
  title: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center'
  },
  temperature: {
    fontSize: 80,
    color: 'white',
    textAlign: 'center',
    marginTop: 15
  },
  mainIcon: {
    width: 200,
    height: 200,
    alignSelf: 'center'
  },
  sunTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 60,
  },
  sunText: {
    fontSize: 17,
    color: 'white',
    fontWeight: '100',
  },
  sunTime: {
    fontSize: 19,
    color: 'white',
    fontWeight: '900',
  },
  bottomContainer: {
    flex: 2,
    backgroundColor: 'white',
    paddingTop: 40
  },
  curve: {
    width: '100%',
    position: 'absolute',
    top: -50
  },
  touchableContainer: {
    flexDirection: 'row',
    borderBottomColor: 'lightgray',
    borderBottomWidth: 2,
  },
  todayButton: {
    fontSize: 18,
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
    transform: [{translateY: 2}]
  },
  weekButton: {
    fontSize: 18,
    marginTop: 10,
    padding: 10,
    marginLeft: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 2,
    transform: [{translateY: 2}]
  },
  hoursContainer: {
    padding: 20,
    marginTop: 10,
    alignItems: 'center'
  },
  hours: {
    fontSize: 15
  },
  detailedTemperature: {
    fontSize: 25
  },
  daysContainer: {
    padding: 20,
    marginTop: 10,
    alignItems: 'center',

  },
  hidden: {
    display: 'none'
  },
  borderNone: {
    fontSize: 18,
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    borderBottomWidth: 0,
    transform: [{translateY: 2}]
  },
  footer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b56fd',
    fontSize: 10

  }
});
