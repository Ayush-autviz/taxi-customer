import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

const ContactList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const contacts = route.params.filteredContacts;

  console.log(contacts, "CoNTACTS");

  return (
    <View style={{ margin: 10 }}>
      <Text
        style={{
          color: "black",
          fontWeight: "700",
          fontSize: 18,
          marginBottom: 10,
        }}
      >
        CONTACTS
      </Text>
      {contacts && (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.recordID}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                columnGap: 30,
                marginVertical: 3,
                borderBottomWidth: 2,
                padding: 5,
              }}
              onPress={() =>
                navigation.navigate("Dashboard", {
                  number: item.phoneNumbers[0]?.number,
                  from: "ContactList",
                })
              }
            >
              <Text
                style={{
                  color: "black",
                  fontWeight: "bold",
                  //   borderWidth: 2,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  //   borderRadius: 25,
                  //   borderColor: "blue",
                }}
              >
                {item.displayName[0]}
              </Text>
              <View>
                <Text style={{ color: "black" }}>{item.displayName}</Text>
                <Text style={{ color: "black" }}>
                  {item.phoneNumbers[0]?.number}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default ContactList;

const styles = StyleSheet.create({});
