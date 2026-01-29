import { describe, expect, test, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { seedDatabase, getUserByUsername, createUser, getAllUsers } from "../database";
import { DefaultPrivacyLevel } from "../../src/models";

describe("Authentication Logic", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("Password Hashing", () => {
    test("should hash passwords correctly", () => {
      const password = "testPassword123";
      const hashedPassword = bcrypt.hashSync(password, 10);

      expect(hashedPassword).not.toBe(password);
      expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
    });

    test("should reject incorrect passwords", () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hashedPassword = bcrypt.hashSync(password, 10);

      expect(bcrypt.compareSync(wrongPassword, hashedPassword)).toBe(false);
    });
  });

  describe("User Authentication", () => {
    test("should find user by username", () => {
      const users = getAllUsers();
      const firstUser = users[0];
      const user = getUserByUsername(firstUser.username);
      expect(user).toBeDefined();
      expect(user.username).toBe(firstUser.username);
    });

    test("should return undefined for non-existent username", () => {
      const user = getUserByUsername("nonexistent_user");
      expect(user).toBeUndefined();
    });

    test("should validate password for existing user", () => {
      const userDetails = {
        firstName: "Test",
        lastName: "User",
        username: "testauth_user",
        password: "securePassword123",
        email: "testauth@example.com",
        phoneNumber: "1234567890",
        balance: 0,
        avatar: "https://example.com/avatar.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
      };

      const createdUser = createUser(userDetails);
      const foundUser = getUserByUsername(createdUser.username);

      expect(foundUser).toBeDefined();
      expect(bcrypt.compareSync("securePassword123", foundUser.password)).toBe(true);
      expect(bcrypt.compareSync("wrongPassword", foundUser.password)).toBe(false);
    });
  });

  describe("Session Management", () => {
    test("should serialize user id correctly", () => {
      const users = getAllUsers();
      const user = users[0];
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe("string");
    });

    test("should have required user properties for session", () => {
      const users = getAllUsers();
      const user = users[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("firstName");
      expect(user).toHaveProperty("lastName");
    });
  });

  describe("Local Strategy Validation", () => {
    test("should have valid user structure for authentication", () => {
      const users = getAllUsers();
      const user = users[0];

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(0);
    });

    test("should have hashed password stored", () => {
      const users = getAllUsers();
      const user = users[0];

      expect(user.password).toBeDefined();
      expect(user.password.startsWith("$2")).toBe(true);
    });
  });
});
