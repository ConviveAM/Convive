import { PROFILE_AVATAR_DEFAULTS } from "../../lib/profile-avatar";

type ProfileAvatarProps = {
  src?: string | null;
  alt?: string;
  width: number;
  height: number;
  className?: string;
};

export function ProfileAvatar({
  src,
  alt = "",
  width,
  height,
  className,
}: ProfileAvatarProps) {
  const fallbackSrc = PROFILE_AVATAR_DEFAULTS[0];
  const resolvedSrc = src || fallbackSrc;
  const wrapperStyle = {
    width,
    height,
    minWidth: width,
    minHeight: height,
    maxWidth: width,
    maxHeight: height,
    borderRadius: "999px",
    overflow: "hidden",
    display: "inline-block",
    flex: "0 0 auto",
    lineHeight: 0,
  } as const;
  const imageStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "999px",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  } as const;

  return (
    <span className={className} style={wrapperStyle}>
      <img
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        style={imageStyle}
      />
    </span>
  );
}
