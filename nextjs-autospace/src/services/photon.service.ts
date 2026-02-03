export interface PhotonFeature {
  properties: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export interface PhotonResponse {
  features: PhotonFeature[];
}

export async function searchPhoton(query: string) {
  if (!query || query.length < 3) return [];

  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
  );

  if (!res.ok) {
    throw new Error("Photon search failed");
  }

  const data: PhotonResponse = await res.json();
  return data.features;
}
