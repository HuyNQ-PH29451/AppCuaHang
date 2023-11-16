import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native-elements";
import { Button, Text, Modal, Card, Input, Radio } from "@ui-kitten/components";
import API from "../Config";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const Settings = ({ navigation }) => {
    const [visible, setVisible] = useState(false);
    const [staff, setStaff] = useState(null);

    useEffect(() => {
        getCurrentStaff();
    }, []);

    // close modal
    const closeModal = () => {
        getCurrentStaff();
        setVisible(false);
    };

    // get current staff
    const getCurrentStaff = () => {
        AsyncStorage.getItem("staff")
            .then((res) => JSON.parse(res))
            .then((res) => {
                setStaff(res);
            });
    };

    // pick image from device
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
                setStaff({
                    ...staff,
                    avatar: img_source,
                });
            });
        }
    };

    // saveChangeInfo
    const saveChangeInfo = () => {
        if (staff.email == "" || staff.name == "" || staff.password == "") {
            Alert.alert("Error", "please fill below the input!");
            return;
        }

        fetch(`${API}staffs/${staff.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(staff),
        }).then((res) => {
            res.ok
                ? (() => {
                      AsyncStorage.setItem("staff", JSON.stringify(staff))
                          .then(closeModal)
                          .catch(() =>
                              Alert.alert(
                                  "Error",
                                  "Can not edit this staff now!",
                              ),
                          );
                  })()
                : Alert.alert("Error", "Can not edit this staff now!");
        });
    };

    // Log out
    const logout = () => {
        AsyncStorage.removeItem("staff").then(() =>
            navigation.replace("Login"),
        );
    };

    return staff ? (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                flexDirection: "column",
            }}
        >
            <View
                style={{
                    alignItems: "center",
                    padding: 28,
                    backgroundColor: "#fff",
                    borderRadius: 26,
                    width: "80%",
                }}
            >
                <Image
                    source={{ uri: staff.avatar }}
                    style={{
                        width: 128,
                        height: 128,
                        borderRadius: 100,
                        margin: 10,
                    }}
                />
                <Text
                    status="primary"
                    style={{ fontWeight: "bold", fontSize: 20 }}
                >
                    {staff.name}
                </Text>
                <Text style={{ fontStyle: "italic", color: "gray" }}>
                    {staff.email}
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 28,
                    }}
                >
                    {staff.isAdmin ? (
                        <Button
                            style={{ margin: 5, borderRadius: 26 }}
                            status="basic"
                            onPress={() => setVisible(true)}
                        >
                            Edit Account
                        </Button>
                    ) : null}

                    <Button
                        style={{ margin: 5, borderRadius: 26 }}
                        status="danger"
                        onPress={logout}
                    >
                        Log out
                    </Button>
                </View>
            </View>

            {/* Modal edit profile */}
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
                        Change information
                    </Text>

                    <View
                        style={{
                            alignItems: "center",
                        }}
                    >
                        <Image
                            onPress={pickImage}
                            source={{ uri: staff.avatar }}
                            style={{
                                width: 64,
                                height: 64,
                                marginBottom: 15,
                                borderRadius: 100,
                            }}
                        />
                        <View>
                            {/* edit name */}
                            <Input
                                style={{ width: "100%", marginVertical: 4 }}
                                placeholder="name..."
                                value={staff.name}
                                onChangeText={(e) =>
                                    setStaff({ ...staff, name: e })
                                }
                            />
                            {/* edit email */}
                            <Input
                                style={{ width: "100%", marginVertical: 4 }}
                                placeholder="email..."
                                value={staff.email}
                                onChangeText={(e) =>
                                    setStaff({ ...staff, email: e })
                                }
                            />
                            {/* edit password */}
                            <Input
                                style={{ width: "100%", marginVertical: 4 }}
                                placeholder="password..."
                                value={staff.password}
                                onChangeText={(e) =>
                                    setStaff({ ...staff, password: e })
                                }
                            />
                            {/* edit permission */}
                            <Radio
                                style={{ marginVertical: 8, marginStart: 4 }}
                                checked={staff.isAdmin}
                                onChange={(e) =>
                                    setStaff({ ...staff, isAdmin: e })
                                }
                            >
                                {`Set me as admin`}
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

                        <Button
                            onPress={saveChangeInfo}
                            style={{ borderRadius: 26 }}
                        >
                            Save
                        </Button>
                    </View>
                </Card>
            </Modal>
        </View>
    ) : null;
};

export default Settings;

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});
