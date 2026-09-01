import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";

import LocationPicker from "../../components/vendor/LocationPicker";
import { createHotel } from "../../services/hotel.service";

interface HotelForm {
  hotelName: string;
  businessType: string;
  place: string;
  address: string;
}

interface ErrorResponse {
  message?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const AddHotel = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<HotelForm>({
    hotelName: "",
    businessType: "",
    place: "",
    address: "",
  });

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [hotelImage, setHotelImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hotelImage) {
      queueMicrotask(() => setImagePreview(null));
      return;
    }

    const previewUrl = URL.createObjectURL(hotelImage);
    queueMicrotask(() => setImagePreview(previewUrl));

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [hotelImage]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 5 MB");
      event.target.value = "";
      return;
    }

    setHotelImage(file);
  };

  const handleLocationSelect = (
    selectedLatitude: number,
    selectedLongitude: number
  ) => {
    console.log(
        "AddHotel received location:",
        selectedLatitude,
        selectedLongitude
    );
    setLatitude(selectedLatitude);
    setLongitude(selectedLongitude);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.hotelName.trim() ||
      !form.businessType ||
      !form.place.trim() ||
      !form.address.trim()
    ) {
      toast.error("Please complete all hotel details");
      return;
    }

    if (!hotelImage) {
      toast.error("Please select a hotel image");
      return;
    }

    if (latitude === null || longitude === null) {
      toast.error("Please select the hotel location");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createHotel({
        hotelName: form.hotelName.trim(),
        businessType: form.businessType,
        place: form.place.trim(),
        address: form.address.trim(),
        latitude,
        longitude,
        hotelImage,
      });

      toast.success(response.message);
      navigate("/vendor/hotels");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;

      toast.error(
        axiosError.response?.data?.message || "Failed to add hotel"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-5 md:p-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Back to hotels
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Add Hotel</h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter the hotel information and select its exact location.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            <div>
              <label
                htmlFor="hotelName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Hotel name
              </label>

              <input
                id="hotelName"
                name="hotelName"
                value={form.hotelName}
                onChange={handleChange}
                placeholder="Green Garden Restaurant"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="businessType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Business type
                </label>

                <select
                  id="businessType"
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select type</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Hotel">Hotel</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="place"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Place
                </label>

                <input
                  id="place"
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder="Kannur"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Complete address
              </label>

              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                maxLength={200}
                placeholder="Near Railway Station, Kannur"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Hotel image
              </p>

              <label
                htmlFor="hotelImage"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 hover:border-green-500 hover:bg-green-50"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Hotel preview"
                    className="h-56 w-full rounded-lg object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus size={34} className="text-green-700" />
                    <span className="mt-2 text-sm font-medium">
                      Select hotel image
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      Maximum size: 5 MB
                    </span>
                  </>
                )}
              </label>

              <input
                id="hotelImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Hotel location
              </p>

              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {isSubmitting && (
                  <Loader2 size={18} className="animate-spin" />
                )}

                {isSubmitting ? "Adding hotel..." : "Add hotel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddHotel;