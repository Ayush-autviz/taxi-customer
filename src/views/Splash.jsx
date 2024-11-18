import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StatusBar
} from "react-native";
import {
  bold,
  logo,
  app_name,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  app_settings,
  api_url
} from "../config/Constants";
import messaging from '@react-native-firebase/messaging';
import { useNavigation, CommonActions } from "@react-navigation/native";
import * as colors from "../assets/css/Colors";
import { connect } from 'react-redux';
import { initialLat, initialLng, initialRegion } from '../actions/BookingActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import VersionNumber from 'react-native-version-number';
import { isLocationEnabled, promptForEnableLocationIfNeeded, } from 'react-native-android-location-enabler';
import axios from 'axios';
import { addEventListener } from "@react-native-community/netinfo";
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';

const Splash = (props) => {
  const navigation = useNavigation();
  let dropDownAlertRef = useRef();

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    requestUserPermission();
    checkToken();
    const unsubscribe = addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if(state.isConnected == true){
        check_data();
        // channel_create();
        // configure();
        
      }else{
        dropDownAlertRef({
          type: DropdownAlertType.Error,
          title: 'Internet connection error',
          message: 'Please enable your internet connection',
        });
      }
    });
   //getInitialLocation();
    unsubscribe();
  }, []);

  const checkToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      console.log('fcm_token:' + fcmToken);
    } catch (error) {
      console.log(error);
    } 
    if (fcmToken) {
      global.fcm_token = fcmToken
      check_data();
    } else {
      Alert.alert('Sorry unable to get your token');
    }
  }

  const check_data = async () => {
    if (Platform.OS == "android") {
      call_settings();
      // global.fcm_token = '123456'
    } else {
      call_settings();
      global.fcm_token = '123456'
    }
  }

  // const channel_create = () => {
  //   PushNotification.createChannel(
  //     {
  //       channelId: "taxi_booking", // (required)
  //       channelName: "Booking", // (required)
  //       channelDescription: "Taxi Booking Solution", // (optional) default: undefined.
  //       playSound: true, // (optional) default: true
  //       soundName: "uber.mp3", // (optional) See `soundName` parameter of `localNotification` function
  //       importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
  //       vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  //     },
  //     (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
  //   );
  // }

  // const configure = () => {
  //   PushNotification.configure({
  //     // (optional) Called when Token is generated (iOS and Android)
  //     onRegister: function (token) {
  //       console.log("TOKEN:", token);
  //       global.fcm_token = token.token;
  //       //alert(global.fcm_token)
  //     },

  //     // (required) Called when a remote is received or opened, or local notification is opened
  //     onNotification: function (notification) {
  //       console.log("NOTIFICATION:", notification);

  //       // process the notification

  //       // (required) Called when a remote is received or opened, or local notification is opened
  //       notification.finish(PushNotificationIOS.FetchResult.NoData);
  //     },

  //     // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  //     onAction: function (notification) {
  //       console.log("ACTION:", notification.action);
  //       console.log("NOTIFICATION:", notification);

  //       // process the action
  //     },

  //     // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  //     onRegistrationError: function (err) {
  //       console.error(err.message, err);
  //     },

  //     // IOS ONLY (optional): default: all - Permissions to register.
  //     permissions: {
  //       alert: true,
  //       badge: true,
  //       sound: true,
  //     },

  //     // Should the initial notification be popped automatically
  //     // default: true
  //     popInitialNotification: true,

  //     /**
  //      * (optional) default: true
  //      * - Specified if permissions (ios) and token (android and ios) will requested or not,
  //      * - if not, you must call PushNotificationsHandler.requestPermissions() later
  //      * - if you are not using remote notification or do not have Firebase installed, use this:
  //      *     requestPermissions: Platform.OS === 'ios'
  //      */
  //     requestPermissions: true,
  //   });
  // }


  const check_location = async () => {
    if (Platform.OS === "android") {
      promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
        .then(async data => {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
              'title': 'App Access your location for tracking in background',
              'message': app_name + ' will track your location in background when the app is closed or not in use.'
            }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              await getInitialLocation();
            } else {
              navigation.navigate('LocationEnable');
              alert('Sorry unable to fetch your location');
            }
          } catch (err) {
            console.log(err)
            console.log(1)
            navigation.navigate('LocationEnable');
          }
        }).catch(err => {
          console.log(err)
          console.log(2)
          navigation.navigate('LocationEnable');
        });
    } else {
      await getInitialLocation();
    }
  }

  const getInitialLocation = async () => {
    Geolocation.getCurrentPosition(async (position) => {
      console.log(position,'position');
      let location = position.coords;
      let region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      await props.initialRegion(region);
      await props.initialLat(location.latitude);
      await props.initialLng(location.longitude);
      navigate();
    }, error => {
     // navigate();
     navigation.navigate('LocationEnable')
    },
      { enableHighAccuracy: false, timeout: 10000 });
  }

  const call_settings = async () => {
    await axios({
      method: 'get',
      url: api_url + app_settings
    })
      .then(async response => {
        home(response.data.result);
      })
      .catch(error => {
        console.log(error)
      });
  }

  const home = async (data) => {
    global.lang = 'en';
    const id = await AsyncStorage.getItem('id');
    const first_name = await AsyncStorage.getItem('first_name');
    const profile_picture = await AsyncStorage.getItem('profile_picture');
    const phone_with_code = await AsyncStorage.getItem('phone_with_code');
    const email = await AsyncStorage.getItem('email');
    const lang = await AsyncStorage.getItem('lang');
    global.existing = await AsyncStorage.getItem("existing");
    global.stripe_key = await data.stripe_key;
    global.razorpay_key = await data.razorpay_key;
    global.paystack_public_key = await data.paystack_public_key;
    global.paystack_secret_key = await data.paystack_secret_key;
    global.flutterwave_public_key = await data.flutterwave_public_key;
    global.app_name = await data.app_name;
    global.language_status = await data.language_status;
    global.default_language = await data.default_language;
    global.polyline_status = await data.polyline_status;
    global.currency = await data.default_currency_symbol;
    global.mode = data.mode;
    global.promo_id = 0;

    if (id !== null) {
      global.id = id;
      global.first_name = first_name;
      global.profile_picture = profile_picture;
      global.phone_with_code = phone_with_code;
      global.email = email;
      check_location();
    } else {
      global.id = 0;
      check_location();
    }
  }

  const navigate = () => {
    // navigation.dispatch(
    //   CommonActions.reset({
    //     index: 0,
    //     routes: [{ name: "Home" }],
    //   })
    // );
    if (global.existing == 1) {
      if (global.id > 0) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "CheckPhone" }],
          })
        );
      }
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Intro" }],
        })
      );
    }
  }

  return (
    <TouchableOpacity activeOpacity={1} style={styles.background}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={styles.logo_container}>

        <Image style={styles.logo} source={logo} />

      </View>
      <DropdownAlert alert={func => (dropDownAlertRef = func)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  background: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme_bg_three,
  },
  logo_container: {
    height: 200,
  },
  logo: {
    width:300,
    resizeMode:'contain',
    flex: 1,
    borderRadius: 10
  },
  spl_text: {
    fontFamily: bold,
    fontSize: 18,
    color: colors.theme_fg_three,
    letterSpacing: 2,
  },
});

function mapStateToProps(state) {
  return {
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

const mapDispatchToProps = (dispatch) => ({
  initialLat: (data) => dispatch(initialLat(data)),
  initialLng: (data) => dispatch(initialLng(data)),
  initialRegion: (data) => dispatch(initialRegion(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
