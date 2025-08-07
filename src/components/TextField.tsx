import React from "react";
import { useField } from "formik";

interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}

const TextField: React.FC<TextFieldProps> = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={props.name}
        className="text-[14px] font-poppins-medium text-black"
      >
        {label}
      </label>
      <input
        {...field}
        {...props}
        id={props.name}
        className="px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0]"
      />
      {meta.touched && meta.error ? (
        <div className="text-xs text-red-600 mt-1 font-medium">
          {meta.error}
        </div>
      ) : null}
    </div>
  );
};

export default TextField;
