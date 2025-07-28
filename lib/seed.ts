import { ID } from "react-native-appwrite";
import { appwriteConfig, databases } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
    )
  );
}

async function seed(): Promise<void> {
  console.log("🚀 Starting seed process...");
  console.log("📋 Configuration:");
  console.log(`  - Database ID: ${appwriteConfig.databaseId}`);
  console.log(`  - Menu Collection ID: ${appwriteConfig.menuCollectionId}`);
  console.log(`  - Bucket ID: ${appwriteConfig.bucketId}`);

  // 1. Clear all database collections
  console.log("🧹 Clearing existing data...");
  await clearAll(appwriteConfig.categoriesCollectionId);
  await clearAll(appwriteConfig.customizationsCollectionId);
  await clearAll(appwriteConfig.menuCollectionId);
  await clearAll(appwriteConfig.menuCustomizationsCollectionId);
  console.log("✅ Data cleared successfully");

  // 2. Create Categories
  console.log("📂 Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      cat
    );
    categoryMap[cat.name] = doc.$id;
    console.log(`  ✅ Created category: ${cat.name}`);
  }
  console.log(`✅ Created ${Object.keys(categoryMap).length} categories total`);

  // 3. Create Customizations
  console.log("🎨 Creating customizations...");
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.customizationsCollectionId,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      }
    );
    customizationMap[cus.name] = doc.$id;
    console.log(`  ✅ Created customization: ${cus.name}`);
  }
  console.log(
    `✅ Created ${Object.keys(customizationMap).length} customizations total`
  );

  // 4. Create Menu Items (using original image URLs)
  console.log("🍕 Creating menu items...");
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    try {
      console.log(`📝 Creating menu item: ${item.name}`);
      console.log(`📸 Using original image URL: ${item.image_url}`);

      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: item.image_url, // Use original URL directly
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        }
      );

      console.log(`✅ Menu item created: ${item.name} with ID: ${doc.$id}`);
      menuMap[item.name] = doc.$id;

      // 5. Create menu_customizations
      console.log(`🔗 Adding customizations for ${item.name}...`);
      for (const cusName of item.customizations) {
        if (customizationMap[cusName]) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationsCollectionId,
            ID.unique(),
            {
              menu: doc.$id,
              customizations: customizationMap[cusName],
            }
          );
          console.log(`  ✅ Added customization: ${cusName}`);
        } else {
          console.warn(`  ⚠️ Customization not found: ${cusName}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to create menu item ${item.name}:`, error);
      throw error; // Re-throw to see the actual error
    }
  }

  console.log(`✅ Created ${Object.keys(menuMap).length} menu items total`);

  console.log("✅ Seeding complete.");
}

export default seed;
