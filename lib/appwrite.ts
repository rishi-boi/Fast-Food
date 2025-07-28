import {
  CreateUserParams,
  GetMenuParams,
  SignInParams,
} from "@/components/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endPoint:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
    "https://appwrite.example.com/v1",
  platform: "com.rishi.foodordering", // Try more generic platform for development
  databaseId: "6884836400001dcd68f5",
  bucketId: "68850368000c34cb579f",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "default",
  userCollectionId: "688483880006df711fcc",
  categoriesCollectionId: "6884dce60031467f3c2e",
  menuCollectionId: "6884dfa700032276dcc9",
  customizationsCollectionId: "6884e0af0019e2cf762d",
  menuCustomizationsCollectionId: "6884e1900037723cb3fc",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endPoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);

export const databases = new Databases(client);

export const storage = new Storage(client);

const avatars = new Avatars(client);

export const createUser = async ({
  email,
  name,
  password,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw Error;

    await signIn({ email, password });
    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, name, avatar: avatarUrl }
    );
  } catch (error) {
    throw new Error(error as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error("User not found");
    return currentUser.documents[0];
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries = [];

    if (category) {
      queries.push(Query.equal("categories", category));
    }
    if (query) {
      queries.push(Query.search("name", query));
    }

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries
    );

    return menus.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCategories = async() => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    );

    return categories.documents;
  } catch (error) {
    throw new Error(error as string);
    
  }
}