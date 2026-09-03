export interface DesignPiece {
  id: string
  title: string
  caption: string
  category: string
  code?: string
  image?: string
  storagePath?: string
  tags?: string[]
  rotation: string
  size: 'small' | 'medium' | 'large'
  art: 'logo' | 'poster' | 'identity' | 'type' | 'manip' | 'motion' | 'ui' | 'stamp'
  palette: [string, string, string]
}

/* The gallery is intentionally empty by default — content is filled from
   Supabase (design_pieces) or the dashboard. */
export const designPieces: DesignPiece[] = []