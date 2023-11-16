import { Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Button, Card, Input, Layout, Text } from "@ui-kitten/components";
import API from "../Config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const storeStaff = (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            AsyncStorage.setItem("staff", jsonValue).then(() =>
                navigation.replace("Home"),
            );
        } catch (e) {
            console.log("Error to store");
        }
    };

    const auth = () => {
        if (email == "" || password == "") {
            Alert.alert("Error!", "Please fill the information and try again!");
            return;
        }

        fetch(`${API}staffs?email=${email}&password=${password}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.length == 1) {
                    Alert.alert("Success!", "Login completed!");

                    storeStaff(res[0]);
                } else {
                    console.log(res);
                    Alert.alert("Error!", "Wrong email or password!");
                    return;
                }
            })
            .catch((e) => {
                Alert.alert("Error", e);
            });
    };

    return (
        <Layout style={styles.container}>
            <Card style={{ width: "80%" }}>
                <Text
                    status="primary"
                    style={{ fontWeight: "bold", margin: 5 }}
                >
                    Please login to continue!
                </Text>
                <Input
                    style={{ marginVertical: 5 }}
                    placeholder="Email address"
                    value={email}
                    onChangeText={(e) => setEmail(e)}
                />

                <Input
                    style={{ marginVertical: 5 }}
                    placeholder="Password"
                    value={password}
                    secureTextEntry
                    onChangeText={(e) => setPassword(e)}
                />

                <Button style={{ marginVertical: 5 }} onPress={auth}>
                    Log In
                </Button>
            </Card>
        </Layout>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});
