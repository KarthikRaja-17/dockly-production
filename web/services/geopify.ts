import axios from 'axios';

export interface GeopifyFeature {
  properties: {
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    housenumber?: string;
    house_number?: string;
    name?: string;
    building?: string;
    lat?: number;
    lon?: number;
    result_type?: string;
    type?: string;
    rank?: {
      confidence?: number;
    };
  };
  geometry: {
    coordinates: [number, number];
  };
}

export interface GeopifyResponse {
  features: GeopifyFeature[];
}

export interface AddressDetails {
  formatted: string;
  latitude: number;
  longitude: number;
}

const GEOPIFY_API_KEY = 'ea55e68bab7b4b26a0104dfbbeeaaf7b';
const GEOPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

export class GeopifyService {
  static async searchAddresses(query: string, limit: number = 10): Promise<GeopifyResponse> {
    try {
      const response = await axios.get(GEOPIFY_BASE_URL, {
        params: {
          text: query,
          limit,
          apiKey: GEOPIFY_API_KEY,
          format: 'geojson',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw new Error('API Error: ' + (error as Error).message);
    }
  }
}