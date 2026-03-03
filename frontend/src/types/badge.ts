// frontend/src/types/badge.ts
// Matches the badge DTO returned by backend badge service

export interface Badge {
  badge_name: string;
  slug: string;
  icon_url: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  color: string;
  animation_type: 'none' | 'pulse' | 'glow' | 'sparkle' | 'flame';
  sort_order?: number;
}
