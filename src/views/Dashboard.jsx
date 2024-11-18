import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Image,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
  Keyboard,
  FlatList,
  TextInput,
  Alert,
  
} from "react-native";
import { connect } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  screenHeight,
  screenWidth,
  trip_details,
  search_loader,
  normal,
  promo_codes,
  bold,
  GOOGLE_KEY,
  month_names,
  money_icon,
  discount_icon,
  no_favourites,
  add_favourite,
  get_home,
  api_url,
  img_url,
  get_estimation_fare,
  pin_marker,
  regular,
  get_zone,
  btn_loader,
  ride_confirm,
  trip_request_cancel,
  f_m,
  get_recent_searches,
} from "../config/Constants";
import Icon, { Icons } from "../components/Icons";
import * as colors from "../assets/css/Colors";
import DropShadow from "react-native-drop-shadow";
import { Badge, Divider } from "react-native-paper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import LottieView from "lottie-react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from "react-native-dropdownalert";
import database from "@react-native-firebase/database";
import Modal from "react-native-modal";
import Dialog from "react-native-dialog";
import PhoneInput from "react-native-phone-input";

const Dashboard = (props) => {
  //used in focus event listner and opening of drawer(react-navigation - something new )
  const navigation = useNavigation();
  //used in google place autocomplete there is property search.current.searchText('')
  const search = useRef();
  //refrence to map
  const map_ref = useRef();
  //given to text input when booking for someone else but never used
  const inputRef = useRef();
  //a library for alert we pass a ref to the componet and when we need to call alert we use ref
  let dropDownAlertRef = useRef();
  // react native bottom sheet library very common used before too
  const fav_RBSheet = useRef();
  // react native bottom sheet library very common used before too(when booking for others)
  const add_contact_RBSheet = useRef();
  // used in region chang also in useeffrct asigning value 1 in settime out dont know the use case for now
  const [on_loaded, setOnLoaded] = useState(0);

  const [auto, setAuto] = useState(1);
  // value is in between 1 and 2 dont know the use case
  const [active_location, setActiveLocation] = useState(1);
  //stores the region of map intialized in the begning only never got changed
  const [region, setRegion] = useState(props.initial_region);
  //stores trip types shared , daily , rental etc get set in get home api
  const [trip_types, setTripTypes] = useState([]);
  //promo codes
  const [promo_list, setPromoList] = useState([]);
  //setting promo then calculating fare price againn
  const [promo, setPromo] = useState(0);
  //trips sub types like (rounded one way trip)
  const [trip_sub_types, setTripSubTypes] = useState([]);
  //caled in calculating estimation fares
  const [estimation_fares, setEstimationFares] = useState([]);
  // fetching online vehicles from firebase
  const [online_vehicles, setOnlineVehicles] = useState([]);
  // storing customer favourites
  const [customer_favourites, setCustomerFavourties] = useState([]);
  // storig customer recent places
  const [customer_recent_places, setCustomerRecentPlaces] = useState([]);
  // active trip type
  const [active_trip_type, setActiveTripType] = useState(0);
  //active trip sub type
  const [active_trip_sub_type, setActiveTripSubType] = useState(0);
  //active vehicle type
  const [active_vehicle_type, setActiveVehicleType] = useState(0);
  //loading state
  const [loading, setLoading] = useState(false);
  //show my locatio button
  const [current_location_status, setCurrentLocationStatus] = useState(true);
  //is date picker visibel
  const [is_date_picker_visible, setDatePickerVisibility] = useState(false);
  //pickup date set
  const [pickup_date, setPickupDate] = useState(new Date());
  //pick up date albel
  const [pickup_date_label, setPickupDateLabel] = useState("Now");
  const [pickup_time_label, setPickupTimeLabel] = useState("");
  // stores packages
  const [packages, setPackages] = useState([]);
  //package for hour
  const [package_hr, setPackageHr] = useState(0);
  //package for km
  const [package_km, setPackageKm] = useState(0);
  //stores package id
  const [package_id, setPackageId] = useState(0);
  //setting mouint state
  const [is_mount, setIsMount] = useState(0);
  //setting km
  const [km, setKm] = useState(0);
  //setting serach status
  const [search_status, setSearchStatus] = useState(0);
  //setting wallet
  const [wallet, setWallet] = useState(0);
  //is modal visble state
  const [is_modal_visible, setModalVisible] = useState(false);
  const duration = 500;
  //trip request id
  const [trip_request_id, setTripRequestId] = useState(0);
  //contact number
  const [contact_number, setContactNumber] = useState("");
  //never used search loading
  const [search_loading, setSearchLoading] = useState(false);

  //Address
  const [pickup_address, setPickupAddress] = useState("");
  const [pickup_lat, setPickupLat] = useState(props.initial_lat);
  const [pickup_lng, setPickupLng] = useState(props.initial_lng);

  const [drop_address, setDropAddress] = useState("");
  const [drop_lat, setDropLat] = useState(0);
  const [drop_lng, setDropLng] = useState(0);

  const [tmp_address, setTmpAddress] = useState("");
  const [tmp_lat, setTmpLat] = useState(props.initial_lat);
  const [tmp_lng, setTmpLng] = useState(props.initial_lng);

  //Screen Home
  const home_comp_1 = useRef(new Animated.Value(-60)).current;
  const home_comp_2 = useRef(new Animated.Value(screenHeight + 170)).current;

  //Screen Location
  const drop_comp_1 = useRef(new Animated.Value(-110)).current;
  const drop_comp_2 = useRef(new Animated.Value(screenHeight + 150)).current;
  const drop_comp_3 = useRef(new Animated.Value(-130)).current;
  const drop_comp_4 = useRef(
    new Animated.Value(screenHeight + (screenHeight - 100))
  ).current;

  //Screen Booking
  const book_comp_1 = useRef(new Animated.Value(screenHeight + 250)).current;

  console.log(pickup_address, "pickup address");
  console.log(drop_address, "drop_address");

  useEffect(() => {
    //animates the screen home entry
    screen_home_entry();
    //trip types,faivorate, packages , active trip type
    get_home_api();
    //may be check if there is any active trip on going
    booking_sync();
    //get vehicles from firebase
    get_vehicles();
    //get promo codes
    call_promo_codes();
    //view recent places
    view_recent_places();
    const unsubscribe = navigation.addListener("focus", async () => {
      setIsMount(1);
    });
    setTimeout(() => {
      setOnLoaded(1);
    }, 2000);
    return unsubscribe;
  }, []);

  const call_promo_codes = () => {
    axios({
      method: "post",
      url: api_url + promo_codes,
      data: { lang: global.lang, customer_id: global.id },
    })
      .then(async (response) => {
        setPromoList(response.data.result);
      })
      .catch((error) => {
        alert("Sorry something went wrong");
      });
  };

  const call_apply_promo = (data) => {
    setPromo(data.id);
    toggleModal();
    get_estimation_fare_api(
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      package_id,
      active_trip_sub_type,
      data.id
    );
  };

  const booking_sync = () => {
    console.log(global.id,'global id');
    database()
      .ref(`customers/${global.id}`)
      .on("value", (snapshot) => {
        setSearchStatus(snapshot?.val()?.is_searching);
        if (snapshot?.val()?.booking_id != 0) {
          if (is_mount == 0) {
            setIsMount(1);
            booking_exit();
            setActiveTripType(1);
            call_trip_details(snapshot?.val()?.booking_id);
          }
        }
      });
  };

  const call_trip_details = (trip_id) => {
    axios({
      method: "post",
      url: api_url + trip_details,
      data: { trip_id: trip_id },
    })
      .then(async (response) => {
        navigation.navigate("TripDetails", {
          trip_id: trip_id,
          from: "home",
          data: response.data.result,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleModal = () => {
    setModalVisible(!is_modal_visible);
  };

  const get_vehicles = () => {
    database()
      .ref(`drivers`)
      .on("value", (snapshot) => {
        setOnlineVehicles([]);
        snapshot.forEach(function (childSnapshot) {
          if (childSnapshot.val() != null) {
            if (Array.isArray(childSnapshot.val())) {
              childSnapshot.val().map((value) => {
                if (
                  value != null &&
                  value.booking &&
                  value.booking.booking_status == 0 &&
                  value.online_status == 1
                ) {
                  setOnlineVehicles((prevArray) => [
                    ...prevArray,
                    {
                      latitude: value.geo.lat,
                      longitude: value.geo.lng,
                      vehicle_slug: value.vehicle_slug,
                      bearing: value.geo.bearing,
                    },
                  ]);
                  // console.log(online_vehicles);
                }
              });
            } else {
              {
                Object.values(childSnapshot.val()).map((item) => {
                  if (
                    item != null &&
                    item.booking &&
                    item.booking.booking_status == 0 &&
                    item.online_status == 1
                  ) {
                    setOnlineVehicles((prevArray) => [
                      ...prevArray,
                      {
                        latitude: item.geo.lat,
                        longitude: item.geo.lng,
                        vehicle_slug: item.vehicle_slug,
                        bearing: item.geo.bearing,
                      },
                    ]);
                    // console.log(online_vehicles);
                  }
                });
              }
            }
          }
        });
      });
  };

  const render_vehicles = () => {
    return online_vehicles.map((marker) => {
      //console.log(marker.bearing);
      if (marker.vehicle_slug == "car") {
        return (
          <Marker coordinate={marker} rotation={marker.bearing}>
            <Image
              style={{ flex: 1, height: 30, width: 15 }}
              source={require(".././assets/img/tracking/car.png")}
            />
          </Marker>
        );
      } else if (marker.vehicle_slug == "bike") {
        return (
          <Marker coordinate={marker}>
            <Image
              style={{ flex: 1, height: 29, width: 17 }}
              source={require(".././assets/img/tracking/bike.png")}
            />
          </Marker>
        );
      } else if (marker.vehicle_slug == "truck") {
        return (
          <Marker coordinate={marker}>
            <Image
              style={{ flex: 1, height: 29, width: 17 }}
              source={require(".././assets/img/tracking/truck.png")}
            />
          </Marker>
        );
      }
    });
  };

  const set_default_date = async (currentdate, type) => {
    let datetime =
      (await (currentdate.getDate() < 10 ? "0" : "")) +
      currentdate.getDate() +
      "-" +
      (currentdate.getMonth() + 1 < 10 ? "0" : "") +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getFullYear() +
      " " +
      (currentdate.getHours() < 10 ? "0" : "") +
      currentdate.getHours() +
      ":" +
      (currentdate.getMinutes() < 10 ? "0" : "") +
      currentdate.getMinutes() +
      ":" +
      (currentdate.getSeconds() < 10 ? "0" : "") +
      currentdate.getSeconds();
    let label =
      (await (currentdate.getDate() < 10 ? "0" : "")) +
      currentdate.getDate() +
      " " +
      month_names[currentdate.getMonth()].substring(0, 3);
      // ", " +
      // formatAMPM(currentdate);
    let time_label = formatAMPM(currentdate);
    if (type == 0) {
      setPickupDateLabel("Now");
    } else {
      setPickupDateLabel(label);
      setPickupTimeLabel(time_label)
    }

    setPickupDate(datetime);
  };

  const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  const screen_home_entry = () => {
    Keyboard.dismiss();
    Animated.timing(home_comp_1, {
      toValue: 60,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(home_comp_2, {
      toValue: screenHeight,
      duration: duration,
      useNativeDriver: true,
    }).start();
    setPromo(0);
  };

  const screen_home_exit = () => {
    Animated.timing(home_comp_1, {
      toValue: -60,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(home_comp_2, {
      toValue: screenHeight + 170,
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const location_entry = () => {
    Animated.timing(drop_comp_1, {
      toValue: 75,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_2, {
      toValue: screenHeight,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_3, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const location_exit = () => {
    Animated.timing(drop_comp_1, {
      toValue: -110,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_2, {
      toValue: screenHeight + 150,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_3, {
      toValue: -130,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_4, {
      toValue: screenHeight + (screenHeight - 100),
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const search_entry = () => {
    Animated.timing(drop_comp_4, {
      toValue: 100,
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const search_exit = () => {
    Keyboard.dismiss();
    Animated.timing(drop_comp_4, {
      toValue: screenHeight + (screenHeight - 100),
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const booking_entry = () => {
    location_exit();
    set_default_date(new Date(), 0);
    setCurrentLocationStatus(false);
    Animated.timing(book_comp_1, {
      toValue: 250,
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const booking_exit = () => {
    setCurrentLocationStatus(true);
    screen_home_entry();
    Animated.timing(book_comp_1, {
      toValue: screenHeight + 250,
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const is_focus = () => {
    search_entry();
  };

  const region_change = (region) => {
    console.log("on region change");
    if (on_loaded == 1) {
      screen_home_exit();
      location_entry();
      onRegionChange(region, "T");
    } else {
      onRegionChange(region, "P");
    }
  };

  const onRegionChange = async (value, type) => {
    fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        value.latitude +
        "," +
        value.longitude +
        "&key=" +
        GOOGLE_KEY
    )
      .then((response) => response.json())
      .then(async (responseJson) => {
        if (responseJson.results[2].formatted_address != undefined) {
          console.log(type, "typeeeee");

          if (auto) {
            search.current?.setAddressText(
              responseJson.results[2].formatted_address
            );
            setTmpAddress(responseJson.results[2].formatted_address);
            setTmpLat(value.latitude);
            setTmpLng(value.longitude);
          }

          if (active_location == 1 && auto) {
            setPickupAddress(responseJson.results[2].formatted_address);
            setPickupLat(value.latitude);
            setPickupLng(value.longitude);
          } else if (active_location == 1 && !auto) {
            setPickupAddress(tmp_address);
            setPickupLat(tmp_lat);
            setPickupLng(tmp_lng);
          }

          setAuto(1);

          // if (type == 'P') {
          //   setPickupAddress(responseJson.results[2].formatted_address);
          //   setPickupLat(value.latitude);
          //   setPickupLng(value.longitude);
          //   console.log(responseJson.results[2].formatted_address,"type p")
          //i have added
          //  search.current?.setAddressText(responseJson.results[2].formatted_address);
          // } else {
          //   setTmpAddress(responseJson.results[2].formatted_address);
          //   setTmpLat(value.latitude);
          //   setTmpLng(value.longitude);
          // }
          //this.get_distance();
          //this.find_city(responseJson.results[0]);
        }
      });
  };

  const confirm_location = async () => {
    console.log(active_location, "active location");
    if (active_location == 1) {
      setPickupAddress(tmp_address);
      setPickupLat(tmp_lat);
      setPickupLng(tmp_lng);
    } else {
      setDropAddress(tmp_address);
      setDropLat(tmp_lat);
      setDropLng(tmp_lng);
    }
    if (pickup_address != "" && active_location == 2) {
      console.log("boooking entry 2");
      booking_entry();
      get_estimation_fare_api(
        pickup_lat,
        pickup_lng,
        tmp_lat,
        tmp_lng,
        0,
        active_trip_sub_type,
        0
      );
    }
    // else if (drop_address != '' && active_location == 1) {
    //   console.log('boooking entry 3');
    //   booking_entry();
    //   get_estimation_fare_api(tmp_lat, tmp_lng, drop_lat, drop_lng, 0, active_trip_sub_type, 0);
    // }
    else {
      back_to_home_screen();
    }
  };

  const select_package = (data) => {
    screen_home_exit();
    setPackageId(data.id);
    setPackageHr(data.hours);
    setPackageKm(data.kilometers);
    booking_entry();
    get_estimation_fare_api(
      tmp_lat,
      tmp_lng,
      drop_lat,
      drop_lng,
      data.id,
      0,
      0
    );
    // console.log(tmp_lat, tmp_lng, drop_lat, drop_lng, data.id, 0, 0)
  };
  const get_location = (data, details, type) => {
    setTmpAddress(data.description);
    setTmpLat(details.geometry.location.lat);
    setTmpLng(details.geometry.location.lng);

    search_exit();

    setAuto(0);
    set_location(details.geometry.location.lat, details.geometry.location.lng);
  };

  const set_location = (lat, lng) => {
    map_ref?.current?.animateCamera(
      {
        center: {
          latitude: lat,
          longitude: lng,
        },
      },
      { duration: 2000 }
    );
  };

  const back_to_home_screen = () => {
    location_exit();
    screen_home_entry();
  };

  const change_address = (change_location) => {
    location_exit();
    screen_home_entry();
    open_location(change_location);
  };

  const open_location = async (location) => {
    //view_recent_places();
    console.log("helloooooo");
    search.current?.setAddressText("");
    search_entry();
    setActiveLocation(location);
    screen_home_exit();
    location_entry();
  };

  const load_trip_types = () => {
    let icon = "";
    return trip_types.map((data) => {
      if (data.id == active_trip_type) {
        icon = data.active_icon;
      } else {
        icon = data.inactive_icon;
      }
      //  onPress={change_trip_type.bind(this, data)}
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={change_trip_type.bind(this, data)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "20%",
          }}
        >
          <View
            style={
              active_trip_type == data.id
                ? styles.active_vehicle_img
                : styles.vehicle_img
            }
          >
            <Image
              style={{ height: undefined, width: undefined, flex: 1 }}
              source={{ uri: img_url + icon }}
            />
          </View>
          <View style={{ margin: 2 }} />
          <Text
            style={
              active_trip_type == data.id
                ? styles.active_trip_type_label
                : styles.inactive_trip_type_label
            }
          >
            {data.name}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const estimation_fare_list = () => {
    return estimation_fares.map((data) => {
      return (
        <DropShadow
          style={{
            width: "100%",
            marginBottom: 5,
            marginTop: 5,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: active_vehicle_type == data.id ? 0.3 : 0,
            shadowRadius: 3,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={change_vehicle_type.bind(this, data.id)}
            style={{
              width: "100%",
              backgroundColor: colors.theme_bg_three,
              padding: 5,
              flexDirection: "row",
              borderRadius: 10,
            }}
          >
            <View
              style={{
                width: "25%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ height: 30, width: 30 }}>
                <Image
                  style={{ height: undefined, width: undefined, flex: 1 }}
                  source={{ uri: img_url + data.active_icon }}
                />
              </View>
              {data.eta != 0 ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.theme_fg_two,
                    fontSize: 10,
                    fontFamily: regular,
                  }}
                >
                  {data.eta}
                </Text>
              ) : (
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.theme_fg_two,
                    fontSize: 10,
                    fontFamily: regular,
                  }}
                >
                  Not Available
                </Text>
              )}
            </View>
            <View
              style={{
                width: "50%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 14,
                  fontFamily: bold,
                }}
              >
                {data.vehicle_type}
              </Text>
              <View style={{ margin: 2 }} />
              <Text
                numberOfLines={1}
                style={{
                  color: colors.text_grey,
                  fontSize: 12,
                  fontFamily: normal,
                }}
              >
                {data.description}
              </Text>
            </View>
            <View
              style={{
                width: "25%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 14,
                  fontFamily: normal,
                  letterSpacing: 1,
                }}
              >
                {global.currency}
                {data.fares.total_fare}
              </Text>
              {promo != 0 && (
                <View
                  style={{
                    marginTop: 4,
                    backgroundColor: colors.success_background,
                    borderRadius: 5,
                    padding: 2,
                    paddingLeft: 5,
                    paddingRight: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    ellipsizeMode="tail"
                    style={{
                      color: colors.success,
                      fontSize: 8,
                      fontFamily: normal,
                    }}
                  >
                    Promo Applied
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </DropShadow>
      );
    });
  };

  const load_location = (lat, lng) => {
    // console.log('r'+lat + '-' + lng)
    back_to_home_screen();
    set_location(parseFloat(lat), parseFloat(lng));
  };

  const favourites_list = () => {
    if (customer_favourites.length == 0) {
      return (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ height: 150, width: 150, alignSelf: "center" }}>
            <LottieView
              style={{ flex: 1 }}
              source={no_favourites}
              autoPlay
              loop
            />
          </View>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              fontSize: 12,
              color: colors.text_grey,
              fontFamily: regular,
            }}
          >
            No data found
          </Text>
        </View>
      );
    } else {
      return customer_favourites.map((data) => {
        return (
          <TouchableOpacity
            activeOpacity={1}
            onPress={load_location.bind(this, data.lat, data.lng)}
            style={{
              width: "100%",
              flexDirection: "row",
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              paddingTop: 10,
            }}
          >
            <View
              style={{
                width: "15%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.MaterialIcons}
                name="near-me"
                color={colors.icon_inactive_color}
                style={{ fontSize: 22 }}
              />
            </View>
            <View
              style={{
                width: "85%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  fontSize: 16,
                  color: colors.text_grey,
                  fontFamily: regular,
                }}
              >
                {data.address}
              </Text>
            </View>
          </TouchableOpacity>
        );
      });
    }
  };

  const recent_places_list = () => {
    if (customer_recent_places?.length == 0) {
      return (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 3,
          }}
        >
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              fontSize: 12,
              color: colors.text_grey,
              fontFamily: regular,
              textAlign: "center",
            }}
          >
            No recent places searched
          </Text>
        </View>
      );
    } else {
      return customer_recent_places?.map((data) => {
        return (
          <TouchableOpacity
            activeOpacity={1}
            onPress={load_location.bind(this, data.lat, data.lng)}
            style={{
              width: "100%",
              flexDirection: "row",
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              paddingTop: 10,
            }}
          >
            <View
              style={{
                width: "15%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.MaterialIcons}
                name="near-me"
                color={colors.icon_inactive_color}
                style={{ fontSize: 22 }}
              />
            </View>
            <View
              style={{
                width: "85%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  fontSize: 16,
                  color: colors.text_grey,
                  fontFamily: regular,
                }}
              >
                {data.address}
              </Text>
            </View>
          </TouchableOpacity>
        );
      });
    }
  };

  const change_trip_type = async (data) => {
    console.log("hellooooo", data);
    setActiveTripType(data.id);
    setTripSubTypes(data.trip_sub_type);
    if (data.trip_sub_type.length > 0) {
      setActiveTripSubType(data.trip_sub_type[0].id);
    } else {
      setActiveTripSubType(0);
    }
  };

  const get_home_api = async () => {
    //  setLoading(true);
    await axios({
      method: "post",
      url: api_url + get_home,
      data: { lang: global.lang, customer_id: global.id },
    })
      .then(async (response) => {
        //  setLoading(false);
        if (response.data.status == 1) {
          setTripTypes(response.data.result.trip_types);
          setPackages(response.data.result.packages);
          setCustomerFavourties(response.data.result.customer_favourites);
          setActiveTripType(response.data.result.trip_types[0].id);
        }
      })
      .catch((error) => {
        // setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const add_favourite_api = async () => {
    fav_RBSheet.current.close();
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + add_favourite,
      data: {
        customer_id: global.id,
        address: pickup_address,
        lat: pickup_lat,
        lng: pickup_lng,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.status == 1) {
          dropDownAlertRef({
            type: DropdownAlertType.Success,
            title: "Success",
            message: "Location added in your favourite spot!",
          });
          setCustomerFavourties(response.data.result);
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const view_recent_places = async () => {
    console.log({ customer_id: global.id });
    //setLoading(true);
    await axios({
      method: "post",
      url: api_url + get_recent_searches,
      data: { customer_id: global.id },
    })
      .then(async (response) => {
        // setLoading(false);
        setCustomerRecentPlaces(response.data.result);
      })
      .catch((error) => {
        //  setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const get_estimation_fare_api = async (
    lat1,
    lng1,
    lat2,
    lng2,
    package_id,
    sub_type,
    pr
  ) => {
    console.log({
      customer_id: global.id,
      pickup_lat: lat1,
      pickup_lng: lng1,
      drop_lat: lat2,
      drop_lng: lng2,
      trip_type: active_trip_type,
      promo: pr,
      lang: global.lang,
      package_id: package_id,
      days: 1,
      trip_sub_type: sub_type,
    });
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + get_estimation_fare,
      data: {
        customer_id: global.id,
        pickup_lat: lat1,
        pickup_lng: lng1,
        drop_lat: lat2,
        drop_lng: lng2,
        trip_type: active_trip_type,
        promo: pr,
        lang: global.lang,
        package_id: package_id,
        days: 1,
        trip_sub_type: sub_type,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.status == 1) {
          setEstimationFares(response.data.result["vehicles"]);
          setWallet(response.data.result["wallet"]);
          setKm(response.data.result["vehicles"][0].fares.km);
          change_vehicle_type(response.data.result["vehicles"][0].id);
          if (
            pr != 0 &&
            response.data.result["vehicles"][0].fares.discount <= 0
          ) {
            setPromo(0);
            dropDownAlertRef({
              type: DropdownAlertType.Error,
              title: "Error",
              message: "Sorry promo not applied!",
            });
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log('EF',{customer_id: global.id,
          pickup_lat: lat1,
          pickup_lng: lng1,
          drop_lat: lat2,
          drop_lng: lng2,
          trip_type: active_trip_type,
          promo: pr,
          lang: global.lang,
          package_id: package_id,
          days: 1,
          trip_sub_type: sub_type,});
        
        alert("Sorry something went wrong");
      });
  };

  const call_zone = async (contact) => {
    add_contact_RBSheet.current.close();
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + get_zone,
      data: { lat: pickup_lat, lng: pickup_lng },
    })
      .then(async (response) => {
        if (response.data.result == 0) {
          setLoading(false);
          dropDownAlertRef({
            type: DropdownAlertType.Error,
            title: "Not Available",
            message: "Our service is not available in your location.!",
          });
        } else {
          call_ride_confirm(response.data.result, contact);
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const call_ride_confirm = async (zone, contact) => {
    console.log({
      km: km,
      promo: promo,
      vehicle_type: active_vehicle_type,
      payment_method: 1,
      customer_id: global.id,
      trip_type: active_trip_type,
      surge: 1,
      pickup_address: pickup_address,
      pickup_date: pickup_date,
      pickup_lat: pickup_lat,
      pickup_lng: pickup_lng,
      drop_address: drop_address,
      drop_lat: drop_lat,
      drop_lng: drop_lng,
      package_id: package_id,
      trip_sub_type: active_trip_sub_type,
      stops: JSON.stringify([]),
      zone: zone,
      contact: contact,
    });
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + ride_confirm,
      data: {
        km: km,
        promo: promo,
        vehicle_type: active_vehicle_type,
        payment_method: 1,
        customer_id: global.id,
        trip_type: active_trip_type,
        surge: 1,
        pickup_address: pickup_address,
        pickup_date: pickup_date,
        pickup_lat: pickup_lat,
        pickup_lng: pickup_lng,
        drop_address: drop_address,
        drop_lat: drop_lat,
        drop_lng: drop_lng,
        package_id: package_id,
        trip_sub_type: active_trip_sub_type,
        // stops: JSON.stringify([]),
        stops: [],
        zone: zone,
        contact: contact,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.status == 1) {
          console.log('RDR', response.data.result);
          setTripRequestId(response.data.result);
          if (response.data.booking_type == 2) {
            dropDownAlertRef({
              type: DropdownAlertType.Success,
              title: "Booking placed successfully",
              message: "You can see you bookings in my rides menu.",
            });
          }
          // booking_exit();
        } else {
          dropDownAlertRef({
            type: DropdownAlertType.Error,
            title: "Sorry",
            message: response.data.message,
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      });
  };

  const change_vehicle_type = (vehicle_type) => {
    //alert(vehicle_type+'-'+km);
    setActiveVehicleType(vehicle_type);
    //setKm(km);
  };

  const show_date_picker = () => {
    setDatePickerVisibility(true);
  };

  const hide_date_picker = () => {
    setDatePickerVisibility(false);
  };

  const handle_confirm = (date) => {
    console.warn("A date has been picked: ", date);
    hide_date_picker();
    set_default_date(new Date(date), 1);
  };

  const navigate_promo = () => {
    //navigation.navigate("Promo")
    setModalVisible(true);
  };

  const change_trip_sub_type = (id) => {
    setActiveTripSubType(id);
    get_estimation_fare_api(
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      0,
      id,
      0
    );
  };

  const load_trip_sub_types = () => {
    return trip_sub_types.map((item) => {
      return (
        <TouchableOpacity
          onPress={change_trip_sub_type.bind(this, item.id)}
          style={[
            active_trip_sub_type == item.id
              ? styles.segment_active_bg
              : styles.segment_inactive_bg,
          ]}
        >
          <Text
            style={[
              active_trip_sub_type == item.id
                ? styles.segment_active_fg
                : styles.segment_inactive_fg,
            ]}
          >
            {item.trip_sub_type}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const show_packages = () => {
    return packages.map((data) => {
      return (
        <TouchableOpacity
          onPress={select_package.bind(this, data)}
          style={{
            width: 70,
            borderColor: colors.text_grey,
            marginLeft: 5,
            marginRight: 5,
            borderRadius: 10,
            padding: 5,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.theme_fg_two,
              fontSize: 16,
              fontFamily: bold,
            }}
          >
            {data.hours} Hr
          </Text>
          <View style={{ margin: 2 }} />
          <Text
            style={{
              color: colors.text_grey,
              fontSize: 13,
              fontFamily: regular,
            }}
          >
            {data.kilometers} km
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const screen_home = () => {
    return (
      <View>
        <Animated.View
          style={[
            { transform: [{ translateY: home_comp_1 }] },
            [
              {
                position: "absolute",
                width: "100%",
                height: 60,
                alignItems: "center",
                justifyContent: "center",
              },
            ],
          ]}
        >
          {/* it appears at the top menu button , current location , faviorate */}
          <DropShadow
            style={{
              width: "90%",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          >
            <View
              activeOpacity={1}
              style={{
                width: "100%",
                backgroundColor: colors.theme_bg_three,
                borderRadius: 10,
                height: 50,
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={navigation.toggleDrawer.bind(this)}
                style={{
                  width: "15%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type={Icons.MaterialIcons}
                  name="menu"
                  color={colors.icon_active_color}
                  style={{ fontSize: 22 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={open_location.bind(this, 1)}
                style={{
                  width: "70%",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: colors.theme_fg_two,
                    fontSize: 14,
                    fontFamily: normal,
                  }}
                >
                  {pickup_address}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => fav_RBSheet.current.open()}
                style={{
                  width: "15%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type={Icons.MaterialIcons}
                  name="favorite-border"
                  color={colors.icon_inactive_color}
                  style={{ fontSize: 22 }}
                />
              </TouchableOpacity>
            </View>
          </DropShadow>
        </Animated.View>

        <Animated.View
          style={[
            { transform: [{ translateY: home_comp_2 }] },
            [
              {
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: 180,
                backgroundColor: colors.theme_bg_three,
              },
            ],
          ]}
        >
          {/*<View style={{flexDirection: 'row'}}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                {load_trip_types()}
              </ScrollView>
            </View>*/}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            {load_trip_types()}
          </View>

          <View style={{ margin: 5 }} />
          {active_trip_type != 2 ? (
            <View>
              <DropShadow
                style={{
                  width: "100%",
                  padding: 10,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                }}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={open_location.bind(this, 2)}
                  style={{
                    width: "100%",
                    backgroundColor: colors.theme_bg_three,
                    borderRadius: 10,
                    height: 50,
                    flexDirection: "row",
                  }}
                >
                  <View
                    style={{
                      width: "15%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      type={Icons.MaterialIcons}
                      name="search"
                      color={colors.theme_fg_two}
                      style={{ fontSize: 30 }}
                    />
                  </View>
                  <View
                    style={{
                      width: "85%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.theme_fg_two,
                        fontSize: 16,
                        color: colors.text_grey,
                      }}
                    >
                      Where are u going?
                    </Text>
                  </View>
                </TouchableOpacity>
              </DropShadow>
            </View>
          ) : (
            <View style={{ height: 60, flexDirection: "row" }}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {show_packages()}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  const screen_location = () => {
    return (
      <SafeAreaView>
        <Animated.View
          style={[
            { transform: [{ translateY: drop_comp_3 }] },
            [
              {
                position: "absolute",
                width: "100%",
                height: 100,
                alignItems: "center",
                paddingBottom: 10,
                justifyContent: "center",
                backgroundColor: colors.theme_bg_three,
                paddingVertical: 20,
              },
            ],
          ]}
        >
          <View style={{ flexDirection: "row", height: 90, width: "100%" }}>
            <TouchableOpacity
              onPress={back_to_home_screen.bind(this)}
              style={{
                width: "20%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.MaterialIcons}
                name="arrow-back"
                color={colors.icon_active_color}
                style={{ fontSize: 22 }}
              />
            </TouchableOpacity>
            <View
              style={{
                width: "80%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 18,
                  fontFamily: bold,
                }}
              >
                {active_location == 1 ? "Pick up" : "Destination"}
              </Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View
          style={[
            { transform: [{ translateY: drop_comp_2 }] },
            [
              {
                position: "absolute",
                bottom: 10,
                width: "100%",
                height: 100,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 25,
              },
            ],
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={confirm_location.bind(this)}
            style={{
              width: "90%",
              backgroundColor: colors.btn_color,
              borderRadius: 10,
              height: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                color: colors.theme_fg_two,
                fontSize: 16,
                color: colors.theme_fg_three,
                fontFamily: bold,
              }}
            >
              Confirm Location
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            { transform: [{ translateY: drop_comp_4 }] },
            [
              {
                position: "absolute",
                width: "100%",
                height: screenHeight - 100,
                alignItems: "center",
                paddingBottom: 10,
                justifyContent: "flex-start",
                backgroundColor: colors.theme_bg_three,
              },
            ],
          ]}
        >
          <View style={{ margin: 30 }} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={search_exit.bind(this)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              borderColor: colors.grey,
            }}
          >
            <Icon
              type={Icons.MaterialIcons}
              name="location-on"
              color={colors.icon_inactive_color}
              style={{ fontSize: 22 }}
            />
            <View style={{ margin: 5 }} />
            <Text
              style={{
                fontSize: 18,
                color: colors.text_grey,
                fontFamily: bold,
              }}
            >
              Locate on map
            </Text>
          </TouchableOpacity>
          <View style={{ margin: 10 }} />
          <ScrollView>
            <Text
              style={{
                fontSize: 18,
                color: colors.text_grey,
                fontFamily: bold,
                marginLeft: 10,
                textAlign: "center",
              }}
            >
              Recent Places
            </Text>
            <ScrollView style={{ width: "100%", padding: 10 }}>
              {recent_places_list()}
              <View style={{ margin: 10 }} />
            </ScrollView>
            <Text
              style={{
                fontSize: 18,
                color: colors.text_grey,
                fontFamily: bold,
                marginLeft: 10,
                textAlign: "center",
              }}
            >
              Favourites
            </Text>
            <ScrollView style={{ width: "100%", padding: 10 }}>
              {favourites_list()}
              <View style={{ margin: 10 }} />
            </ScrollView>
          </ScrollView>
        </Animated.View>
        <Animated.View
          style={[
            { transform: [{ translateY: drop_comp_1 }] },
            [
              {
                position: "absolute",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              },
            ],
          ]}
        >
          <DropShadow
            style={{
              width: "90%",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          >
            <View
              style={{
                borderRadius: 10,
                marginTop: 10,
                backgroundColor: colors.theme_bg_three,
              }}
            >
              <GooglePlacesAutocomplete
                ref={search}
                minLength={2}
                placeholder={
                  active_location == 1
                    ? "Enter the pick up"
                    : "Enter the destination"
                }
                listViewDisplayed="auto"
                fetchDetails={true}
                GooglePlacesSearchQuery={{
                  rankby: "distance",
                  types: "food",
                }}
                debounce={200}
                filterReverseGeocodingByTypes={[
                  "locality",
                  "administrative_area_level_3",
                ]}
                textInputProps={{
                  onFocus: () => is_focus(),
                  placeholderTextColor: colors.text_grey,
                  returnKeyType: "search",
                }}
                styles={{
                  textInputContainer: {
                    backgroundColor: colors.theme_bg_three,
                    borderRadius: 10,
                  },
                  description: {
                    color: "#000",
                  },
                  textInput: {
                    height: 45,
                    color: colors.theme_fg_two,
                    fontFamily: normal,
                    fontSize: 14,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                  },
                  predefinedPlacesDescription: {
                    color: colors.theme_fg_two,
                  },
                }}
                currentLocation={true}
                enableHighAccuracyLocation={true}
                onPress={(data, details = null) => {
                  get_location(data, details);
                }}
                query={{
                  key: GOOGLE_KEY,
                  language: "en",
                  radius: "1500",
                  location: pickup_lat + "," + pickup_lng,
                  types: ["geocode", "address"],
                }}
              />
            </View>
          </DropShadow>
        </Animated.View>
      </SafeAreaView>
    );
  };

  const screen_booking = () => {
    return (
      <View>
        {!current_location_status && (
          <DropShadow
            style={{
              width: "100%",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 25,
            }}
          >
            <TouchableOpacity
              activeOpacity={0}
              onPress={booking_exit.bind(this)}
              style={{
                width: 40,
                height: 40,
                backgroundColor: colors.theme_bg_three,
                borderRadius: 25,
                alignItems: "center",
                justifyContent: "center",
                top: 20,
                left: 20,
              }}
            >
              <Icon
                type={Icons.MaterialIcons}
                name="arrow-back"
                color={colors.icon_active_color}
                style={{ fontSize: 22 }}
              />
            </TouchableOpacity>
          </DropShadow>
        )}
        <Animated.View
          style={[
            { transform: [{ translateY: book_comp_1 }] },
            [
              {
                position: "absolute",
                width: "100%",
                height: screenHeight - 260,
                paddingBottom: 10,
                justifyContent: "flex-start",
                backgroundColor: colors.theme_bg_three,
              },
            ],
          ]}
        >
          <View style={{ width: "100%", height: 100 }}>
            <DropShadow
              style={{
                width: "100%",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={booking_exit.bind(this)}
                style={{
                  width: "100%",
                  backgroundColor: colors.theme_bg_three,
                }}
              >
                <View
                  style={{ flexDirection: "row", width: "80%", height: 50 }}
                >
                  <View
                    style={{
                      width: "10%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Badge status="success" backgroundColor="green" size={10} />
                  </View>
                  <View style={{ margin: 5 }} />
                  <View
                    style={{
                      width: "75%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: colors.theme_fg_two,
                        fontSize: 13,
                        fontFamily: normal,
                      }}
                    >
                      {pickup_address}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <Divider style={{ backgroundColor: colors.grey }} />
              {active_trip_type == 2 ? (
                <TouchableOpacity
                  activeOpacity={1}
                  style={{
                    width: "100%",
                    backgroundColor: colors.theme_bg_three,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 20,
                      marginBottom: 20,
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                  >
                    <View style={{ width: "10%" }}>
                      <Icon
                        type={Icons.MaterialIcons}
                        name="schedule"
                        color={colors.icon_inactive_color}
                        style={{ fontSize: 22 }}
                      />
                    </View>
                    <View style={{ width: "90%" }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: colors.theme_fg_two,
                          fontSize: 16,
                          fontFamily: bold,
                        }}
                      >
                        {package_hr} hrs {package_km} km package
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={booking_exit.bind(this)}
                  style={{
                    width: "100%",
                    backgroundColor: colors.theme_bg_three,
                  }}
                >
                  <View
                    style={{ flexDirection: "row", width: "80%", height: 50 }}
                  >
                    <View
                      style={{
                        width: "10%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Badge status="error" backgroundColor="red" size={10} />
                    </View>
                    <View style={{ margin: 5 }} />
                    <View
                      style={{
                        width: "75%",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: colors.theme_fg_two,
                          fontSize: 13,
                          fontFamily: normal,
                        }}
                      >
                        {drop_address}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              {active_trip_type != 5 && (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={show_date_picker.bind(this)}
                  style={{
                    padding: 10,
                    position: "absolute",
                    height: 50,
                    backgroundColor: colors.theme_bg_three,
                    right: 10,
                    top: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.theme_bg,
                  }}
                >
                  {pickup_date_label == "Now" ? (
                    <View
                      style={{
                        width: 50,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        type={Icons.MaterialIcons}
                        name="schedule"
                        color={colors.icon_inactive_color}
                        style={{ fontSize: 20 }}
                      />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: colors.theme_fg_two,
                          fontSize: 12,
                          fontFamily: bold,
                        }}
                      >
                        {pickup_date_label}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 70,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        numberOfLines={2}
                      //  ellipsizeMode="tail"
                        style={{
                          color: colors.theme_fg_two,
                          fontSize: 12,
                          fontFamily: bold,
                        }}
                      >
                        {pickup_date_label}
                      </Text>
                      <Text
                        numberOfLines={2}
                      //  ellipsizeMode="tail"
                        style={{
                          color: colors.theme_fg_two,
                          fontSize: 12,
                          fontFamily: bold,
                        }}
                      >
                        {pickup_time_label}
                      </Text>

                    </View>
                  )}
                </TouchableOpacity>
              )}
            </DropShadow>
          </View>


          {loading ? (
            <View style={{flex: 1, width: "90%",justifyContent: 'center', alignSelf: "center", alignItems: 'center' }}>
              <LottieView
                style={{width: 70, height: 70 }}
                source={btn_loader}
                autoPlay
                loop
              />
            </View>
          ) : (
            <>
            <ScrollView>
              <View
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  flexDirection: "row",
                  flex: 1,
                  backgroundColor: colors.theme_bg_three,
                }}
              >
                {load_trip_sub_types()}
              </View>
              <View style={{ padding: 5 }}>
                <Text
                  style={{
                    color: colors.theme_fg_two,
                    fontSize: 16,
                    fontFamily: bold,
                  }}
                >
                  Available rides
                </Text>
                <View style={{ margin: 8 }} />
                {estimation_fare_list()}
              </View>
            </ScrollView>
          <View
          style={{
            height: 135,
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: Platform.OS === 'ios' ? 40 : 0,
          }}
          >
            <View
              style={{
                width: "100%",
                height: 30,
                backgroundColor: colors.theme_bg,
                alignItems: "center",
                justifyContent: "center",
              }}
              >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: colors.theme_fg_three,
                  fontSize: 12,
                  fontFamily: normal,
                  letterSpacing: 1,
                }}
                >
                You have {global.currency}
                {wallet} in your wallet !
              </Text>
            </View>
            <View style={{ height: 40, width: "100%", flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  width: "46%",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
                >
                <Image source={money_icon} style={{ width: 30, height: 40 }} />
                <View style={{ margin: 5 }} />
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.theme_fg_two,
                    fontSize: 16,
                    fontFamily: bold,
                  }}
                  >
                  Cash
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  margin: "2%",
                  borderLeftWidth: 1,
                  borderColor: colors.grey,
                }}
                />
              <TouchableOpacity
                activeOpacity={1}
                onPress={navigate_promo.bind(this)}
                style={{
                  width: "49%",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
                >
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.theme_fg_two,
                    fontSize: 16,
                    fontFamily: bold,
                  }}
                  >
                  Coupons
                </Text>
                <View style={{ margin: 5 }} />
                <Image
                  source={discount_icon}
                  style={{ width: 30, height: 30 }}
                  />
              </TouchableOpacity>
            </View>
            {loading == false ? (
              <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                height: 50,
              }}
              >
                <TouchableOpacity
                  onPress={call_zone.bind(this, "null")}
                  activeOpacity={1}
                  style={{
                    width: "42%",
                    backgroundColor: colors.btn_color,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  >
                  <Text
                    style={{
                      color: colors.theme_fg_two,
                      fontSize: 16,
                      color: colors.theme_fg_three,
                      fontFamily: bold,
                      padding: 10,
                    }}
                    >
                    Book Self
                  </Text>
                </TouchableOpacity>
                <View style={{ margin: 5 }} />
                <TouchableOpacity
                  onPress={() => add_contact_RBSheet.current.open()}
                  activeOpacity={1}
                  style={{
                    width: "45%",
                    backgroundColor: colors.btn_color,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  >
                  <Text
                    style={{
                      color: colors.theme_fg_two,
                      fontSize: 16,
                      color: colors.theme_fg_three,
                      fontFamily: bold,
                      padding: 10,
                    }}
                    >
                    Book for others
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ height: 50, width: "90%", alignSelf: "center" }}>
                <LottieView
                  style={{ flex: 1 }}
                  source={btn_loader}
                  autoPlay
                  loop
                  />
              </View>
            )}
          </View>
                  </>)}
        </Animated.View>
      </View>
    );
  };

  const rb_favourite = () => {
    return (
      <RBSheet
        ref={fav_RBSheet}
        height={170}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: 10,
          },
        }}
      >
        <View style={{ padding: 10, width: "100%" }}>
          <Text
            style={{
              color: colors.theme_fg_two,
              fontSize: 25,
              fontFamily: normal,
            }}
          >
            Save as favourite
          </Text>
          <View style={{ margin: 5 }} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: colors.theme_fg_two,
              fontSize: 16,
              fontFamily: regular,
            }}
          >
            {pickup_address}
          </Text>
        </View>
        <View style={{ margin: 10 }} />
        <View style={{ flexDirection: "row", width: "100%" }}>
          <View style={{ width: "1%" }} />
          <View
            style={{
              width: "48%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => fav_RBSheet.current.close()}
              style={{
                width: "100%",
                backgroundColor: colors.lite_grey,
                borderRadius: 5,
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 16,
                  color: colors.theme_fg_two,
                  fontFamily: bold,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: "1%" }} />
          <View
            style={{
              width: "48%",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-end",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => add_favourite_api()}
              style={{
                width: "100%",
                backgroundColor: colors.btn_color,
                borderRadius: 5,
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 16,
                  color: colors.theme_fg_three,
                  fontFamily: bold,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
    );
  };

  const rb_add_contact = () => {
    return (
      <RBSheet
        ref={add_contact_RBSheet}
        height={250}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: 10,
          },
        }}
      >
        <View style={{ padding: 10, width: "100%" }}>
          <Text
            style={{
              color: colors.theme_fg_two,
              fontSize: 25,
              fontFamily: normal,
            }}
          >
            Someone else taking this ride ?
          </Text>
          <View style={{ margin: 5 }} />
          {/* <TextInput
            ref={inputRef}
            secureTextEntry={false}
            placeholder="Enter Contact Number"
            placeholderTextColor={colors.grey}
            style={styles.textinput}
            onChangeText={(TextInputValue) => setContactNumber(TextInputValue)}
          /> */}
          <PhoneInput 
            style={{ borderBottomColor: colors.theme_bg_two }}
            flagStyle={styles.flag_style}
            ref={inputRef}
            initialCountry="in" 
            offset={10}
            textStyle={styles.country_text}
            onPressFlag={() => {}}
            textProps={{
              placeholder: 'Enter Contact Number',
              placeholderTextColor: colors.theme_fg_two
            }}
            onChangePhoneNumber={(TextInputValue) => setContactNumber(TextInputValue)}
            autoFormat={true}
            
             />
        </View>
        <View style={{ margin: 10 }} />
        <View style={{ flexDirection: "row", width: "100%" }}>
          <View style={{ width: "1%" }} />
          <View
            style={{
              width: "48%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => add_contact_RBSheet.current.close()}
              style={{
                width: "100%",
                backgroundColor: colors.lite_grey,
                borderRadius: 5,
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 16,
                  color: colors.theme_fg_two,
                  fontFamily: bold,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: "1%" }} />
          <View
            style={{
              width: "48%",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-end",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={call_contact_number_validation.bind()}
              style={{
                width: "100%",
                backgroundColor: colors.btn_color,
                borderRadius: 5,
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 16,
                  color: colors.theme_fg_three,
                  fontFamily: bold,
                }}
              >
                Book Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
    );
  };

  const call_contact_number_validation = () => {
    if (contact_number == "") {
      alert("Enter phone number to contct");
    } else {
      call_zone(contact_number);
    }
  };

  const cancel_request = () => {
    setLoading(true);
    // console.log({ trip_request_id: trip_request_id })
    axios({
      method: "post",
      url: api_url + trip_request_cancel,
      data: { trip_request_id: trip_request_id },
    })
      .then(async (response) => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log('cancel request func ',error);
      });
  };

  const search_dialog = () => {
    return (
      <Modal isVisible={search_status} width="90%">
        {/* <Dialog.Description> */}
          <View
            style={{
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.theme_bg_three,
            }}
          >
            <View style={{ alignItems: "center", padding: 20 }}>
              <LottieView
                style={{ height: 100, width: 100 }}
                source={search_loader}
                autoPlay
                loop
              />
            </View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: bold,
                color: colors.theme_fg_two,
              }}
            >
              Please wait while searching the driver...
            </Text>
            <View style={{ margin: 10 }} />
            {loading == false ? (
              <TouchableOpacity
                style={{ padding: 10 }}
                activeOpacity={1}
                onPress={cancel_request.bind(this)}
              >
                <Text
                  onPress={cancel_request.bind(this)}
                  style={{
                    color: "red",
                    fontSize: f_m,
                    fontFamily: bold,
                    alignSelf: "center",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: 50, width: "100%", alignSelf: "center" }}>
                <LottieView
                  style={{ flex: 1 }}
                  source={btn_loader}
                  autoPlay
                  loop
                />
              </View>
            )}
          </View>
        {/* </Dialog.Description> */}
      </Modal>
    );
  };

  const date_picker = () => {
    return (
      <DateTimePickerModal
        isVisible={is_date_picker_visible}
        mode="datetime"
        date={new Date()}
        minimumDate={new Date(Date.now() + 10 * 60 * 1000)}
        is24Hour={false}
        onConfirm={handle_confirm}
        onCancel={hide_date_picker}
      />
    );
  };

  const modal = () => {
    return (
      <View style={{ flex: 1 }}>
        <Modal
          isVisible={is_modal_visible}
          animationInTiming={500}
          animationOutTiming={500}
          onBackdropPress={() => setModalVisible(false)}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={{
            width: "90%",
            height: "60%",
            backgroundColor: colors.theme_bg_three,
            borderRadius: 10,
          }}
        >
          <View style={{ width: "100%", flexDirection: "row", padding: 20 }}>
            <View
              style={{
                width: "80%",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_two,
                  fontSize: 20,
                  fontFamily: bold,
                }}
              >
                Promo Codes
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleModal.bind(this)}
              style={{
                width: "20%",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.MaterialIcons}
                name="close"
                color={colors.icon_inactive_color}
                style={{ fontSize: 30 }}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={promo_list}
            renderItem={show_promo_list}
            keyExtractor={(item) => item.id}
          />
        </Modal>
      </View>
    );
  };

  const show_promo_list = ({ item }) => (
    <View style={{ alignItems: "center", borderBottomWidth: 0.5 }}>
      <View
        style={{
          width: "100%",
          backgroundColor: colors.theme_bg_three,
          borderRadius: 10,
          padding: 20,
          marginTop: 5,
          marginBottom: 5,
        }}
      >
        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.theme_fg_two,
              fontSize: 16,
              fontFamily: bold,
            }}
          >
            {item.promo_name}
          </Text>
          <View style={{ margin: 3 }} />
          <Text
            style={{
              color: colors.theme_fg_two,
              fontSize: 14,
              fontFamily: regular,
            }}
          >
            {item.description}
          </Text>
        </View>
        <View style={{ margin: 5 }} />
        <View
          style={{
            width: "100%",
            borderRadius: 10,
            flexDirection: "row",
            borderWidth: 1,
            padding: 10,
            backgroundColor: colors.text_container_bg,
            borderStyle: "dotted",
          }}
        >
          <View
            style={{
              width: "70%",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: colors.theme_fg,
                fontSize: 16,
                fontFamily: normal,
              }}
            >
              {global.currency}
              {item.discount}OFF
            </Text>
          </View>
          {loading == true ? (
            <View style={{ height: 50, width: "90%", alignSelf: "center" }}>
              <LottieView
                style={{ flex: 1 }}
                source={btn_loader}
                autoPlay
                loop
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={call_apply_promo.bind(this, item)}
              activeOpacity={1}
              style={{
                width: "30%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.theme_bg,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: 14,
                  fontFamily: normal,
                }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.theme_bg} />
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={map_ref}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={current_location_status}
        onRegionChangeComplete={(region) => {
          console.log("khokho", region);
          region_change(region);
        }}
      >
        {render_vehicles()}
      </MapView>
      <View
        style={{
          height: 100,
          width: 100,
          alignSelf: "center",
          position: "absolute",
          top: screenHeight / 2 - 25,
        }}
      >
        <LottieView style={{ flex: 1 }} source={pin_marker} autoPlay loop />
      </View>
      {screen_home()}
      {screen_location()}
      {screen_booking()}
      {rb_favourite()}
      {rb_add_contact()}
      {date_picker()}
      {search_dialog()}
      {modal()}
      <DropdownAlert alert={(func) => (dropDownAlertRef = func)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //  ...StyleSheet.absoluteFillObject,
    // height: screenHeight,
    width: screenWidth,
  },
  map: {
    height: screenHeight,
    ...StyleSheet.absoluteFillObject,
  },
  vehicle_img: {
    height: 40,
    width: 55,
  },
  active_vehicle_img: {
    height: 40,
    width: 80,
  },
  active_trip_type_label: {
    color: colors.theme_fg_two,
    fontSize: 12,
    fontFamily: bold,
  },
  inactive_trip_type_label: {
    color: colors.text_grey,
    fontSize: 12,
    fontFamily: normal,
  },
  flag_style: {
    width: 38,
    height: 24
},
  segment_active_bg: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    marginLeft: "1%",
    marginRight: "1%",
    backgroundColor: colors.theme_bg,
    borderRadius: 10,
  },
  segment_active_fg: {
    color: colors.theme_fg_two,
    fontSize: 14,
    fontFamily: bold,
    color: colors.theme_fg_three,
  },
  segment_inactive_bg: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    marginLeft: "1%",
    marginRight: "1%",
    backgroundColor: colors.lite_bg,
    borderRadius: 10,
  },
  segment_inactive_fg: {
    color: colors.theme_fg_two,
    fontSize: 14,
    fontFamily: normal,
    color: colors.theme_fg_two,
  },
  textinput: {
    fontSize: f_m,
    color: colors.grey,
    fontFamily: regular,
    height: 60,
    backgroundColor: colors.text_container_bg,
    width: "100%",
  },
  country_text: {
    fontSize: 18,
    borderBottomWidth: 1,
    paddingBottom: 8,
    height: 35,
    fontFamily: regular,
    color: colors.theme_fg_two
},
});

function mapStateToProps(state) {
  return {
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

export default connect(mapStateToProps, null)(Dashboard);