import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  Button,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Modal } from "react-native";
import { ModalService } from "@ui-kitten/components";
import API from "../Config";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const Products = () => {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  //---------------------------------------------
  const [value, setValue] = useState(null);
  //---------------------------------------------
  const [data, setdata] = useState([]);
  const [data3, setdata3] = useState([]);
  const [name, setname] = useState("");
  const [amount, setamount] = useState("");
  const [price, setprice] = useState("");
  const [content, setcontent] = useState("");
  const [search, setsearch] = useState("");
  const [category, setcategory] = useState("");
  const [image, setImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modalVisible, setmodalVisible] = useState(false);
  const [modalDelete, setmodalDelete] = useState(false);
  const [modalUpdate, setmodalUpdate] = useState(false);
  const [productDetails, setproductDetails] = useState(false);
  //---------------------------------------------
  const [object, setobject] = useState({
    id: "",
    name: "",
    limit: "",
    price: "",
    photo: "",
    note: "",
    category: "",
  });

  //---------------------------------------------
  const onRefresh = () => {
    downLoadData();
    setIsRefreshing(false);
  };

  //---------------------------------------------
  const downloadcate = async () => {
    try {
      const reponse = await fetch(`${API}cats`);
      const api = await reponse.json();
      setdata3(api);
    } catch (error) {
      console.log(error);
    }
  };
  const downLoadData = async () => {
    try {
      const response = await fetch(`${API}products`);
      const apiData = await response.json();
      setdata(apiData);
    } catch (error) {
      console.log(error);
    }
  };
  //---------------------------------------------
  useEffect(() => {
    downLoadData();
    downloadcate();
  }, []);

  //---------------------------------------------
  const postData = async () => {
    try {
      // Form validation
      if (!name || !amount || !image || !price || !content || !category) {
        Alert.alert("Vui lòng điền đầy đủ thông tin");
        return;
      }

      const response = await fetch(`${API}products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          limit: amount,
          photo: image,
          price: price,
          note: content,
          category: category,
        }),
      });

      if (response.ok) {
        Alert.alert("Đã thêm thành công !");
        downLoadData();
        setmodalVisible(!modalVisible);
        //reset modal state
        setname("");
        setamount("");
        setImage(null);
        setprice("");
        setcontent("");
        setcategory("");
      } else {
        console.log("Failed to post data");
        Alert.alert("Thêm không thành công !");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //---------------------------------------------
  const UpdateProduct = async (object) => {
    const response = await fetch(`${API}products/${object.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: object.name,
        limit: object.limit,
        photo: object.photo,
        price: object.price,
        note: object.note,
        category: object.category,
      }),
    });
    if (response.ok) {
      console.log("Update successfully");
      Alert.alert("Update thành công !");
      downLoadData();
    } else {
      console.log("Update faided");
      Alert.alert("Update không thành công !");
    }
    setmodalUpdate(!modalUpdate);
  };

  const ShowAlert = ()=>{


    Alert.alert("Thông báo",
    "Bạn có muốn xóa không",
    [
    {
    text: "OK",
    onPress: ()=>{
    DeleteProduct(object);
    }
    },
    {
    text:"Cancle",
    onPress: ()=>{
    console.log("Không đồng ý");
    },
    style:"cancel"
    }
    ],
    {
    cancelable: true,
    onDismiss: ()=>{
    // hàm được gọi khi bấm ra ngoài Dialog
    console.log("Đã tắt Dialog bằng cách bấm ra ngoài");
    }
    }
    );
    
    
    }

  //---------------------------------------------
  const DeleteProduct = async (object) => {
    const response = await fetch(`${API}products/${object.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Delete successfully");
      Alert.alert("Đã xóa thành công !");
      downLoadData();
    } else {
      console.log("Delete faided");
      Alert.alert(" Xóa không thành công !");
    }
  };

  return (
    <View>
       <View style={{ margin: 10 }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 20,
                width: 200,
                fontWeight: "bold",
                marginTop: 20,
              }}
            >
              ALL PRODUCT
            </Text>
          </View>
          <View style={{ flexDirection: "row", margin: 5 }}>
           
   <TextInput
              type="text"
              placeholder="Tìm kiếm..."
              style={{
                width: 280,
                height: 40,
                borderRadius:  26,
                paddingLeft: 10,
                borderWidth: 1,
                marginTop: 10,
                
              }}
              onChangeText={(text) => {
                setsearch(text);
              }}
            ></TextInput>
            <TouchableOpacity
              onPress={() => {
                setmodalVisible(!modalVisible);
              }}
              style={{
                backgroundColor: "#00FFFF",
                width: 80,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderRadius: 26,
                marginTop: 10,
                marginBottom: 5,
                marginLeft:5,
                
              }}
            >
              <Text >New</Text>
            </TouchableOpacity>
          </View>
        </View>

      <FlatList
        style={{ height: 540 }}
        data={data.filter((prd) =>
          prd.name.toLowerCase().includes(search.toLowerCase())
        )}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View
            style={{
              margin: 5,
              backgroundColor: "white",
              padding: 5,
              flex: 0.5,
              borderRadius: 20,
            }}
          >
            <Image
              style={{
                width: 170,
                height: 200,
                marginLeft: 5,
                justifyContent: "center",
                marginTop: 5,
              }}
              source={{ uri: item.photo }}
            ></Image>

            <View style={{ padding: 5, margin: 5 ,height:200}}>
              <Text style={{ fontWeight: "bold" }}>Tên sản phẩm </Text>
              <Text style={{ color: "red" }}>{item.name}</Text>
              <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                Số lượng{" "}
              </Text>
              <Text style={{ color: "red" }}> {item.limit}</Text>

              <Text style={{ fontWeight: "bold", marginTop: 10 }}> Giá </Text>
              <Text style={{ color: "red" }}>{item.price} $</Text>

              <Text style={{ fontWeight: "bold", marginTop: 10 }}> Loại </Text>
              <Text style={{ color: "red" }}>{item.category} </Text>
            </View>
            <View style={{ flexDirection: "row", margin: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  setobject(item);
                  setmodalUpdate(!modalUpdate);
                }}
                style={{
                  backgroundColor: "green",
                  width: 80,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                }}
              >
                <Text style={{color:'white'}}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setobject(item);
                  ShowAlert();
                }}
                style={{
                  backgroundColor: "red",
                  width: 80,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                }}
              >
                <Text style={{color:'white'}}>Delete</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", margin: 5 }}>
              <TouchableOpacity
                onPress={() => {
                  setobject(item);
                  setproductDetails(!productDetails);
                }}
                style={{
                  backgroundColor: "blue",
                  width: 160,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                }}
              >
                <Text style={{color:'white'}}>Chi tiết sản phẩm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      ></FlatList>
      {/* Modal thêm */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        style={styles.modal}
      >
        <View style={styles.modalView}>
          <Text
            style={{
              fontSize: 20,
              width: 200,
              fontWeight: "bold",
              marginLeft: 60,
            }}
          >
            ADD PRODUCT
          </Text>
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 20,
              }}
            >
              NAME
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setname(text)}
              placeholder="Nhập Tên Sản Phẩm"
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              placeholderStyle=" Image "
              onPress={pickImage}
              style={styles.button2}
            >
              <Text>Image</Text>
            </TouchableOpacity>
            {image && (
              <Image
                source={{ uri: image }}
                style={{
                  width: 240,
                  height: 200,
                  marginTop: 20,
                  marginLeft: 15,
                  marginRight: 10,
                }}
              />
            )}
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 20,
              }}
            >
              AMOUNT
            </Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(text) => setamount(text)}
              style={styles.input}
              placeholder="Nhập số Lượng"
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 20,
              }}
            >
              PRICE
            </Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(text) => setprice(text)}
              style={styles.input}
              placeholder="Nhập giá sản phẩm"
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 20,
              }}
            >
              CONTENT
            </Text>
            <TextInput
              onChangeText={(text) => setcontent(text)}
              style={styles.input}
              placeholder="Nhập thông tin sản phẩm"
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                width: 85,
                marginLeft: 20,
                fontWeight: "bold",
                marginTop: 40,
              }}
            >
              CATEGORY
            </Text>

            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={data3}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              searchPlaceholder="Search..."
              value={value}
              onChange={(item) => {
                setcategory(item.name);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 5,
              marginTop: 20,
            }}
          >
            <TouchableOpacity style={styles.button} onPress={postData}>
              <Text>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setmodalVisible(!modalVisible);
              }}
            >
              <Text>CANCLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal Xóa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDelete}
        style={styles.modal2}
      >
        <View style={styles.modalView2}>
          <Text style={{ fontSize: 20 }}>Bạn Có Muốn Xóa Không ?</Text>
          <View
            style={{
              flexDirection: "row",
              margin: 5,
              marginTop: 20,
            }}
          >
            <Pressable
              style={styles.button}
              onPress={() => {
                DeleteProduct(object);
                setmodalDelete(!modalDelete);
              }}
            >
              <Text>DELETE</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => {
                setmodalDelete(!modalDelete);
              }}
            >
              <Text>CANCLE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Modal Update */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUpdate}
        style={styles.modal3}
      >
        <View style={styles.modalView3}>
          <Text
            style={{
              fontSize: 20,
              width: 200,
              fontWeight: "bold",
              marginLeft: 60,
            }}
          >
            UPDATE PRODUCT
          </Text>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 15,
              }}
            >
              NAME
            </Text>
            <TextInput
              style={styles.input}
              placeholder={object.name}
              onChangeText={(text) => (object.name = text)}
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 15,
              }}
            >
              AMOUNT
            </Text>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder={object.limit}
              onChangeText={(text) => (object.limit = text)}
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 15,
              }}
            >
              PRICE
            </Text>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder={object.price}
              onChangeText={(text) => (object.price = text)}
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 15,
              }}
            >
              CONTENT
            </Text>
            <TextInput
              style={styles.input}
              placeholder={object.note}
              onChangeText={(text) => (object.note = text)}
            ></TextInput>
          </View>

          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 15,
                width: 80,
                fontWeight: "bold",
                marginTop: 15,
              }}
            >
             IMAGE
            </Text>
            <View>
              <Button
                title="Pick an image "
                onPress={pickImage}
                style={{
                  color: "black",
                  marginLeft: 100,
                  border: 1,
                }}
              />
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{ width: 200, height: 150 }}
                />
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                width: 85,
                marginLeft: 20,
                fontWeight: "bold",
                marginTop: 40,
              }}
            >
              CATEGORY
            </Text>

            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              data={data3}
              search
              maxHeight={300}
              labelField="name"
              valueField="id"
              placeholder={object.category}
              searchPlaceholder="Search..."
              value={value}
              onChange={(item) => {
                setcategory(item.name);
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              margin: 5,
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                UpdateProduct(object);
                setmodalUpdate(!modalUpdate);
              }}
            >
              <Text>UPDATE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setmodalUpdate(!modalUpdate);
              }}
            >
              <Text>CANCLE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={productDetails}
        style={styles.modal2}
      >
        <View style={styles.modalView2}>
          <Text style={{ fontSize: 20 }}>Chi Tiết Sản Phẩm</Text>
          <Image
            style={{
              width: 150,
              height: 150,
              justifyContent: "center",
              marginTop: 5,
            }}
            source={{ uri: object.photo }}
          ></Image>

          <View style={{ padding: 5, margin: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Tên sản phẩm </Text>
            <Text style={{ color: "red" }} placeholder={object.name}>
              {object.name}
            </Text>
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Số lượng </Text>
            <Text style={{ color: "red" }}> {object.limit}</Text>

            <Text style={{ fontWeight: "bold", marginTop: 10 }}> Giá </Text>
            <Text style={{ color: "red" }}>{object.price} $</Text>
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>
              Thông tin{" "}
            </Text>
            <Text style={{ color: "red" }}> {object.note}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>
              {" "}
              Loại sản phẩm{" "}
            </Text>
            <Text style={{ color: "red" }}>{object.category} </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setproductDetails(!productDetails);
            }}
          >
            <Text>CANCLE</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Products;

const styles = StyleSheet.create({
  modal: {
    marginTop: 50,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#27AE60",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 100,
  },

  modal2: {
    marginTop: 80,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView2: {
    margin: 20,
    backgroundColor: "#27AE60",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 200,
  },
  modal3: {
    marginTop: 50,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView3: {
    margin: 20,
    backgroundColor: "#27AE60",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 50,
  },

  input: {
    width: 240,
    height: 40,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    marginTop: 5,
  },
  button: {
    width: 150,
    backgroundColor: "#00CCFF",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },

  button2: {
    width: 50,
    backgroundColor: "#00CCFF",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderWidth: 1,
    marginRight: 20,
  },
  dropdown: {
    width: 220,
    margin: 15,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },

  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
