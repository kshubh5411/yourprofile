import { Biodata } from '../types';

type SaveShareResponse = {
  id: string;
  shareUrl: string;
};

type ShareMeta = {
  ownerId?: string;
  landingRef?: string;
};

type SharedBiodataResponse = {
  id: string;
  data: Biodata;
  createdAt: string;
  updatedAt: string;
};

export async function createShareLink(data: Biodata, meta?: ShareMeta): Promise<SaveShareResponse> {
  const response = await fetch('/api/biodata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, meta }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create share link');
  }

  return (await response.json()) as SaveShareResponse;
}

export async function getSharedBiodata(id: string): Promise<SharedBiodataResponse> {
  const response = await fetch(`/api/biodata/${encodeURIComponent(id)}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load shared biodata');
  }
  return (await response.json()) as SharedBiodataResponse;
}
