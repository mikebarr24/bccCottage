import Link from 'next/link';

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react';

type BaseProps = {
  children?: ReactNode;
  className?: string;
  size?: 'default' | 'compact';
};

type ButtonVariant = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkVariant = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export type UpdateButtonProps = ButtonVariant | LinkVariant;

const BASE_CLASSES =
  'inline-flex items-center rounded-full border border-slate-300 font-semibold text-slate-700 transition hover:bg-slate-100';

const SIZE_MAP: Record<NonNullable<BaseProps['size']>, string> = {
  default: 'px-3 py-1 text-xs',
  compact: 'px-2 py-0.5 text-[11px]',
};

export function UpdateButton(props: UpdateButtonProps) {
  if ('href' in props && props.href) {
    const { className, children, href, size = 'default', ...linkProps } = props;
    const mergedClasses = `${BASE_CLASSES} ${SIZE_MAP[size]}${className ? ` ${className}` : ''}`;

    return (
      <Link href={href} className={mergedClasses} {...linkProps}>
        {children ?? 'Update'}
      </Link>
    );
  }

  const { className, children, type, size = 'default', ...buttonProps } = props;
  const mergedClasses = `${BASE_CLASSES} ${SIZE_MAP[size]}${className ? ` ${className}` : ''}`;

  return (
    <button type={type ?? 'button'} className={mergedClasses} {...buttonProps}>
      {children ?? 'Update'}
    </button>
  );
}


