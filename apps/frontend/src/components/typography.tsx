import clsx from 'clsx';
import type React from 'react';
import type { FC, JSX } from 'react';

const baseStyles = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight',
  h2: 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-6"',
  code: 'rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
  blockquote: 'mt-6 border-l-2 pl-6 italic',
  ul: 'my-6 ml-6 list-disc [&>li]:mt-2',
  table: 'w-full',
  thead: 'px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
  tbody: 'px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
  tr: 'p-0 even:bg-muted',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm leading-none font-medium',
  mute: 'text-sm text-muted-foreground',
};

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const createTypographyComponent = (
  tag: keyof JSX.IntrinsicElements,
  defaultClassName: string,
): FC<TypographyProps> => {
  return ({ className, children, ...rest }) => {
    const Component = tag;
    return (
      <Component
        className={clsx(defaultClassName, className)}
        {...(rest as Record<string, string>)}
      >
        {children}
      </Component>
    );
  };
};

export const Typography = {
  h1: createTypographyComponent('h1', baseStyles.h1),
  h2: createTypographyComponent('h2', baseStyles.h2),
  h3: createTypographyComponent('h3', baseStyles.h3),
  h4: createTypographyComponent('h4', baseStyles.h4),
  h5: createTypographyComponent('h5', baseStyles.h5),
  p: createTypographyComponent('p', baseStyles.p),
  lead: createTypographyComponent('p', baseStyles.lead),
  large: createTypographyComponent('p', baseStyles.large),
  mute: createTypographyComponent('p', baseStyles.mute),
  small: createTypographyComponent('small', baseStyles.small),
  code: createTypographyComponent('code', baseStyles.code),
  blockquote: createTypographyComponent('blockquote', baseStyles.blockquote),
  ul: createTypographyComponent('ul', baseStyles.ul),
  table: createTypographyComponent('table', baseStyles.table),
  thead: createTypographyComponent('thead', baseStyles.thead),
  tbody: createTypographyComponent('tbody', baseStyles.tbody),
  tr: createTypographyComponent('tr', baseStyles.tr),
};

export default Typography;
