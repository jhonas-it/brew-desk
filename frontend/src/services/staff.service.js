import {
  createUserWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import { ref, get, set, remove } from "firebase/database";
import { secondaryAuth, db } from "../../lib/firebase";

export async function getStaffList() {
  const usersSnapshot = await get(ref(db, "users"));

  if (!usersSnapshot.exists()) {
    return [];
  }

  const users = usersSnapshot.val();

  return Object.entries(users)
    .map(([uid, user]) => ({
      id: uid,
      uid,
      name: user.name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      active: user.active !== false,
      created: user.created ?? "",
      avatar: user.avatar ?? null,
    }))
    .filter((user) => user.role !== "OWNER" && user.role !== "Owner");
}


export async function createStaffAccount(data) {
  const username = data.username.trim().toLowerCase();
  const email = data.email.trim().toLowerCase();

  if (!username || !email || !data.password) {
    throw new Error("Please complete all required fields.");
  }

  if (!["Manager", "Cashier"].includes(data.role)) {
    throw new Error("Invalid staff role.");
  }

  // Check whether the username is already registered.
  const usernameRef = ref(db, `usernameIndex/${username}`);
  const usernameSnapshot = await get(usernameRef);

  if (usernameSnapshot.exists()) {
    throw new Error("This username is already in use.");
  }

  // Create the Firebase Authentication account separately.
  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    data.password
  );

  const uid = credential.user.uid;

  try {
    const profile = {
      uid,
      username,
      name: data.name.trim(),
      email,
      role: data.role,
      active: data.active ?? true,
      created: new Date().toISOString().slice(0, 10),
    };

    // Save the profile and username mapping together.
    await Promise.all([
      set(ref(db, `users/${uid}`), profile),
      set(usernameRef, email),
    ]);

    return {
      id: uid,
      ...profile,
    };
  } catch (error) {
    // Clean up any partial database writes.
    await Promise.allSettled([
      remove(ref(db, `users/${uid}`)),
      remove(usernameRef),
    ]);

    // Delete the newly created Auth account.
    await deleteUser(credential.user);

    throw new Error(
      "The staff account was created, but saving its profile failed. Please check Firebase Database access."
    );
  }
}

export async function updateStaffAccount(staff, data) {
  const oldUsername = staff.username.trim().toLowerCase()
  const username = data.username.trim().toLowerCase()

  if (!username || !data.name.trim()) {
    throw new Error('Please complete all required fields.')
  }

  if (!['Manager', 'Cashier'].includes(data.role)) {
    throw new Error('Invalid staff role.')
  }

  // Check whether the new username belongs to another account.
  const usernameRef = ref(db, `usernameIndex/${username}`)
  const usernameSnapshot = await get(usernameRef)

  if (
    usernameSnapshot.exists() &&
    usernameSnapshot.val() !== staff.email
  ) {
    throw new Error('This username is already in use.')
  }

  // Keep the existing email to avoid mismatching Firebase Authentication.
  if (data.email.trim().toLowerCase() !== staff.email.toLowerCase()) {
    throw new Error(
      'Email changes are not supported in this edit step yet.'
    )
  }

  const updatedProfile = {
    name: data.name.trim(),
    username,
    role: data.role,
    active: data.active,
  }

  const updates = [
    set(ref(db, `users/${staff.uid || staff.id}`), {
      ...updatedProfile,
      uid: staff.uid || staff.id,
      email: staff.email,
      created: staff.created,
    }),
  ]

  if (oldUsername !== username) {
    updates.push(
      set(ref(db, `usernameIndex/${username}`), staff.email),
      remove(ref(db, `usernameIndex/${oldUsername}`))
    )
  }

  await Promise.all(updates)

  return {
    ...staff,
    ...updatedProfile,
    id: staff.id,
    uid: staff.uid || staff.id,
    email: staff.email,
  }
}

export async function deleteStaffAccount(staff) {
  const uid = staff.uid || staff.id
  const username = staff.username.trim().toLowerCase()

  if (!uid || !username) {
    throw new Error('Staff account information is incomplete.')
  }

  await Promise.all([
    remove(ref(db, `users/${uid}`)),
    remove(ref(db, `usernameIndex/${username}`)),
  ])
}
