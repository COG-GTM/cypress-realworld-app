import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserById,
  removeUserFromResults,
} from "../../backend/database";
import { User, DefaultPrivacyLevel } from "../models";

describe("Users CRUD", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should retrieve a user by id", () => {
    const users = getAllUsers();
    const user = users[0];

    const result = getUserById(user.id);
    expect(result.id).toBe(user.id);
    expect(result.username).toBe(user.username);
  });

  it("should retrieve a user by username", () => {
    const users = getAllUsers();
    const user = users[0];

    const result = getUserByUsername(user.username);
    expect(result.id).toBe(user.id);
    expect(result.username).toBe(user.username);
  });

  it("should create a new user", () => {
    const userDetails: Partial<User> = {
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      password: "s3cret",
      email: "testuser@example.com",
      phoneNumber: "555-9876",
      balance: 0,
      avatar: "https://example.com/avatar.png",
      defaultPrivacyLevel: DefaultPrivacyLevel.public,
    };

    const newUser = createUser(userDetails);

    expect(newUser.id).toBeDefined();
    expect(newUser.uuid).toBeDefined();
    expect(newUser.firstName).toBe("Test");
    expect(newUser.lastName).toBe("User");
    expect(newUser.username).toBe("testuser");
    expect(newUser.email).toBe("testuser@example.com");
    expect(newUser.balance).toBe(0);
    // password should be hashed, not the original
    expect(newUser.password).not.toBe("s3cret");
    expect(newUser.password.length).toBeGreaterThan(10);
  });

  it("should create a user and find it in the full user list", () => {
    const initialUserCount = getAllUsers().length;

    createUser({
      firstName: "Another",
      lastName: "User",
      username: "anotheruser",
      password: "s3cret",
      email: "another@example.com",
      phoneNumber: "555-0000",
      balance: 5000,
      avatar: "https://example.com/avatar2.png",
      defaultPrivacyLevel: DefaultPrivacyLevel.private,
    });

    const allUsers = getAllUsers();
    expect(allUsers.length).toBe(initialUserCount + 1);

    const found = allUsers.find((u: User) => u.username === "anotheruser");
    expect(found).toBeDefined();
    expect(found!.firstName).toBe("Another");
  });

  it("should update a user by id", () => {
    const user: User = getAllUsers()[0];

    updateUserById(user.id, {
      firstName: "UpdatedFirst",
      lastName: "UpdatedLast",
    });

    const updatedUser = getUserById(user.id);
    expect(updatedUser.firstName).toBe("UpdatedFirst");
    expect(updatedUser.lastName).toBe("UpdatedLast");
    // other fields should remain unchanged
    expect(updatedUser.username).toBe(user.username);
    expect(updatedUser.email).toBe(user.email);
  });

  it("should update user balance", () => {
    const user: User = getAllUsers()[0];
    const originalBalance = user.balance;

    updateUserById(user.id, { balance: originalBalance + 50000 });

    const updatedUser = getUserById(user.id);
    expect(updatedUser.balance).toBe(originalBalance + 50000);
  });

  it("should update user default privacy level", () => {
    const user: User = getAllUsers()[0];

    updateUserById(user.id, { defaultPrivacyLevel: DefaultPrivacyLevel.private });

    const updatedUser = getUserById(user.id);
    expect(updatedUser.defaultPrivacyLevel).toBe(DefaultPrivacyLevel.private);
  });

  it("should remove a user from results list", () => {
    const users = getAllUsers();
    const userToRemove = users[0];

    const filteredUsers = removeUserFromResults(userToRemove.id, [...users]);
    expect(filteredUsers.length).toBe(users.length - 1);
    expect(filteredUsers.find((u: User) => u.id === userToRemove.id)).toBeUndefined();
  });

  it("should return all users unchanged when removing nonexistent id", () => {
    const users = getAllUsers();
    const filteredUsers = removeUserFromResults("nonexistent-id", [...users]);
    expect(filteredUsers.length).toBe(users.length);
  });
});
