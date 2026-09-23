/** Iconos de trazo fino, dibujados a mano para no depender de terceros. */
import type { JSX } from 'preact';

type P = { size?: number; class?: string };

const Svg = ({ size = 22, class: c, children }: P & { children: JSX.Element | JSX.Element[] }) => (
  <svg
    class={c}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconLibrary = (p: P) => (
  <Svg {...p}>
    <path d="M4 4.5h3.5v15H4z" />
    <path d="M9.5 4.5H13v15H9.5z" />
    <path d="m15.2 5.3 3.3-.9 2.9 14.4-3.3.9z" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M12 6.5C10 5 7.5 4.5 3.5 4.8v13.4c4-.3 6.5.2 8.5 1.8 2-1.6 4.5-2.1 8.5-1.8V4.8c-4-.3-6.5.2-8.5 1.7Z" />
    <path d="M12 6.5V20" />
  </Svg>
);

export const IconLine = (p: P) => (
  <Svg {...p}>
    <path d="M4 6h16" opacity=".35" />
    <path d="M3 12h18" stroke-width="2.4" />
    <path d="M4 18h16" opacity=".35" />
  </Svg>
);

export const IconToc = (p: P) => (
  <Svg {...p}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <circle cx="4" cy="6" r=".6" fill="currentColor" />
    <circle cx="4" cy="12" r=".6" fill="currentColor" />
    <circle cx="4" cy="18" r=".6" fill="currentColor" />
  </Svg>
);

export const IconType = (p: P) => (
  <Svg {...p}>
    <path d="M3 19 8 6l5 13M4.8 14.5h6.4" />
    <path d="M15.5 19l3.2-8 3.3 8M16.5 16.5h4.4" />
  </Svg>
);

export const IconUp = (p: P) => (
  <Svg {...p}>
    <path d="m6 14 6-6 6 6" />
  </Svg>
);

export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconPage = (p: P) => (
  <Svg {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 15.5h6M9 8.5h2.5" />
  </Svg>
);

export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Svg>
);

export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconWarn = (p: P) => (
  <Svg {...p}>
    <path d="M12 4 2.8 19.5h18.4z" />
    <path d="M12 10v4.5M12 17.2v.3" />
  </Svg>
);

export const IconLock = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);

export const IconScan = (p: P) => (
  <Svg {...p}>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <path d="M8 9.5h8M8 12h8M8 14.5h5" />
  </Svg>
);

export const IconMinus = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconZoomIn = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5M11 8v6M8 11h6" />
  </Svg>
);

export const IconZoomOut = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5M8 11h6" />
  </Svg>
);
