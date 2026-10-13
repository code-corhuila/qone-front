import type { ReactNode } from "react";
import type { PortalName } from "../remotes/registry";

// Stroke icons of the shell (24x24, 1.75 stroke, Lucide-like geometry). Always decorative: the
// text next to them carries the meaning, so every one is aria-hidden.
function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = () => (
  <Icon>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </Icon>
);

const BookIcon = () => (
  <Icon>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
    <path d="M8 7h8M8 11h6" />
  </Icon>
);

const ClipboardIcon = () => (
  <Icon>
    <rect x="5" y="4" width="14" height="18" rx="2" />
    <path d="M9 4V2.5h6V4" />
    <path d="m9 13 2 2 4-4" />
  </Icon>
);

const ReceiptIcon = () => (
  <Icon>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6M9 15h3" />
  </Icon>
);

const SparkIcon = () => (
  <Icon>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="m12 8 1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z" />
  </Icon>
);

const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Icon>
);

export const PORTAL_ICON: Record<PortalName, () => ReactNode> = {
  identity: UserIcon,
  catalog: BookIcon,
  enrollment: ClipboardIcon,
  billing: ReceiptIcon,
  advisor: SparkIcon,
};

export const MenuIcon = () => (
  <Icon size={22}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon size={22}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SignOutIcon = () => (
  <Icon size={18}>
    <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
    <path d="M10 17l-5-5 5-5M5 12h11" />
  </Icon>
);

export const ArrowIcon = () => (
  <Icon size={18}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
