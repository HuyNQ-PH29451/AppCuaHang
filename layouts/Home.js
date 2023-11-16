import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const { Navigator, Screen } = createBottomTabNavigator();

import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import Products from "../screens/Products";
import Categories from "../screens/Categories";
import Staffs from "../screens/Staffs";
import Settings from "../screens/Settings";

const BottomTabBar = ({ navigation, state, setStaff }) => (
    <BottomNavigation
        selectedIndex={state.index}
        onSelect={(index) =>
            navigation.navigate(state.routeNames[index], { setStaff: setStaff })
        }
    >
        <BottomNavigationTab title="Products" />
        <BottomNavigationTab title="Categories" />
        <BottomNavigationTab title="Staffs" />
        <BottomNavigationTab title="Settings" />
    </BottomNavigation>
);

const Home = ({ setStaff }) => {
    return (
        // <NavigationContainer>
        <Navigator
            tabBar={(props) => <BottomTabBar {...props} setStaff={setStaff} />}
        >
            <Screen name="Products" component={Products} />
            <Screen name="Categories" component={Categories} />
            <Screen name="Staffs" component={Staffs} />
            <Screen
                name="Settings"
                component={Settings}
                options={{ headerShown: false }}
            />
        </Navigator>
        // </NavigationContainer>
    );
};

export default Home;
