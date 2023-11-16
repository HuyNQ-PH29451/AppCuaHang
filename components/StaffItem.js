import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Icon, Image } from "react-native-elements";
import { TouchableOpacity } from "react-native";
import Octicons from "react-native-vector-icons/Octicons";

const StaffItem = ({ data, onPress }) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(data)}
            style={{
                flexDirection: "row",
                backgroundColor: "#fff",
                marginVertical: 5,
                padding: 5,
            }}
        >
            <Image
                source={{ uri: data.avatar }}
                style={{ width: 64, height: 64, margin: 5, borderRadius: 100 }}
            />
            <View style={{ marginStart: 10, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold" }}>
                    {data.name}{" "}
                    {data.isAdmin ? (
                        <Octicons name="verified" color="#2A8EDE" />
                    ) : null}
                </Text>
                <Text style={{ fontStyle: "italic", color: "gray" }}>
                    {data.email}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default StaffItem;

const styles = StyleSheet.create({});
