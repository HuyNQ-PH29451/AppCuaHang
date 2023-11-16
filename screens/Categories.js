import React, { useState, useEffect, forwardRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import API from "../Config";
import showSuccessToast from "../handler";
import * as yup from "yup";
import * as eva from "@eva-design/eva";
import {
  ApplicationProvider,
  Layout,
  Text,
  Button,
} from "@ui-kitten/components";
import Icon from "react-native-vector-icons/FontAwesome";

const Categories = forwardRef((props, ref) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [updatedCategory, setUpdatedCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetch(`${API}cats`)
      .then((response) => response.json())
      .then((data) => setCategories(data));
  }, []);

  const catSchema = yup.object().shape({
    name: yup
      .string()
      .min(4, "Tên Cats phải có ít nhất 4 ký tự")
      .required("Tên Cats không được để trống"),
  });

  const onRefresh = () => {
    setIsRefreshing(true);

    fetch(`${API}cats`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("Error refreshing data: ", error);
        setIsRefreshing(false);
      });
  };

  const addCategory = async () => {
    try {
      await catSchema.validate({ name: newCategory });
      if (isCategoryNameDuplicate(newCategory)) {
        Alert.alert("Error", "Category name already exists");
      } else {
        const response = await fetch(`${API}cats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCategory }),
        });
        const data = await response.json();
        setCategories([...categories, data]);
        setNewCategory("");
        setAddModalVisible(false);
        showSuccessToast("Category added successfully");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const deleteCategory = (category) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the category "${category.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await fetch(`${API}cats/${category.id}`, {
                method: "DELETE",
              });
              const updatedCategories = categories.filter(
                (c) => c.id !== category.id
              );
              setCategories(updatedCategories);
              showSuccessToast("Category deleted successfully");
            } catch (error) {
              console.error("Error deleting category: ", error);
            }
          },
        },
      ]
    );
  };

  const startEditingCategory = (category) => {
    setEditingCategory(category);
    setUpdatedCategory(category.name);
  };

  const saveCategory = async (category) => {
    try {
      await catSchema.validate({ name: updatedCategory });
      if (
        updatedCategory !== category.name &&
        isCategoryNameDuplicate(updatedCategory)
      ) {
        Alert.alert("Error", "Category name already exists");
      } else {
        const response = await fetch(`${API}cats/${category.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: updatedCategory }),
        });
        const data = await response.json();
        const updatedCategories = categories.map((c) =>
          c.id === data.id ? data : c
        );
        setCategories(updatedCategories);
        setEditingCategory(null);
        showSuccessToast("Category updated successfully");
      }
    } catch (error) {
      console.error("Error updating category: ", error);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const isCategoryNameDuplicate = (name) => {
    return categories.some((category) => category.name === name);
  };

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout style={styles.container}>
        <Layout>
          <Layout style={{ flexDirection: "row" }}>
            <TextInput
              type="text"
              placeholder="Tìm kiếm..."
              style={styles.searchInput}
              onChangeText={(text) => {
                setSearchKeyword(text);
              }}
            ></TextInput>
          </Layout>
          <Layout style={{ flexDirection: "row", margin: 5 }}>
            <Text
              style={{
                fontSize: 20,
                width: 200,
                fontWeight: "bold",
                marginTop: 20,
              }}
            >
              CATEGORIES LIST
            </Text>

            <TouchableOpacity
              onPress={() => {
                setAddModalVisible(!isAddModalVisible);
              }}
              style={{
                backgroundColor: "white",
                width: 100,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 10,
                marginBottom: 5,
                marginLeft: 55,
              }}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </Layout>
        </Layout>

        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              {editingCategory === item ? (
                <View style={styles.editCategory}>
                  <TextInput
                    style={styles.editInput}
                    value={updatedCategory}
                    onChangeText={(text) => setUpdatedCategory(text)}
                  />
                  <View style={styles.saveCancelButtonContainer}>
                    <Button onPress={() => saveCategory(item)}>
                      <Icon name="check" size={24} color="white" />
                    </Button>
                    <View style={styles.buttonSpacing}></View>
                    <Button
                      onPress={() => setEditingCategory(null)}
                      appearance="outline"
                      status="danger"
                    >
                      <Icon name="times" size={24} color="red" />
                    </Button>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <View style={styles.buttons}>
                    <Button
                      style={styles.editButton}
                      onPress={() => startEditingCategory(item)}
                    >
                      <Icon name="edit" size={24} color="white" />
                    </Button>
                    <Button
                      style={styles.deleteButton}
                      onPress={() => deleteCategory(item)}
                    >
                      <Icon name="trash" size={24} color="white" />
                    </Button>
                  </View>
                </>
              )}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
        />

        <Modal
          visible={isAddModalVisible}
          animationType="slide"
          transparent={false}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Add New Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a new category"
                value={newCategory}
                onChangeText={(text) => setNewCategory(text)}
              />
              <View style={styles.modalButtons}>
                <Button style={styles.modalButton} onPress={addCategory}>
                  <Text style={styles.modalButtonLabel}>Add</Text>
                </Button>
                <Button
                  style={styles.modalButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.modalButtonLabel}>Cancel</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Layout>
    </ApplicationProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
  },
  addButtonLabel: {
    fontSize: 24,
  },
  searchInput: {
    width: "100%",
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 18,
  },
  editCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  buttons: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  editButtonLabel: {
    color: "white",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonLabel: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 5,
  },
  modalButtonLabel: {
    color: "white",
  },
  saveCancelButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonSpacing: {
    width: 8,
  },
});

export default Categories;
