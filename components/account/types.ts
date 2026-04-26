export type AccountUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export type AccountProfile = {
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt?: string;
  updatedAt?: string;
} | null;

export type AccountPayload = {
  user: AccountUser;
  profile: AccountProfile;
};

export type ProfileFormValues = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
