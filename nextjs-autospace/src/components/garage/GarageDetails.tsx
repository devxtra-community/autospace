"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Phone,
  Navigation,
  // Map as MapIcon,
  Clock,
  Car,
  ChevronRight,
  ShieldCheck,
  Info,
  ArrowLeft,
  LayoutGrid,
  Calendar,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { ParkingSlotSelectionModal } from "./booking/ParkingSlotSelectionModal";
import { ValetPickupModal } from "../booking/ValetPickupModal";
import { getGarageImages } from "@/services/garageImages.service";
import { checkValetAvailability } from "@/services/garageValets.service";
import { toast } from "sonner";

// import { useSwipeable } from "react-swipeable";

import SmoothSwipeButton from "./swipeButton";
import {
  getGarageReviews,
  getAverageGarageRating,
} from "@/services/booking.service";
import axios from "axios";

export interface GarageDetailsProps {
  garage: {
    id: string;
    name: string;
    locationName: string;
    latitude: number;
    longitude: number;
    distance?: number;
    standardSlotPrice?: number;
    largeSlotPrice?: number;
    rating?: number;
    contactPhone?: string;
    hasOffer?: boolean;
    offerText?: string;
    valetAvailable?: boolean;
    valetServiceRadius: number;
  };
}

export interface GarageReview {
  id: string;
  garageId: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: {
    fullname: string;
    email?: string;
    phone?: string;
  } | null;
}

export default function GarageDetails({ garage }: GarageDetailsProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [vehicleType, setVehicleType] = useState<"sedan" | "suv">("sedan");
  // const [valetEnabled, setValetEnabled] = useState(false);
  const [duration, setDuration] = useState(2);
  const [isBooking, setIsBooking] = useState(false);
  const [reviews, setReviews] = useState<GarageReview[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  // const [bookingId, setBookingId] = useState<string | null>(null);
  // const [showPayment, setShowPayment] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  // const [isConfirming, setIsConfirming] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    floor: number;
    slotId: string;
    slotNumber: string;
  } | null>(null);

  const [swiped, setSwiped] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [valetState, setValetState] = useState<
    "IDLE" | "AVAILABLE" | "REQUESTED" | "ASSIGNED" | "NONE"
  >("IDLE");

  // const [assignedValet, setAssignedValet] = useState<Valet | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(true);
  const [showAllImages, setShowAllImages] = useState(false);

  const sedanPrice = garage.standardSlotPrice || 10;
  const suvPrice = garage.largeSlotPrice || 15;
  const currentPrice = vehicleType === "sedan" ? sedanPrice : suvPrice;
  const valetCharge = 5;

  useEffect(() => {
    const loadAverageRating = async () => {
      try {
        const avg = await getAverageGarageRating(garage.id);
        setAverageRating(avg.averageRating || 0);
      } catch (err) {
        console.error("Failed to load average rating", err);
        setAverageRating(0);
      }
    };

    if (garage?.id) {
      loadAverageRating();
    }
  }, [garage.id]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getGarageReviews(
          garage.id,
          showAllReviews ? 100 : 3,
        );
        setReviews(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadReviews();
  }, [garage.id, showAllReviews]);

  useEffect(() => {
    setPickupLocation(null);
    setSwiped(false);
  }, [selectedDate, startTime, endTime]);

  useEffect(() => {
    if (!selectedDate || !startTime || !endTime) return;

    const start = new Date(`${selectedDate}T${startTime}:00`);
    const end = new Date(`${selectedDate}T${endTime}:00`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (diff <= 0) {
      setDuration(0);
    } else {
      setDuration(diff);
    }
  }, [selectedDate, startTime, endTime]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setImgLoading(true);
        const imgs = await getGarageImages(garage.id);

        // take only urls
        const urls = imgs.map((i: { url: string }) => i.url);

        setImages(urls);
      } catch (err) {
        console.error("Failed to load garage images", err);
        setImages([]);
      } finally {
        setImgLoading(false);
      }
    };

    if (garage?.id) loadImages();
  }, [garage.id]);

  const valetEnabled = !!pickupLocation;

  const subtotal = currentPrice * duration;
  const valetTotal = valetEnabled ? valetCharge : 0;
  const total = subtotal + valetTotal;

  const openDirections = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        const destLat = garage.latitude;
        const destLng = garage.longitude;

        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;

        window.open(url, "_blank");
      },
      () => {
        toast.error("Location permission denied");
      },
    );
  };

  // console.log("pickupLocation:", pickupLocation);
  // console.log("valetEnabled:", valetEnabled);
  // console.log("valetRequested:", !!pickupLocation);

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error("Please select a parking slot");
      return;
    }

    try {
      setIsBooking(true);

      const startISO = new Date(
        `${selectedDate}T${startTime}:00`,
      ).toISOString();
      const endISO = new Date(`${selectedDate}T${endTime}:00`).toISOString();

      if (new Date(startISO) < new Date()) {
        toast.error("Selection must be in the future");
        setIsBooking(false);
        return;
      }

      if (duration < 0.5) {
        toast.error("Minimum booking duration is 30 minutes");
        setIsBooking(false);
        return;
      }

      if (pickupLocation === null && valetState === "AVAILABLE") {
        toast.error("Please select pickup location");
        setIsBooking(false);
        return;
      }

      const payload = {
        garageId: garage.id,
        slotId: selectedSlot?.slotId,
        startTime: startISO,
        endTime: endISO,
        vehicleType,
        amount: total,
        valetRequested: !!pickupLocation,
        pickupLatitude: pickupLocation?.latitude,
        pickupLongitude: pickupLocation?.longitude,
        pickupAddress: pickupLocation?.address,
      };

      const response = await apiClient.post("/api/bookings", payload);

      console.log("booking", response.data);

      const newBookingId = response.data.data.id;
      // setBookingId(newBookingId);
      // setIsBooking(true);

      const checkoutRes = await apiClient.post("/api/payment/create-checkout", {
        bookingId: newBookingId,
      });

      window.location.href = checkoutRes.data.url;
      // setShowPayment(true);

      // if (valetEnabled) {
      //   setValetState("REQUESTED");
      //   startValetPolling(newBookingId);
      // }
    } catch (err) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      };

      // if (error?.response?.status === 401) {
      //   toast.error("Please login to continue booking");
      //   router.push("/login?redirect=" + window.location.pathname);
      //   return;
      // }

      toast.message(error?.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  const requestValet = async () => {
    if (!garage.valetAvailable) {
      toast.message("This garage does not provide valet");
      return;
    }

    try {
      setValetState("REQUESTED");

      // get ACTIVE valets only
      const valets = await checkValetAvailability(garage.id);

      if (!valets) {
        setValetState("NONE");
        toast.message("All valets are busy right now");
        return;
      }

      // Valets available
      // setValetEnabled(true);
      setValetState("AVAILABLE");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setValetState("NONE");
          return;
        }

        toast.error(
          err.response?.data?.message ?? "Failed to check valet availability",
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto lg:overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to search</span>
          </button>
          <div className="flex items-center gap-4"></div>
        </div>

        <div className="flex-1 lg:flex overflow-hidden">
          <div className="w-full lg:w-[65%] 2xl:w-[60%] p-4 lg:p-8 lg:overflow-y-auto custom-scrollbar bg-slate-50/30">
            {imgLoading ? (
              <div className="mb-8 grid grid-cols-4 grid-rows-2 gap-3 h-[300px] lg:h-[450px] animate-pulse">
                <div className="col-span-4 lg:col-span-2 row-span-2 bg-gray-200" />
                <div className="hidden lg:block col-span-2 row-span-1 bg-gray-200" />
                <div className="hidden lg:block col-span-1 row-span-1 bg-gray-200" />
                <div className="hidden lg:block col-span-1 row-span-1 bg-gray-200" />
              </div>
            ) : images.length === 0 ? (
              <div className="relative group overflow-hidden shadow-sm mb-8 h-[300px] lg:h-[450px]">
                <img
                  src="/images/garage_interior.png"
                  alt="Garage Default"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              </div>
            ) : (
              <div
                className={`mb-8 transition-all duration-500 ${showAllImages ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-auto" : "grid grid-cols-4 grid-rows-2 gap-3 h-[300px] lg:h-[450px]"}`}
              >
                {!showAllImages ? (
                  <>
                    {/* Only 1 Image */}
                    {images.length === 1 && (
                      <div className="col-span-4 row-span-2 relative group overflow-hidden shadow-sm">
                        <img
                          src={images[0]}
                          alt="Garage"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                    )}

                    {/* Exactly 2 Images */}
                    {images.length === 2 && (
                      <>
                        <div className="col-span-4 lg:col-span-2 row-span-2 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[0]}
                            alt="Garage 1"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="hidden lg:block lg:col-span-2 row-span-2 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[1]}
                            alt="Garage 2"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                      </>
                    )}

                    {/* Exactly 3 Images */}
                    {images.length === 3 && (
                      <>
                        <div className="col-span-4 lg:col-span-2 row-span-2 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[0]}
                            alt="Garage 1"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="hidden lg:block lg:col-span-2 row-span-1 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[1]}
                            alt="Garage 2"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="hidden lg:block lg:col-span-2 row-span-1 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[2]}
                            alt="Garage 3"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                      </>
                    )}

                    {/* 4 or More Images */}
                    {images.length >= 4 && (
                      <>
                        <div className="col-span-4 lg:col-span-2 row-span-2 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[0]}
                            alt="Garage"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="hidden lg:block col-span-2 row-span-1 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[1]}
                            alt="Garage Interior"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="hidden lg:block col-span-1 row-span-1 relative group overflow-hidden shadow-sm">
                          <img
                            src={images[2]}
                            alt="Valet Station"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="hidden lg:block col-span-1 row-span-1 relative group overflow-hidden shadow-sm">
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                            <img
                              src={images[3]}
                              alt="More images"
                              className="w-full h-full object-cover opacity-50 blur-[2px]"
                            />
                            <button
                              onClick={() => setShowAllImages(true)}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-sm hover:bg-black/50 transition-colors"
                            >
                              Show all {images.length} photos
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group overflow-hidden shadow-sm aspect-video lg:aspect-square"
                      >
                        <img
                          src={img || "/images/garage_interior.png"}
                          alt={`Garage ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAllImages(false)}
                      className="col-span-full py-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white border border-gray-100 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Show less photos
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                    {garage.name}
                  </h1>
                  <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-700 px-2.5 py-1 text-sm font-bold border border-yellow-200/50">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-gray-500 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {garage.locationName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    {garage.contactPhone || "+1 234 567 890"}
                  </div>
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <Navigation className="w-4 h-4 text-indigo-500" />
                    {garage.distance?.toFixed(1) || 8.1} km away
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={openDirections}
                  className="flex-1 lg:flex-none px-6 py-2.5 bg-blue-300 border border-gray-200 text-sm font-bold shadow-sm hover:bg-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Direction
                </button>
                {/* <button className="flex-1 lg:flex-none px-6 py-2.5 bg-white border border-gray-200 text-sm font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  View on Map
                </button> */}
              </div>
            </div>

            <hr className="border-gray-100 mb-8" />

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-600" />
                Pricing Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 border-2 transition-all ${vehicleType === "sedan" ? "border-primary bg-primary/5" : "border-gray-100 bg-white"}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      Standard (Sedan)
                    </span>
                    {vehicleType === "sedan" && (
                      <div className="w-2 h-2 bg-primary" />
                    )}
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    ₹{sedanPrice}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      / hour
                    </span>
                  </div>
                </div>
                <div
                  className={`p-4 border-2 transition-all ${vehicleType === "suv" ? "border-primary bg-primary/5" : "border-gray-100 bg-white"}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      SUV (Large)
                    </span>
                    {vehicleType === "suv" && (
                      <div className="w-2 h-2 bg-primary" />
                    )}
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    ₹{suvPrice}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      / hour
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-700">
                    Quick Duration Pricing
                  </span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((hr) => (
                    <div
                      key={hr}
                      className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        {hr} Hour
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        ₹{sedanPrice * hr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3">User Reviews</h3>

              {reviews.length === 0 && (
                <p className="text-sm text-gray-400">No reviews yet</p>
              )}

              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border p-3 rounded-lg bg-white"
                  >
                    {/* Name */}
                    <p className="font-semibold text-sm">
                      {review.user?.fullname || "User"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    {/* Stars */}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i <= review.rating ? "currentColor" : "none"}
                          className="text-yellow-500"
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-gray-600 mt-1">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>

              {!showAllReviews && reviews.length >= 3 && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="mt-3 text-primary font-semibold text-sm"
                >
                  Show more reviews
                </button>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[35%] 2xl:w-[40%] p-4 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-100 bg-white lg:overflow-y-auto no-scrollbar">
            <div className="sticky top-0">
              <div className="mb-8 bg-black p-6 text-center shadow-lg">
                <h2 className="text-xl font-bold text-white mb-1 uppercase tracking-widest leading-none">
                  Book your spot
                </h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  Secure your parking space in seconds.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:ring-0 focus:border-primary transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:ring-0 focus:border-primary transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      End Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:ring-0 focus:border-primary transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 block mb-2">
                  Vehicle Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVehicleType("sedan")}
                    className={`flex-1 py-3 border font-bold text-sm transition-all flex items-center justify-center gap-2 ${vehicleType === "sedan" ? "bg-primary/10 border-primary text-gray-900 shadow-sm" : "bg-slate-50 border-transparent text-gray-500 hover:border-slate-200"}`}
                  >
                    <Car className="w-4 h-4" />
                    Sedan
                  </button>
                  <button
                    onClick={() => setVehicleType("suv")}
                    className={`flex-1 py-3 border font-bold text-sm transition-all flex items-center justify-center gap-2 ${vehicleType === "suv" ? "bg-primary/10 border-primary text-gray-900 shadow-sm" : "bg-slate-50 border-transparent text-gray-500 hover:border-slate-200"}`}
                  >
                    <Car className="w-5 h-5" />
                    SUV
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div
                  className={`p-4 border transition-all ${valetEnabled ? "bg-primary/5 border-primary" : "bg-slate-50 border-slate-100"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white flex items-center justify-center shadow-sm border border-slate-200">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          Valet Service
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Professional car handling
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={requestValet}
                      disabled={!garage.valetAvailable}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${valetEnabled ? "bg-primary text-gray-900 shadow-md scale-105" : "bg-white border border-gray-200 text-gray-400 hover:text-gray-900"}`}
                    >
                      {!garage.valetAvailable
                        ? "Not Available"
                        : valetEnabled
                          ? "Valet Ready"
                          : "Check Availability"}
                    </button>
                  </div>
                  {!garage.valetAvailable && (
                    <p className="text-xs text-red-500 font-bold">
                      This garage does not provide valet service
                    </p>
                  )}

                  {/* No valet available */}
                  {garage.valetAvailable && valetState === "NONE" && (
                    <p className="text-xs text-red-500 font-bold">
                      All valets are busy right now
                    </p>
                  )}

                  {/* Available but not booked yet */}
                  {valetState === "AVAILABLE" && !swiped && (
                    <SmoothSwipeButton
                      onSwipeComplete={() => {
                        setPickupModalOpen(true);
                      }}
                      availableText="✔ Valet available — Swipe to use valet"
                      successText="✓ Valet enabled. Will be assigned after booking."
                    />
                  )}

                  {swiped && valetEnabled && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-green-700 font-bold">
                        ✔ Valet enabled. Will be assigned after booking.
                      </p>
                      {pickupLocation && (
                        <p className="text-[10px] text-gray-700 font-bold bg-indigo-50 p-2 border border-indigo-100 rounded">
                          ✔ Pickup: {pickupLocation.address}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Searching after booking */}
                  {valetState === "REQUESTED" && (
                    <div className="text-sm text-blue-600 font-bold animate-pulse">
                      Searching for available valet...
                    </div>
                  )}

                  {/* Assigned */}
                  {/* {valetState === "ASSIGNED" && assignedValet && (
                    <div className="mt-4 p-3 border rounded bg-green-50">
                      <p className="text-sm font-bold text-green-700">
                        ✔ Valet Assigned: {assignedValet.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Phone: {assignedValet.phone}
                      </p>
                    </div>
                  )} */}
                </div>

                {/* Slot Selection Integration */}
                <div className="mt-4">
                  <button
                    onClick={() => setIsSlotModalOpen(true)}
                    className={`w-full py-4 border-2 flex items-center justify-center gap-3 transition-all duration-300 ${
                      selectedSlot
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                        : "bg-white border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    <LayoutGrid
                      className={`w-5 h-5 ${selectedSlot ? "text-indigo-600" : ""}`}
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold uppercase tracking-wider leading-none">
                        {selectedSlot ? "Slot Selected" : "Select Parking Slot"}
                      </p>
                      <p className="text-[10px] font-medium opacity-70">
                        {selectedSlot
                          ? `Floor ${selectedSlot.floor} • Slot ${selectedSlot.slotNumber}`
                          : "Choose your preferred spot"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 border border-slate-100 mb-8 divide-y divide-slate-100">
                <div className="pb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">
                      {vehicleType === "sedan" ? "Sedan" : "SUV"} Rate
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{currentPrice}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {duration.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-gray-900">
                      Subtotal
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="py-4 space-y-3 text-sm font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Valet Charge</span>
                    <span
                      className={`${valetEnabled ? "text-gray-900 font-bold" : "text-gray-300"}`}
                    >
                      +₹{valetTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-gray-900">
                      Total Price
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                disabled={isBooking}
                onClick={handleBooking}
                className="w-full py-4 bg-primary text-gray-900 text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3"
              >
                {isBooking ? (
                  <>
                    <div className="w-5 h-5 border-3 border-black/20 border-t-black animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Reserve Spot</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 font-medium mt-4">
                * By clicking you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>

      <ParkingSlotSelectionModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        garageName={garage.name}
        garageId={garage.id}
        startTime={startTime}
        endTime={endTime}
        onConfirm={(data) => {
          // console.log("Selected Slot:", data);
          setSelectedSlot(data);
        }}
      />

      <ValetPickupModal
        open={pickupModalOpen}
        onClose={() => {
          setPickupModalOpen(false);

          // Only reset if no pickup selected
          if (!pickupLocation) {
            setSwiped(false);
            // setValetEnabled(false);
          }
        }}
        garageLocation={{
          latitude: garage.latitude,
          longitude: garage.longitude,
          name: garage.name,
          valetRadius: garage.valetServiceRadius,
        }}
        onConfirm={(pickup) => {
          setPickupLocation(pickup);
          // setValetEnabled(true);
          setSwiped(true);
          setPickupModalOpen(false);
        }}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
