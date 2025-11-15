import { ComponentPropsWithoutRef } from 'react';

type ListCardProps = ComponentPropsWithoutRef<'div'>;

export function ListCard({ className, ...props }: ListCardProps) {
  return (
    <div
      className={mergeClasses('rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm', className)}
      {...props}
    />
  );
}

type ListCardSectionProps = ComponentPropsWithoutRef<'div'>;

export function ListCardHeader({ className, ...props }: ListCardSectionProps) {
  return (
    <div className={mergeClasses('flex flex-wrap items-center gap-2', className)} {...props} />
  );
}

type ListCardTitleProps = ComponentPropsWithoutRef<'h3'>;

export function ListCardTitle({ className, ...props }: ListCardTitleProps) {
  return (
    <h3 className={mergeClasses('text-lg font-semibold text-slate-900', className)} {...props} />
  );
}

type ListCardDescriptionProps = ComponentPropsWithoutRef<'p'>;

export function ListCardDescription({ className, ...props }: ListCardDescriptionProps) {
  return (
    <p className={mergeClasses('text-sm text-slate-600', className)} {...props} />
  );
}

export function ListCardMeta({ className, ...props }: ListCardSectionProps) {
  return (
    <div
      className={mergeClasses(
        'mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500',
        className,
      )}
      {...props}
    />
  );
}

export function ListCardActions({ className, ...props }: ListCardSectionProps) {
  return (
    <div className={mergeClasses('mt-4 flex flex-wrap items-center gap-3', className)} {...props} />
  );
}

function mergeClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

