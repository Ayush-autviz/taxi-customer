//Fixed
import React, { useState, useEffect } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    ImageBackground,
    StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { bold, img_url, chat_bg, f_xl } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import database from '@react-native-firebase/database';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import { SafeAreaView } from "react-native-safe-area-context";

var Sound = require('react-native-sound');

Sound.setCategory('Playback');

var whoosh = new Sound('notification.wav', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

});

const Chat = (props) => {
    const navigation = useNavigation();
    const route = useRoute();
    const [trip_id,setTripId] = useState(route.params.trip_id)
    const [first_name, setfirst_name] = useState(route.params.first_name)
    const [messages,setMessages] = useState([])
    
    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        refOn(message => setMessages(oldArray => [message, ...oldArray]));
        const _unblur = navigation.addListener('blur', async () => {
            whoosh.stop();
        });
        return _unblur;
    }, []);

    const refOn = callback => {
        database().ref(`/chat/${trip_id}`)
          .limitToLast(20)
          .on('child_added', snapshot => callback(parse(snapshot)));
    }

    const parse = snapshot => {
        if(messages.length > 0){
          notification_sound();
        }
        const { text, user } = snapshot.val();
        const { key: _id } = snapshot;
        const message = {_id, text, user };
        return message;
    };

    const onSend = messages => {
        for (let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];
            const message = {text, user };
            database().ref(`/chat/${trip_id}`).push(message);
        }
    }
    
    const notification_sound  = () => {
        whoosh.play();
    }

    const renderInputToolbar = (props)=> {
        //Add the extra styles via containerStyle
       return <InputToolbar {...props} containerStyle={{
        borderRadius: 999, // Rounded corners
        marginHorizontal: 10, // Margins to add spacing from the sides
        backgroundColor: '#fff', // Background color to match the rest
        borderTopWidth: 0, // Remove any default border
        shadowColor: 'transparent', // Remove any shadow
        elevation: 0, // Remove shadow on Android
    }} />
     }

    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: colors.theme_fg,
                    },
                    left: {
                        backgroundColor: "#fff",  // Background color for other user's message
                    }
                }}
                textStyle={{
                    right: {
                        color: '#fff'  // Text color for current user's message
                    },
                    left: {
                        color: '#000'  // Text color for other user's message
                    }
                }}
            />
        );
    };

    

    return (
        <SafeAreaView style={{flex:1}}>
        <ImageBackground
            source={chat_bg}
            resizeMode='cover'
            style={{flex: 1 ,width: '100%', height: '100%'}}
        >
            <StatusBar
                backgroundColor={colors.theme_bg}
            />

            <View style={[styles.header]}>
                <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_three} style={{ fontSize: 30 }} />
                </TouchableOpacity>
                <View activeOpacity={1} style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_xl, fontFamily: bold }}>{`Chat with ${first_name}`}</Text>
                </View>
            </View>
           
            <GiftedChat
        
                messages={messages}
                onSend={messages => onSend(messages)}
                textInputStyle={{
                    color: colors.theme_fg_two, 
                    marginTop:10,
                    padding:5

                }}
                user={{
                    _id: global.id+'-Cr',
                    name: global.first_name,
                    avatar: img_url + global.profile_picture
                }}
                showUserAvatar
                renderInputToolbar={renderInputToolbar} 
                renderBubble={renderBubble} 
            />
          
        </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: colors.theme_bg,
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default Chat;