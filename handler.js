import Toast from "react-native-toast-message";
const showSuccessToast = (message) => {
    Toast.show({
        type: "success",
        text1: "Success",
        text2: message,
    });
};

export default showSuccessToast;
