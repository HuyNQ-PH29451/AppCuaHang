import { StatusBar } from "expo-status-bar";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import Home from "./layouts/Home";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Login from "./layouts/Login";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

export default function App() {
    const [staff, setStaff] = useState(null);
    const getStaff = async () => {
        try {
            const e = await AsyncStorage.getItem("staff");
            if (e) {
                setStaff(JSON.parse(e));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getStaff();
    }, []);

    const Page = () => {
        const Stack = createStackNavigator();

        return (
            <Stack.Navigator
                initialRouteName={staff ? "Home" : "Login"}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Login" component={Login} />
            </Stack.Navigator>
        );
    };

    return (
        <ApplicationProvider {...eva} theme={eva.light}>
            <NavigationContainer>
                <Page />
            </NavigationContainer>
            <StatusBar style="auto" />
        </ApplicationProvider>
    );
}
