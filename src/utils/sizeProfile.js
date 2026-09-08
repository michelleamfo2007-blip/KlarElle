const STORAGE_KEY = 'klarelle-size-profiles';

export function loadSizeProfiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const profiles = Array.isArray(parsed.profiles) ? parsed.profiles : [];
    const activeId = parsed.activeId || profiles[0]?.id || null;
    return { profiles, activeId };
  } catch {
    return { profiles: [], activeId: null };
  }
}

export function saveSizeProfiles(profiles, activeId) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles, activeId }));
}

export function createSizeProfile(fields) {
  return {
    id: `size-${Date.now()}`,
    name: fields.name || 'Me',
    height: Number(fields.height) || 165,
    weight: Number(fields.weight) || 60,
    bust: Number(fields.bust) || 90,
    waist: Number(fields.waist) || 70,
    hips: Number(fields.hips) || 100,
    underbust: Number(fields.underbust) || 75,
    bodyShape: fields.bodyShape || 'Rounded',
    fitPreference: fields.fitPreference || '',
    ageRange: fields.ageRange || '',
    unit: fields.unit || 'cm, kg'
  };
}
