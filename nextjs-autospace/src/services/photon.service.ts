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

export async function reversePhoton(
  lat: number,
  lon: number,
): Promise<string | null> {
  const res = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`,
  );

  if (!res.ok) return null;

  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    return null;
  }

  const feature = data.features[0];

  const label = [
    feature.properties.name,
    feature.properties.city,
    feature.properties.state,
    feature.properties.country,
  ]
    .filter(Boolean)
    .join(", ");

  return label || null;
}
