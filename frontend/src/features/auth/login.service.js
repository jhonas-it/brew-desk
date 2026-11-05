
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../../../lib/firebase";

export async function loginUser(username, password) {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername || !password) {
    throw new Error("Please enter your username and password.");
  }

  // Find the email associated with this username in RTDB.
  const usernameSnapshot = await get(
    ref(db, `usernameIndex/${normalizedUsername}`)
  );

  if (!usernameSnapshot.exists()) {
    throw new Error("Invalid username or password.");
  }

  // Expected RTDB value: usernameIndex/allen = "allen@brewdesk.com"
  const email = usernameSnapshot.val();

  if (typeof email !== "string" || !email.includes("@")) {
    throw new Error("The account configuration is invalid.");
  }

  // Firebase Authentication verifies the password.
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  try {
    // Retrieve the authenticated user's profile.
    const userSnapshot = await get(
      ref(db, `users/${credential.user.uid}`)
    );

    if (!userSnapshot.exists()) {
      throw new Error("User profile not found.");
    }

    const profile = userSnapshot.val();

    if (profile.active === false) {
      throw new Error("This account has been disabled.");
    }

    return {
      uid: credential.user.uid,
      username: normalizedUsername,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar ?? null,
    };
  } catch (error) {
    // Sign out if the profile cannot be loaded or the account is disabled.
    await signOut(auth);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}