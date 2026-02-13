"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { getGarageById } from "@/services/garage.service";
import {
  attachGarageImage,
  getGarageImages,
  getUploadUrl,
  uploadToR2,
} from "@/services/garageImages.service";
import apiClient from "@/lib/apiClient";
import {
  MapPin,
  Phone,
  Mail,
  Layers,
  User,
  Hash,
  CheckCircle,
} from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !garageId) return;

    setLoading(true);
    getGarageById(garageId)
      .then(setGarage)
      .finally(() => setLoading(false));
  }, [open, garageId]);

  useEffect(() => {
    if (!open || !garageId) return;

    getGarageImages(garageId)
      .then(setImages)
      .catch(() => setImages([]));
  }, [open, garageId]);

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

  return (
    <Modal open={open} onClose={onClose} title="Garage Details">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : garage ? (
        <div className="space-y-6">
          {/* HEADER */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold">{garage.name}</h2>

            {garage.garageRegistrationNumber && (
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Hash size={14} />
                Garage Code: {garage.garageRegistrationNumber}
              </p>
            )}
          </div>

          {/* IMAGES */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Garage Images</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  className="h-32 w-full object-cover rounded-md border"
                  alt="Garage"
                />
              ))}
            </div>

            {garage.status === "active" && (
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleImageUpload}
              />
            )}
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoItem
              icon={<MapPin size={16} />}
              label="Location"
              value={garage.locationName}
            />

            {garage.contactEmail && (
              <InfoItem
                icon={<Mail size={16} />}
                label="Email"
                value={garage.contactEmail}
              />
            )}

            {garage.contactPhone && (
              <InfoItem
                icon={<Phone size={16} />}
                label="Phone"
                value={garage.contactPhone}
              />
            )}

            <InfoItem
              icon={<Layers size={16} />}
              label="Capacity"
              value={`${garage.capacity}`}
            />

            <InfoItem
              icon={<User size={16} />}
              label="Manager"
              value={garage.manager?.fullname ?? "Unassigned"}
            />

            <InfoItem
              icon={<CheckCircle size={16} />}
              label="Status"
              value={garage.status}
              badge
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Lat: {garage.latitude}, Lng: {garage.longitude}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No data</p>
      )}
    </Modal>
  );
}

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
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        {badge ? (
          <span className="mt-1 inline-block rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-medium text-yellow-800">
            {value}
          </span>
        ) : (
          <span className="font-medium">{value}</span>
        )}
      </div>
    </div>
  );
}
