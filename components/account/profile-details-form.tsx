"use client";

import { ProfileFormValues } from "@/components/account/types";

type ProfileDetailsFormProps = {
  values: ProfileFormValues;
  onChange: (field: keyof ProfileFormValues, value: string) => void;
  isEditing: boolean;
  isSaving: boolean;
  validationMessage: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  type?: "text" | "email";
  placeholder?: string;
};

function ProfileField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  type = "text",
  placeholder,
}: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-slate-500"
      />
    </label>
  );
}

export function ProfileDetailsForm({
  values,
  onChange,
  isEditing,
  isSaving,
  validationMessage,
  onEdit,
  onCancel,
  onSave,
}: ProfileDetailsFormProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Profile Details</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your contact and address details.</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-neutral-100"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {validationMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validationMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ProfileField
          label="Full Name"
          value={values.name}
          onChange={(value) => onChange("name", value)}
          disabled={!isEditing || isSaving}
          required
          placeholder="Enter your full name"
        />
        <ProfileField
          label="Email"
          value={values.email}
          disabled
          type="email"
          placeholder="Email is read-only in v1"
        />
        <ProfileField
          label="Mobile Number"
          value={values.phone}
          onChange={(value) => onChange("phone", value)}
          disabled={!isEditing || isSaving}
          required
          placeholder="e.g. +91 9876543210"
        />
      </div>

      <div className="mt-6 border-t border-neutral-200 pt-5">
        <h3 className="text-base font-semibold text-slate-900">Address</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ProfileField
              label="Address Line 1"
              value={values.addressLine1}
              onChange={(value) => onChange("addressLine1", value)}
              disabled={!isEditing || isSaving}
              required
              placeholder="House no, street, area"
            />
          </div>
          <div className="sm:col-span-2">
            <ProfileField
              label="Address Line 2"
              value={values.addressLine2}
              onChange={(value) => onChange("addressLine2", value)}
              disabled={!isEditing || isSaving}
              placeholder="Landmark (optional)"
            />
          </div>
          <ProfileField
            label="City"
            value={values.city}
            onChange={(value) => onChange("city", value)}
            disabled={!isEditing || isSaving}
            required
          />
          <ProfileField
            label="State"
            value={values.state}
            onChange={(value) => onChange("state", value)}
            disabled={!isEditing || isSaving}
            required
          />
          <ProfileField
            label="Postal Code"
            value={values.postalCode}
            onChange={(value) => onChange("postalCode", value)}
            disabled={!isEditing || isSaving}
            required
          />
          <ProfileField
            label="Country"
            value={values.country}
            onChange={(value) => onChange("country", value)}
            disabled={!isEditing || isSaving}
            required
          />
        </div>
      </div>
    </section>
  );
}
