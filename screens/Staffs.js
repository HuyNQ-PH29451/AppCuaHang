import React, { useEffect, useState } from "react";
import API from "../Config";
import { Input, Button, Modal, Card, Radio, Text } from "@ui-kitten/components";
import { FlatList, StyleSheet, View } from "react-native";
import StaffItem from "../components/StaffItem";
import { Image } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as yup from "yup";
import { Alert } from "react-native";
import { RefreshControl } from "react-native";

const Staffs = () => {
  const [listStaff, setListStaff] = useState([]);
  const [visible, setVisible] = useState(false);
  const defaultUser = {
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxA5cTf-5dh5Eusm0puHbvAhOrCRPtckzjA&usqp=CAU",
    email: "",
    isAdmin: false,
    name: "",
    password: "",
  };
  const [user, setUser] = useState(defaultUser);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewStaff, setIsNewStaff] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const staffSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters long")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
  });

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await getListStaff();

      setRefreshing(false);
    } catch (error) {
      console.error(error);
      setRefreshing(false);
    }
  };

  const onSearchStaff = (e) => {
    e !== ""
      ? setListStaff(
          listStaff.filter(
            (i) =>
              i.name.toLowerCase().includes(e.toLowerCase()) &&
              i.id !== currentUser.id
          )
        )
      : getListStaff();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      let _uri = result.assets[0].uri;
      let file_ext = _uri.substring(_uri.lastIndexOf(".") + 1);

      FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: "base64",
      }).then((res) => {
        img_source = `data:image/${file_ext};base64,${res}`;
        setUser({
          ...user,
          avatar: img_source,
        });
      });
    }
  };

  const showModal = (e) => {
    if (currentUser.isAdmin) {
      setIsNewStaff(!e);
      setUser(defaultUser);
      if (e) {
        // If editing an existing staff member
        setUser(e);
      }
      setVisible(!visible);
    } else {
      Alert.alert("You have no permission to access!");
    }
  };

  const closeModal = () => {
    setUser(defaultUser);
    setVisible(!visible);
    setIsNewStaff(false);
  };

  const onSaveUpdate = async () => {
    try {
      await staffSchema.validate(user);
      const method = isNewStaff ? "POST" : "PUT";
      const endpoint = isNewStaff ? "staffs" : `staffs/${user.id}`;

      const response = await fetch(API + endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        getListStaff();
        closeModal();
      } else {
        Alert.alert("Error", "Could not create/update this staff now!");
      }
    } catch (error) {
      Alert.alert("Validation Error", error.message);
    }
  };

  const onDelete = async (id) => {
    const response = await fetch(API + `staffs/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      getListStaff();
    } else {
      Alert.alert("Error", "Could not delete this staff now!");
    }
  };
  const showConfirmationDialog = (id) => {
    Alert.alert(
        "Delete Staff Member",
        "Are you sure you want to delete this staff member?",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                onPress: () => onDelete(id), 
                style: "destructive",
            },
        ]
    );
};


  const getListStaff = () => {
    fetch(`${API}staffs`)
      .then((res) => res.json())
      .then((res) => {
        setListStaff(res);
      });
  };

  const getCurrentUser = () => {
    AsyncStorage.getItem("staff")
      .then((res) => JSON.parse(res))
      .then((res) => {
        if (res) {
          setCurrentUser(res);
        }
      });
  };

  useEffect(() => {
    getCurrentUser();
    getListStaff();
  }, []);

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: "bold", margin: 5 }}>
        All Staff
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Input
          onChangeText={(e) => onSearchStaff(e)}
          placeholder="Search..."
          style={{
            width: "80%",
            marginHorizontal: 5,
            borderRadius: 26,
          }}
        />
        <Button
          style={{
            marginRight: 5,
            borderRadius: 26,
          }}
          onPress={() => showModal()}
        >
          New
        </Button>
      </View>

      <FlatList
        data={listStaff}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          currentUser.id === item.id ? null : (
            <StaffItem
              data={item}
              onPress={showModal}
              onDelete={() => showConfirmationDialog(item.id)}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {/* Modal edit staff */}
      <Modal
        style={{ width: "80%" }}
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={closeModal}
      >
        <Card disabled={true} style={{ borderRadius: 26 }}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              margin: 10,
            }}
          >
            Staff Information
          </Text>

          <View
            style={{
              alignItems: "center",
            }}
          >
            <Image
              onPress={pickImage}
              source={{ uri: user.avatar }}
              style={{
                width: 64,
                height: 64,
                marginBottom: 15,
                borderRadius: 100,
              }}
            />
            <View>
              {/* Edit name */}
              <Input
                style={{ width: "100%", marginVertical: 4 }}
                placeholder="Name..."
                value={user.name}
                onChangeText={(e) => setUser({ ...user, name: e })}
              />
              {/* Edit email */}
              <Input
                style={{ width: "100%", marginVertical: 4 }}
                placeholder="Email..."
                value={user.email}
                onChangeText={(e) => setUser({ ...user, email: e })}
              />
              {/* Edit password */}
              <Input
                style={{ width: "100%", marginVertical: 4 }}
                placeholder="Password..."
                value={user.password}
                onChangeText={(e) => setUser({ ...user, password: e })}
                secureTextEntry
              />
              {/* Edit permission */}
              <Radio
                style={{
                  marginVertical: 8,
                  marginStart: 4,
                }}
                checked={user.isAdmin}
                onChange={(e) => setUser({ ...user, isAdmin: e })}
              >
                Set this staff as an admin
              </Radio>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Button
              status="basic"
              onPress={closeModal}
              style={{ borderRadius: 26 }}
            >
              Cancel
            </Button>

            <Button onPress={onSaveUpdate} style={{ borderRadius: 26 }}>
              Save
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

export default Staffs;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});