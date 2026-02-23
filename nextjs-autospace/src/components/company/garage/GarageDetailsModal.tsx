"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Layers, User, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { getGarageById } from "@/services/garage.service";
import {
  attachGarageImage,
  getGarageImages,
  getUploadUrl,
  uploadToR2,
} from "@/services/garageImages.service";

import apiClient from "@/lib/apiClient";

/* ================= TYPES ================= */

interface GarageImage {
  id: string;
  url: string;
}

interface Garage {
  id: string;
  name: string;
  garageRegistrationNumber?: string;
  locationName: string;
  contactEmail?: string;
  contactPhone?: string;
  capacity: number;
  manager?: { fullname?: string } | null;
  status: string;
  valetAvailable: boolean;
  latitude: number;
  longitude: number;
}

/* ================= COMPONENT ================= */

export function GarageDetailsModal({
  open,
  onClose,
  garageId,
}: {
  open: boolean;
  onClose: () => void;
  garageId: string | null;
}) {
  const [garage, setGarage] = useState<Garage | null>(null);

  const [images, setImages] = useState<GarageImage[]>([]);

  const [uploading, setUploading] = useState(false);

  /* ================= FETCH GARAGE ================= */

  useEffect(() => {
    if (!open || !garageId) return;

    getGarageById(garageId)
      .then(setGarage)
      .catch(() => setGarage(null));
  }, [open, garageId]);

  /* ================= FETCH IMAGES ================= */

  useEffect(() => {
    if (!open || !garageId) return;

    getGarageImages(garageId)
      .then(setImages)
      .catch(() => setImages([]));
  }, [open, garageId]);

  /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !garageId) return;

    const file = e.target.files[0];

    setUploading(true);

    try {
      const { uploadUrl, key } = await getUploadUrl(file);

      await uploadToR2(uploadUrl, file);

      const fileRes = await apiClient.post("/api/files", {
        key,
        mimeType: file.type,
        size: file.size,
      });

      const fileId = fileRes.data.id;

      await attachGarageImage(garageId, fileId);

      const updated = await getGarageImages(garageId);

      setImages(updated);
    } finally {
      setUploading(false);
    }
  };

  /* ================= CLOSE IF NOT OPEN ================= */

  if (!open) return null;

  /* ================= UI ================= */

  return (
    <>
      {/* OVERLAY */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40",
          open ? "opacity-100 visible" : "opacity-0 invisible",
        )}
        onClick={onClose}
      />

      {/* DRAWER */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full",
          "w-full sm:w-[520px] lg:w-[620px]",
          "bg-white shadow-2xl border-l",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        )}
      >
        {/* HEADER */}
        <div className="border-b px-6 py-4 flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">Garage Details</h2>

            <p className="text-sm text-muted-foreground">
              #{garage?.garageRegistrationNumber ?? ""}
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* TITLE */}
          <h1 className="text-xl font-semibold">{garage?.name ?? ""}</h1>

          {/* IMAGES */}
          <div>
            <h3 className="text-sm font-medium mb-3">Garage Images</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="h-[110px] w-full object-cover rounded-lg border"
                />
              ))}
            </div>

            {garage?.status === "active" && (
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleImageUpload}
                className="mt-3 text-sm"
              />
            )}
          </div>

          {/* INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<MapPin size={16} />}
              label="Location"
              value={garage?.locationName ?? ""}
            />

            <InfoItem
              icon={<Mail size={16} />}
              label="Email"
              value={garage?.contactEmail ?? "—"}
            />

            <InfoItem
              icon={<Phone size={16} />}
              label="Phone"
              value={garage?.contactPhone ?? "—"}
            />

            <InfoItem
              icon={<Layers size={16} />}
              label="Capacity"
              value={garage ? String(garage.capacity) : ""}
            />

            <InfoItem
              icon={<User size={16} />}
              label="Manager"
              value={garage?.manager?.fullname ?? "Unassigned"}
            />

            <InfoItem
              icon={<CheckCircle size={16} />}
              label="Status"
              value={garage?.status ?? ""}
              badge
            />
          </div>

          {/* FOOTER */}
          <div className="text-xs text-muted-foreground pt-4 border-t">
            Lat: {garage?.latitude ?? ""}
            Lng: {garage?.longitude ?? ""}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= INFO ITEM ================= */

function InfoItem({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div className="flex gap-3 border rounded-lg p-3">
      <div className="text-muted-foreground">{icon}</div>

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>

        {badge ? (
          <span className="px-3 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
            {value}
          </span>
        ) : (
          <p className="font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
