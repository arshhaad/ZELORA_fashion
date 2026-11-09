import React, { useState } from 'react';
import { Store, ShieldCheck } from 'lucide-react';

/**
 * Checks whether an image URL is a demo stock model photo
 * that should be replaced with an authentic luxury emblem/monogram.
 */
export const isDemoStockPhoto = (url) => {
  if (!url || typeof url !== 'string') return true;
  return (
    url.includes('unsplash') ||
    url.includes('photo-') ||
    url.includes('placeholder') ||
    url.includes('demo') ||
    url.includes('avatar-demo')
  );
};

/**
 * ShopLogoBadge:
 * Displays an uploaded/real brand logo, OR an authentic luxury boutique monogram crest.
 * Prevents random demo model photos from ever displaying as shop logos.
 */
export function ShopLogoBadge({
  logo,
  name = 'Atelier',
  size = 48,
  className = '',
  style = {}
}) {
  const [imgError, setImgError] = useState(false);

  const hasValidLogo = Boolean(logo && !isDemoStockPhoto(logo) && !imgError);

  if (hasValidLogo) {
    return (
      <img
        src={logo}
        alt={name}
        className={className}
        onError={() => setImgError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: size > 40 ? '8px' : '6px',
          objectFit: 'cover',
          border: '1px solid #23232C',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  // Generate clean 1-2 letter monogram
  const cleanName = (name || 'Atelier').replace(/['"’]/g, '');
  const words = cleanName.split(/\s+/).filter(Boolean);
  const monogram = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: size > 40 ? '8px' : '6px',
        background: 'linear-gradient(135deg, #1C1C24 0%, #111116 100%)',
        border: '1px solid rgba(198, 166, 100, 0.45)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#C6A664',
        userSelect: 'none',
        ...style,
      }}
      title={name}
    >
      <span
        style={{
          fontSize: `${Math.max(11, Math.round(size * 0.36))}px`,
          fontWeight: 800,
          letterSpacing: '0.5px',
          lineHeight: 1,
          fontFamily: 'serif',
        }}
      >
        {monogram}
      </span>
      {size >= 44 && (
        <span
          style={{
            fontSize: '7px',
            letterSpacing: '0.8px',
            color: '#8E743F',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginTop: '3px',
            fontWeight: 700,
          }}
        >
          ATELIER
        </span>
      )}
    </div>
  );
}

/**
 * UserAvatarBadge:
 * Displays real user avatar (e.g. Google profile picture or uploaded image),
 * OR an authentic monogram circle. Prevents random demo model photos from displaying.
 */
export function UserAvatarBadge({
  avatar,
  name = 'User',
  email = '',
  role = '',
  size = 36,
  className = '',
  style = {}
}) {
  const [imgError, setImgError] = useState(false);

  const hasValidAvatar = Boolean(avatar && !isDemoStockPhoto(avatar) && !imgError);

  if (hasValidAvatar) {
    return (
      <img
        src={avatar}
        alt={name || email}
        className={className}
        onError={() => setImgError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid #23232C',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  const displayName = (name && name !== 'Customer' && name !== 'Seller' && name !== 'User')
    ? name
    : (email ? email.split('@')[0] : 'User');

  const initials = displayName
    .replace(/['"’]/g, '')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const isAdmin = (role && role.toLowerCase().includes('admin')) || displayName.toLowerCase().includes('admin');

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: isAdmin ? '#1A1813' : '#1C1C24',
        border: `1px solid ${isAdmin ? '#C6A664' : '#2E2E38'}`,
        color: isAdmin ? '#C6A664' : '#F6F6F9',
        boxShadow: isAdmin ? '0 2px 8px rgba(198, 166, 100, 0.2)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.max(10, Math.round(size * 0.36))}px`,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '0.5px',
        userSelect: 'none',
        ...style,
      }}
      title={name || email}
    >
      {initials}
    </div>
  );
}

