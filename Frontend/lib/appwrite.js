import { Client, Account, OAuthProvider } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.warn(
        "[appwrite] Missing VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID. " +
        "Check Frontend/.env"
    );
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export { OAuthProvider, client };

export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

export async function logout() {
    try {
        await account.deleteSession("current");
    } catch {
        // ignore - no active session
    }
}
