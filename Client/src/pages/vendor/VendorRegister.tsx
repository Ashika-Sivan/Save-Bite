import { useState } from "react";
import {
  Store,
  BadgeCheck,
  FileText,
  Upload,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const steps = [
  { id: 1, title: "Business", icon: Store },
  { id: 2, title: "Verification", icon: BadgeCheck },
  { id: 3, title: "Documents", icon: FileText },
];

export default function VendorRegister() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    vendorName: "",
    businessImage: null as File | null,
    place: "",
    latitude: "",
    longitude: "",
    businessType: "",

    gstNumber: "",
    panNumber: "",
    ifscCode: "",
    fullAddress: "",
    fssaiNumber: "",
    bankAccountNumber: "",

    gstCertificate: null as File | null,
    fssaiCertificate: null as File | null,
    panCard: null as File | null,
    businessRegistrationCertificate: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleSubmit = () => {
    console.log("Vendor form data:", form);
    alert("Vendor application submitted successfully");
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Become a SaveBite Vendor
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete your business details and verification to start selling on SaveBite.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const active = step === item.id;
            const completed = step > item.id;

            return (
              <div key={item.id} className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                      active || completed
                        ? "bg-[#2E7C35] text-white"
                        : "bg-white text-gray-400 border"
                    }`}
                  >
                    {completed ? "✓" : <Icon className="h-4 w-4" />}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-[#2E7C35]" : "text-gray-600"
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

                <Input
                  label="Latitude"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="9.9312"
                />

                <Input
                  label="Longitude"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="76.2673"
                />
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

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Address
                  </label>
                  <textarea
                    name="fullAddress"
                    value={form.fullAddress}
                    onChange={handleChange}
                    placeholder="Street, area, city, PIN"
                    rows={4}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#2E7C35]"
                  />
                </div>
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

          {/* Buttons */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < 3 ? (
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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