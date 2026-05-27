"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { ProfileDetailsForm } from "@/components/account/profile-details-form";
import { AccountPayload, ProfileFormValues } from "@/components/account/types";
import { formatInr } from "@/lib/pricing";

type LastOrder = {
  orderNumber: string;
  total: number;
  createdAt: string;
  status: string;
};

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function orderStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "delivered": return "bg-emerald-100 text-emerald-700";
    case "cancelled": return "bg-red-100 text-red-600";
    case "pending_payment": return "bg-amber-100 text-amber-700";
    default: return "bg-blue-100 text-blue-700";
  }
}

function formatOrderStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const emptyForm: ProfileFormValues = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function toFormValues(payload: AccountPayload): ProfileFormValues {
  return {
    name: payload.user.name ?? "",
    email: payload.user.email ?? "",
    phone: payload.profile?.phone ?? "",
    addressLine1: payload.profile?.addressLine1 ?? "",
    addressLine2: payload.profile?.addressLine2 ?? "",
    city: payload.profile?.city ?? "",
    state: payload.profile?.state ?? "",
    postalCode: payload.profile?.postalCode ?? "",
    country: payload.profile?.country ?? "",
  };
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function validateForm(values: ProfileFormValues): string | null {
  if (!values.name.trim()) return "Name is required.";
  if (!values.phone.trim()) return "Mobile number is required.";
  if (!values.addressLine1.trim()) return "Address Line 1 is required.";
  if (!values.city.trim()) return "City is required.";
  if (!values.state.trim()) return "State is required.";
  if (!values.postalCode.trim()) return "Postal code is required.";
  if (!values.country.trim()) return "Country is required.";
  return null;
}

export function AccountPageView() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountPayload | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>(emptyForm);
  const [initialValues, setInitialValues] = useState<ProfileFormValues>(emptyForm);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  const hasChanges = useMemo(
    () => JSON.stringify(formValues) !== JSON.stringify(initialValues),
    [formValues, initialValues]
  );

  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/me", { method: "GET" });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: AccountPayload;
      };

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok || !data.success || !data.data) {
        setErrorMessage(data.message || "Unable to load profile details.");
        return;
      }

      setAccountData(data.data);
      const values = toFormValues(data.data);
      setFormValues(values);
      setInitialValues(values);

      // Fetch last order summary in parallel
      try {
        const ordersRes = await fetch("/api/orders", { method: "GET" });
        const ordersData = (await ordersRes.json()) as {
          success?: boolean;
          data?: { orders?: LastOrder[] };
        };
        if (ordersData.success && ordersData.data?.orders?.length) {
          setLastOrder(ordersData.data.orders[0]);
        }
      } catch {
        // non-critical — silently ignore
      }
    } catch {
      setErrorMessage("Network error while loading profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updateField = (field: keyof ProfileFormValues, value: string) => {
    setValidationMessage(null);
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const onCancel = () => {
    setFormValues(initialValues);
    setValidationMessage(null);
    setIsEditing(false);
  };

  const onSave = async () => {
    const validationError = validateForm(formValues);
    if (validationError) {
      setValidationMessage(validationError);
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      showToast("No changes to save.", "success");
      return;
    }

    setIsSaving(true);
    setValidationMessage(null);
    setErrorMessage(null);
    try {
      const payload = {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        addressLine1: formValues.addressLine1,
        addressLine2: formValues.addressLine2,
        city: formValues.city,
        state: formValues.state,
        postalCode: formValues.postalCode,
        country: formValues.country,
      };

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: AccountPayload;
      };

      if (!res.ok || !data.success || !data.data) {
        setValidationMessage(data.message || "Unable to update profile.");
        return;
      }

      setAccountData(data.data);
      const nextValues = toFormValues(data.data);
      setFormValues(nextValues);
      setInitialValues(nextValues);
      setIsEditing(false);
      showToast("Profile updated successfully.", "success");
    } catch {
      setValidationMessage("Network error while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-slate-500">
          <Link href="/home" className="hover:text-slate-800">
            Home
          </Link>{" "}
          / <span className="text-slate-700">Account</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Account</h1>
        <p className="mt-2 text-sm text-slate-500">Keep your profile information up to date.</p>
      </section>

      {isLoading ? (
        <section className="rounded-2xl border border-neutral-200 bg-white p-10">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">Loading your account details...</p>
          </div>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </section>
      ) : null}

      {!isLoading && !errorMessage && accountData ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <ProfileDetailsForm
            values={formValues}
            onChange={updateField}
            isEditing={isEditing}
            isSaving={isSaving}
            validationMessage={validationMessage}
            onEdit={() => setIsEditing(true)}
            onCancel={onCancel}
            onSave={onSave}
          />

          <aside className="space-y-4">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5">
              {/* Avatar + name */}
              <div className="flex flex-col items-center gap-2 border-b border-neutral-100 pb-4 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-sm">
                  {getInitials(accountData.user.name)}
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {accountData.user.name ?? "No name set"}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Member since {formatDate(accountData.user.createdAt)}
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Role</dt>
                  <dd className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                    {accountData.user.role}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="max-w-[10rem] truncate font-medium text-slate-900 text-right">
                    {accountData.user.email}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">Orders</h2>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                View your order history and order details.
              </p>
              <Link
                href="/orders"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-neutral-100"
              >
                View My Orders
              </Link>

              {lastOrder ? (
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Last Order</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">#{lastOrder.orderNumber}</p>
                      <p className="font-bold text-blue-700">{formatInr(lastOrder.total)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">{formatDate(lastOrder.createdAt)}</p>
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColor(lastOrder.status)}`}>
                        {formatOrderStatus(lastOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
