import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { MenuItem } from "../type";
import { useCartStore } from "@/store/cart.store";

const MenuCard = ({
  item: { image_url, name, price, $id },
}: {
  item: MenuItem;
}) => {
  // const [imageError, setImageError] = useState(false);

  // The image_url from Appwrite storage is already a complete URL
  const imageUrl = image_url;
  const {addItem} = useCartStore();

  return (
    <TouchableOpacity
      className="menu-card"
      style={
        Platform.OS === "android"
          ? { elevation: 10, shadowColor: "#878787" }
          : {}
      }
    >
      <Image
        source={{ uri: imageUrl }}
        className="size-32 absolute -top-10"
        resizeMode="contain"
        // onError={(error) => {
        //   console.error(
        //     `Failed to load image for ${name}:`,
        //     error.nativeEvent.error
        //   );

        //   // Check if it's a 401 unauthorized error
        //   if (error.nativeEvent.error?.includes("401")) {
        //     console.warn(
        //       `⚠️ 401 Unauthorized error for ${name} - file permissions issue`
        //     );
        //   }

        //   setImageError(true);
        // }}
        // onLoad={() => {
        //   console.log(`Image loaded successfully for ${name}`);
        // }}
      />

      {/* {imageError && (
        <View className="size-32 absolute -top-10 bg-gray-200 items-center justify-center">
          <Text className="text-xs text-gray-400">No Image</Text>
        </View>
      )} */}
      <Text
        className="text-center base-bold text-dark-100 mb-2"
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text className="body-regular text-gray-200 mb-4">For ${price}</Text>
      <TouchableOpacity onPress={() => addItem({ id:$id, name, price, image_url:imageUrl, customizations: [] })}>
        <Text className="paragraph-bold text-primary">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
