import { useState, useEffect } from 'react';
import { BoxDimensions, BoxModel, Material } from '../types';
import { materials } from '../materials';

interface UseBoxModelProps {
    initialModel: BoxModel;
}

export function useBoxModel({ initialModel }: UseBoxModelProps) {
    const [model, setModel] = useState<BoxModel>(initialModel);
    const [material, setMaterial] = useState<Material>(materials[0]);

    // Start with string values for inputs to allow empty state while typing
    const [inputs, setInputs] = useState({ l: "434", w: "214", h: "400" });

    // Derived numeric dimensions
    const dims: BoxDimensions = {
        l: parseInt(inputs.l) || 0,
        w: parseInt(inputs.w) || 0,
        h: parseInt(inputs.h) || 0,
    };

    const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

    useEffect(() => {
        const res = model.validate(dims);
        setValidation(res);
    }, [dims.l, dims.w, dims.h, model]);

    const handleInputChange = (key: keyof typeof inputs, value: string) => {
        // Basic input cleaning (allow empty string for UX)
        const cleanValue = value.replace(/[^0-9]/g, '').replace(/^0+/, '');
        setInputs(prev => ({ ...prev, [key]: cleanValue }));
    };

    return {
        model,
        setModel,
        material,
        setMaterial,
        inputs,
        handleInputChange,
        dims,
        validation
    };
}
