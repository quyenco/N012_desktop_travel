import React from 'react';

interface IDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  indent?: number;
  size?: number;
  dashed?: boolean;
  dashColor?: string;
  isLongDash?: boolean;
}

const Divider = ({
  indent,
  size = 1,
  dashed = false,
  dashColor = 'black',
  isLongDash = false,
  ...otherProps
}: IDividerProps) => {
  return (
    <div
      {...otherProps}
      style={{
        borderTopWidth: size,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: 'rgb(247 247 248 / var(--tw-bg-opacity))',
        marginLeft: indent,
        marginRight: indent,
        borderImage:
          dashed && isLongDash
            ? `repeating-linear-gradient(to right, ${dashColor} 0, ${dashColor} 10px, transparent 10px, transparent 20px) 1`
            : 'none',
      }}
    />
  );
};

export default Divider;
