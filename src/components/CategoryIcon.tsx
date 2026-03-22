import {
    Box, ShoppingBag, Mail, Layers, Lock, Sliders, ScrollText, Zap, Coffee,
    CircleDot, Wind, FileText, Tag, StickyNote, PackageOpen, Cylinder,
    LayoutGrid, Shield, BoxSelect, Square, Store, Minimize2, Minimize,
    Minus, Thermometer, Anchor, PenTool, ShieldCheck, Archive,
    Utensils, HardHat, Trash2, Stethoscope, Croissant, Shirt, ChefHat,
    File, Receipt, Printer, LucideIcon, Footprints, Hand, Cog, Sparkles,
    Recycle, Disc, Moon, Stamp, Type, Palette
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    Box, ShoppingBag, Mail, Layers, Lock, Sliders, ScrollText, Zap, Coffee,
    CircleDot, Wind, FileText, Tag, StickyNote, PackageOpen, Cylinder,
    LayoutGrid, Shield, BoxSelect, Square, Store, Minimize2, Minimize,
    Minus, Thermometer, Anchor, PenTool, ShieldCheck, Archive,
    Utensils, HardHat, Trash2, Stethoscope, Croissant, Shirt, ChefHat,
    File, Receipt, Printer, Footprints, Hand, Cog, Sparkles,
    Recycle, Disc, Moon, Stamp, Type, Palette
};

interface CategoryIconProps {
    name: string;
    className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
    const IconComponent = iconMap[name] || Box; // Fallback to Box

    return <IconComponent className={className} />;
}
