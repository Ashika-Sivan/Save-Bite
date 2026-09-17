
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
import { useNavigate, Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import LocationPicker from "../../components/vendor/LocationPicker";


export default function VendorRegister() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate()

  const [form, setForm] = useState({
    vendorName: "",
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
    <div className="min-h-screen bg-brand-light text-brand-dark pb-16 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquidBlob1 {
            0%   { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
            34%  { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg) scale(1.05); }
            67%  { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg) scale(0.95); }
            100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg) scale(1); }
        }
        @keyframes liquidBlob2 {
            0%   { border-radius: 50% 50% 50% 70% / 50% 50% 70% 50%; transform: rotate(0deg) scale(1.1); }
            34%  { border-radius: 80% 20% 50% 50% / 50% 50% 30% 70%; transform: rotate(-120deg) scale(0.9); }
            67%  { border-radius: 40% 60% 30% 70% / 60% 30% 70% 40%; transform: rotate(-240deg) scale(1.05); }
            100% { border-radius: 50% 50% 50% 70% / 50% 50% 70% 50%; transform: rotate(-360deg) scale(1.1); }
        }
        .blob-1 { animation: liquidBlob1 18s ease-in-out infinite; }
        .blob-2 { animation: liquidBlob2 22s ease-in-out infinite; }
      `}} />
      
      {/* Fluid Wavy Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] bg-brand-primary opacity-20 blob-1 pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute top-[20%] left-[-15%] w-[40rem] h-[40rem] bg-[#e8cda1] opacity-40 blob-2 pointer-events-none z-0 mix-blend-multiply"></div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/30">
                <Store size={22} strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-brand-dark hidden sm:inline-block">
                SaveBite <span className="text-brand-primary">Vendor</span>
            </span>
        </Link>
        <Link to="/" className="text-sm font-bold text-brand-dark hover:text-brand-primary transition-colors">
            Back to Home
        </Link>
      </nav>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-black text-brand-dark tracking-tight drop-shadow-sm">
            Partner with <span className="text-brand-primary">SaveBite</span>
          </h1>
          <p className="mt-3 text-base text-brand-dark/70 font-medium max-w-xl mx-auto">
            Complete your business details and verification to join our mission of reducing food waste while increasing your revenue.
          </p>
        </div>

        <div className="mb-12 flex items-center justify-between rounded-3xl bg-white/40 backdrop-blur-md p-4 shadow-sm border border-white/50 overflow-x-auto hide-scrollbar">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const active = step === item.id;
            const completed = step > item.id;

            return (
              <div key={item.id} className="flex flex-1 items-center min-w-fit px-2">
                <div className={`flex items-center gap-3 transition-all duration-300 ${active ? 'scale-105' : ''}`}>
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold shadow-sm transition-colors duration-300 ${active
                        ? "bg-brand-primary text-white shadow-brand-primary/30"
                        : completed 
                        ? "bg-brand-primary/20 text-brand-primary"
                        : "bg-white/60 text-brand-dark/40"
                      }`}
                  >
                    {completed ? "✓" : <Icon className="h-4 w-4" />}
                  </div>

                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-bold transition-colors duration-300 ${active ? "text-brand-primary" : completed ? "text-brand-dark" : "text-brand-dark/40"
                        }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs font-semibold text-brand-dark/40">Step {item.id}</p>
                  </div>
                </div>

                {index !== steps.length - 1 && (
                  <div className="mx-4 h-0.5 flex-1 rounded-full bg-brand-primary/10 min-w-[2rem]" />
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-xl md:p-10 relative overflow-hidden">
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
                  <label className="mb-2 block text-sm font-bold text-brand-dark/70 uppercase tracking-wider">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 backdrop-blur-sm"
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

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-brand-dark/70 uppercase tracking-wider">
                    Business Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter street, area, city, PIN"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 backdrop-blur-sm"
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

                <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 backdrop-blur-sm p-5 text-sm font-medium text-brand-dark/70">
                  By submitting, your application enters our verification queue.
                  You&apos;ll receive an email once approved (usually within
                  24-48 hours).
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm p-4 text-sm font-medium text-brand-dark/80 transition-all hover:border-brand-primary/50 hover:bg-white/80">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-brand-primary/30 text-brand-primary focus:ring-brand-primary/30"
                  />
                  <span>
                    I accept the SaveBite{" "}
                    <a href="#" className="font-bold text-brand-primary hover:underline">
                      Terms & Conditions
                    </a>{" "}
                    and confirm all information provided is accurate.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-brand-primary/10 pt-6">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  navigate("/");
                } else {
                  setStep(step - 1);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-brand-dark/70 hover:bg-white/50 hover:text-brand-dark transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-all hover:bg-brand-secondary hover:scale-105 active:scale-95"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-all hover:bg-brand-secondary hover:scale-105 active:scale-95"
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
      <label className="mb-2 block text-sm font-bold text-brand-dark/70 uppercase tracking-wider">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10 backdrop-blur-sm placeholder:text-brand-dark/30"
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
      <label className="mb-2 block text-sm font-bold text-brand-dark/70 uppercase tracking-wider">
        {label}
      </label>

      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-primary/20 bg-white/40 backdrop-blur-sm px-4 py-8 text-center transition-all hover:border-brand-primary/50 hover:bg-white/60">
        <div className="mb-3 rounded-full bg-brand-primary/10 p-3 text-brand-primary transition-transform group-hover:scale-110">
            <Upload size={24} />
        </div>
        <span className="text-sm font-bold text-brand-dark">
          {file ? file.name : "Click to upload file"}
        </span>
        <span className="mt-1 text-xs font-semibold text-brand-dark/40">
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
    <div className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-sm p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-brand-primary/10 pb-3">
        <h3 className="text-base font-bold text-brand-dark">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary/20"
        >
          Edit
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-dark/40">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-brand-dark/90">
              {value || <span className="text-brand-dark/30">—</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
