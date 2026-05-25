export type MeProfileFields = {
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

export type ShippingAddressPayload = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function isShippingAddressComplete(
  name: string | null | undefined,
  profile: MeProfileFields | null | undefined
): boolean {
  if (!name?.trim()) return false;
  if (!profile) return false;
  return Boolean(
    profile.phone?.trim() &&
      profile.addressLine1?.trim() &&
      profile.city?.trim() &&
      profile.state?.trim() &&
      profile.postalCode?.trim() &&
      profile.country?.trim()
  );
}

export function buildShippingAddressFromProfile(
  name: string,
  profile: MeProfileFields
): ShippingAddressPayload {
  const address: ShippingAddressPayload = {
    name: name.trim(),
    phone: profile.phone!.trim(),
    addressLine1: profile.addressLine1!.trim(),
    city: profile.city!.trim(),
    state: profile.state!.trim(),
    postalCode: profile.postalCode!.trim(),
    country: profile.country!.trim(),
  };

  const line2 = profile.addressLine2?.trim();
  if (line2) {
    address.addressLine2 = line2;
  }

  return address;
}
