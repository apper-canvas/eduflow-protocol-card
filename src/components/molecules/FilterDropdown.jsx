import React from 'react';
import Select from '@/components/atoms/Select';

const FilterDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "All", 
  className,
  multiple = false 
}) => {
  return (
    <div className={className}>
<Select
        label={label}
        value={value}
        onChange={onChange}
        className="min-w-32"
        multiple={multiple}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default FilterDropdown;