
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Store,
  BadgeCheck,
  FileText,
  Upload,
  ArrowLeft,
  ArrowRight,
  MapPin,
  ClipboardCheck,
} from "lucide-react";

const steps = [
  { id: 1, title: "Business", icon: Store },
  { id: 2, title: "Verification", icon: BadgeCheck },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Review", icon: ClipboardCheck },
];

import { registerVendor } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import LocationPicker from "../../components/vendor/LocationPicker";


export default function VendorRegister() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate()

  const [form, setForm] = useState({
    vendorName: "",
    businessImage: null as File | null,
    place: "",
    address: "",
    latitude: 0,
    longitude: 0,
    businessType: "",

    gstNumber: "",
    panNumber: "",
    ifscCode: "",
    fssaiNumber: "",
    bankAccountNumber: "",

    gstCertificate: null as File | null,
    fssaiCertificate: null as File | null,
    panCard: null as File | null,
    businessRegistrationCertificate: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : null,
    });
  };

  const handleLocationSelect = (
    selectedLatitude: number,
    selectedLongitude: number
  ) => {
    setForm((previous) => ({
      ...previous,
      latitude: selectedLatitude,
      longitude: selectedLongitude,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!accepted) {
        toast.error("Please accept the terms & conditions to continue");
        return;
      }

      if (
        !form.businessImage ||
        !form.gstCertificate ||
        !form.fssaiCertificate ||
        !form.panCard ||
        !form.businessRegistrationCertificate
      ) {
        toast.error("All field requird");
        return;
      }

      const businessInfo = {
        businessName: form.vendorName,
        businessType: form.businessType,
        place: form.place,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      const verification = {
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
        ifscCode: form.ifscCode,
        bankAccountNumber: form.bankAccountNumber,
        fssaiNumber: form.fssaiNumber,
      };

      const formData = new FormData();

      formData.append("businessInfo", JSON.stringify(businessInfo));
      formData.append("verification", JSON.stringify(verification));
      formData.append("businessImage", form.businessImage);
      formData.append("gstCertificate", form.gstCertificate);
      formData.append("fssaiCertificate", form.fssaiCertificate);
      formData.append("panCard", form.panCard);
      formData.append(
        "businessRegistrationCertificate",
        form.businessRegistrationCertificate
      );

      const response = await registerVendor(formData);
      toast.success("Vendor application submitted successfully");
      navigate(APP_ROUTES.VENDOR.PENDING)
      console.log(response);
    } catch (error) {
      console.error(error);
      toast.error("Vendor registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Become a SaveBite Vendor
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete your business details and verification to start selling on
            SaveBite.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const active = step === item.id;
            const completed = step > item.id;

            return (
              <div key={item.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${active || completed
                        ? "bg-[#2E7C35] text-white"
                        : "border bg-white text-gray-400"
                      }`}
                  >
                    {completed ? "✓" : <Icon className="h-4 w-4" />}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold ${active ? "text-[#2E7C35]" : "text-gray-600"
                        }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">Step {item.id}</p>
                  </div>
                </div>

                {index !== steps.length - 1 && (
                  <div className="mx-4 h-px flex-1 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          {step === 1 && (
            <div>
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Business Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Vendor Name"
                  name="vendorName"
                  value={form.vendorName}
                  onChange={handleChange}
                  placeholder="Enter restaurant / hotel name"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#2E7C35]"
                  >
                    <option value="">Select business type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Cafe</option>
                    <option value="bakery">Bakery</option>
                    <option value="homeChef">Home Chef</option>
                  </select>
                </div>

                <Input
                  label="Place"
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder="Kochi, Kerala"
                />

                <FileInput
                  label="Business Image"
                  name="businessImage"
                  onChange={handleFileChange}
                  file={form.businessImage}
                />

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Business Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter street, area, city, PIN"
                    rows={4}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#2E7C35]"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="h-4 w-4 text-[#2E7C35]" />
                    Business Location
                  </p>

                  <LocationPicker
                    latitude={form.latitude === 0 ? null : form.latitude}
                    longitude={form.longitude === 0 ? null : form.longitude}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Verification & Address
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="GST Number"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                />
                <Input
                  label="PAN Number"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                />
                <Input
                  label="IFSC Code"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                />
                <Input
                  label="FSSAI License Number"
                  name="fssaiNumber"
                  value={form.fssaiNumber}
                  onChange={handleChange}
                  placeholder="14-digit FSSAI number"
                />
                <Input
                  label="Bank Account Number"
                  name="bankAccountNumber"
                  value={form.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Upload Documents
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <FileInput
                  label="GST Certificate"
                  name="gstCertificate"
                  onChange={handleFileChange}
                  file={form.gstCertificate}
                />
                <FileInput
                  label="FSSAI Certificate"
                  name="fssaiCertificate"
                  onChange={handleFileChange}
                  file={form.fssaiCertificate}
                />
                <FileInput
                  label="PAN Card"
                  name="panCard"
                  onChange={handleFileChange}
                  file={form.panCard}
                />
                <FileInput
                  label="Business Registration Certificate"
                  name="businessRegistrationCertificate"
                  onChange={handleFileChange}
                  file={form.businessRegistrationCertificate}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-2 text-lg font-bold text-gray-900">
                Review & Submit
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Please double-check your details before submitting your
                application.
              </p>

              <div className="space-y-5">
                <ReviewSection
                  title="Business Information"
                  onEdit={() => setStep(1)}
                  items={[
                    ["Vendor Name", form.vendorName],
                    ["Business Type", form.businessType],
                    ["Place", form.place],
                    ["Address", form.address],
                    [
                      "Location",
                      form.latitude && form.longitude
                        ? `${form.latitude}, ${form.longitude}`
                        : "Not selected",
                    ],
                    [
                      "Business Image",
                      form.businessImage ? form.businessImage.name : "Not uploaded",
                    ],
                  ]}
                />

                <ReviewSection
                  title="Verification"
                  onEdit={() => setStep(2)}
                  items={[
                    ["GST Number", form.gstNumber],
                    ["PAN Number", form.panNumber],
                    ["IFSC Code", form.ifscCode],
                    ["FSSAI License", form.fssaiNumber],
                    ["Bank Account", form.bankAccountNumber],
                  ]}
                />

                <ReviewSection
                  title="Documents"
                  onEdit={() => setStep(3)}
                  items={[
                    [
                      "GST Certificate",
                      form.gstCertificate ? form.gstCertificate.name : "Not uploaded",
                    ],
                    [
                      "FSSAI Certificate",
                      form.fssaiCertificate
                        ? form.fssaiCertificate.name
                        : "Not uploaded",
                    ],
                    ["PAN Card", form.panCard ? form.panCard.name : "Not uploaded"],
                    [
                      "Business Registration",
                      form.businessRegistrationCertificate
                        ? form.businessRegistrationCertificate.name
                        : "Not uploaded",
                    ],
                  ]}
                />

                <div className="rounded-2xl border border-dashed bg-green-50 p-5 text-sm text-gray-600">
                  By submitting, your application enters our verification queue.
                  You&apos;ll receive an email once approved (usually within
                  24-48 hours).
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm text-gray-700 hover:border-[#2E7C35]">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#2E7C35]"
                  />
                  <span>
                    I accept the SaveBite{" "}
                    <a href="#" className="font-semibold text-[#2E7C35] underline">
                      Terms & Conditions
                    </a>{" "}
                    and confirm all information provided is accurate.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-[#2E7C35] px-6 py-3 text-sm font-semibold text-white hover:bg-[#25682c]"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-[#2E7C35] px-6 py-3 text-sm font-semibold text-white hover:bg-[#25682c]"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
};

function Input({ label, name, value, placeholder, onChange }: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#2E7C35]"
      />
    </div>
  );
}

type FileInputProps = {
  label: string;
  name: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function FileInput({ label, name, file, onChange }: FileInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center hover:border-[#2E7C35] hover:bg-green-50">
        <Upload className="mb-2 h-6 w-6 text-[#2E7C35]" />
        <span className="text-sm font-medium text-gray-700">
          {file ? file.name : "Click to upload file"}
        </span>
        <span className="mt-1 text-xs text-gray-400">
          JPG, PNG or PDF supported
        </span>

        <input
          type="file"
          name={name}
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}

type ReviewSectionProps = {
  title: string;
  onEdit: () => void;
  items: [string, string][];
};

function ReviewSection({ title, onEdit, items }: ReviewSectionProps) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-[#2E7C35] hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
              {value || <span className="text-gray-400">—</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
