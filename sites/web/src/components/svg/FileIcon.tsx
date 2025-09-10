import { generateManifest, ManifestConfig } from "material-icon-theme";
import React from "react";
import { twMerge } from "tailwind-merge";

const config: ManifestConfig = {
  activeIconPack: "react",
};

const manifest = generateManifest(config);

const getIconName = (extension: string) => {
  if (!manifest.fileExtensions || !manifest.iconDefinitions) return "";
  const iconName = manifest.fileExtensions[extension];
  return iconName;
};

type FileIconProps = {
  extension: string;
  size?: number;
  color?: string;
  className?: string;
};

export const FileIcon: React.FC<FileIconProps> = ({
  extension,
  size = 24,
  color = "currentColor",
  className = "",
}) => {
  const iconName = getIconName(extension);

  const fallbackSVG = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V9L13 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 2V9H20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (iconName)
    return (
      <img src={`/material-icons/${iconName}.svg`} className={twMerge("h-24 w-24", className)} />
    );

  return fallbackSVG;
};

export default FileIcon;
