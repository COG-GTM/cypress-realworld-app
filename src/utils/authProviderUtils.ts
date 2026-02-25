import { User } from "../models";

type ProviderType = "okta" | "auth0" | "cognito" | "google";

interface ProviderFieldMapping {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
}

const providerFieldMappings: Record<ProviderType, (rawUser: Record<string, any>) => ProviderFieldMapping> = {
  okta: (rawUser) => ({
    id: rawUser.sub,
    email: rawUser.email,
    firstName: rawUser.given_name,
    lastName: rawUser.family_name,
    username: rawUser.preferred_username,
  }),
  auth0: (rawUser) => ({
    id: rawUser.sub,
    email: rawUser.email,
    firstName: rawUser.nickname,
    avatar: rawUser.picture,
  }),
  cognito: (rawUser) => ({
    id: rawUser.userSub,
    email: rawUser.email,
  }),
  google: (rawUser) => ({
    id: rawUser.googleId,
    email: rawUser.email,
    firstName: rawUser.givenName,
    lastName: rawUser.familyName,
    avatar: rawUser.imageUrl,
  }),
};

export const mapProviderUser = (provider: ProviderType, rawUser: Record<string, any>): Partial<User> => {
  const mapping = providerFieldMappings[provider];
  return mapping(rawUser);
};
