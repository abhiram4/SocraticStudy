
import React from 'react';

interface ToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, disabled = false }) => {
    const handleChange = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <label htmlFor={label} className="flex items-center cursor-pointer">
            <span className={`text-sm font-medium mr-3 ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
            <div className="relative">
                <input id={label} type="checkbox" className="sr-only" checked={checked} onChange={handleChange} disabled={disabled} />
                <div className={`block w-10 h-6 rounded-full transition ${checked ? 'bg-brand-primary' : 'bg-gray-300'} ${disabled ? 'opacity-50' : ''}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
            </div>
        </label>
    );
};
