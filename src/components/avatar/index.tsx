import React from 'react';

interface IAvatarProps {
  src: string;
  height: number;
  width: number;
}

const Avatar: React.FC<IAvatarProps> = ({src, height, width}) => {
  return (
    // <div
    //   className={`flex justify-center items-center rounded-full bg-green-600`}
    //   style={{height: `${height}px`, width: `${width}px`}}
    // >
    //   N
    // </div>
    <img alt="avt" src={src} style={{height: `${height}px`, width: `${width}px`, borderRadius: 50}} />
  );
};

export default Avatar;
