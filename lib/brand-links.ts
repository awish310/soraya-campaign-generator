import {
  Facebook,
  Instagram,
  MessageCircle,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';

export interface BrandLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const BRAND_LINKS: BrandLink[] = [
  {
    href: 'https://www.facebook.com/share/1Gm22noHTm/?mibextid=wwXIfr',
    label: 'פייסבוק',
    icon: Facebook,
  },
  {
    href: 'https://www.instagram.com/soraya.center?igsh=a2QwcjJkbjJiMDY5',
    label: 'אינסטגרם',
    icon: Instagram,
  },
  {
    href: 'https://chat.whatsapp.com/ICv1Xs2RpOcAOq04ddxYUs?mode=gi_t',
    label: 'קבוצת השגרירים Whatsapp',
    icon: MessageCircle,
  },
  {
    href: 'https://drive.google.com/drive/folders/1UR07F8K2gWbaFqYhIWv7At3JCVbF9aFx',
    label: 'חומרי מדיה',
    icon: FolderOpen,
  },
];
