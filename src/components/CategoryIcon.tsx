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
    /** Storefront uchun emoji — Lucide bundle yuklamaslik */
    preferEmoji?: boolean;
}

const EMOJI_MAP: Record<string, string> = {
    Box: '📦', ShoppingBag: '🛍️', Mail: '✉️', Layers: '🔲', Lock: '🔒',
    CircleDot: '💨', StickyNote: '🎗️', ScrollText: '🔄', Tag: '🏷️',
    Coffee: '☕', Zap: '⚡', FileText: '📄', Shield: '🛡️', Cylinder: '🥫',
    PenTool: '✏️', ShieldCheck: '🛡️', PackageOpen: '📦', LayoutGrid: '📦',
    BoxSelect: '📦', Hand: '✋', Moon: '🖤', Cog: '⚙️', Sparkles: '✨',
    Recycle: '♻️', Utensils: '🍱', Archive: '🗄️', Sliders: '🎚️',
    Palette: '🎨', Thermometer: '🌡️', Anchor: '🧵', Trash2: '🗑️',
    Stethoscope: '⚕️', Croissant: '🧁', Shirt: '👔', Minimize2: '📦',
    Minimize: '📦', ChefHat: '👨‍🍳', File: '📄', Receipt: '🧾',
    Printer: '🖨️', HardHat: '⛑️', Store: '🏪', Square: '⬜', Stamp: '🏷️',
    Type: '✍️', Disc: '⚪', Footprints: '👟', Wind: '💨', Minus: '➖',
};

export function CategoryIcon({ name, className, preferEmoji }: CategoryIconProps) {
    if (preferEmoji && EMOJI_MAP[name]) {
        return <span className={className} aria-hidden>{EMOJI_MAP[name]}</span>;
    }
    const IconComponent = iconMap[name] || Box;

    return <IconComponent className={className} />;
}
