import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "light" | "outline-light";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 text-[0.8rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 ease-expo disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary-dark text-background hover:text-background",
  outline: "border border-ink/25 text-ink hover:border-primary-dark hover:text-background",
  light: "bg-background text-primary-dark hover:text-background",
  "outline-light": "border border-background/40 text-background hover:border-background hover:text-primary-dark",
};

const fills: Record<Variant, string> = {
  primary: "bg-primary",
  outline: "bg-primary-dark",
  light: "bg-primary",
  "outline-light": "bg-background",
};

interface Common {
  variant?: Variant;
  icon?: ReactNode | false;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}

function Inner({ variant = "primary", icon, children }: Pick<Common, "variant" | "icon" | "children">) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-700 ease-expo group-hover/btn:scale-y-100",
          fills[variant],
        )}
      />
      <span className="relative">{children}</span>
      {icon !== false && (
        <span className="relative inline-flex size-4 overflow-hidden" aria-hidden>
          <span className="flex transition-transform duration-500 ease-expo group-hover/btn:-translate-y-full group-hover/btn:translate-x-full">
            {icon ?? <ArrowUpRight size={16} strokeWidth={1.5} />}
          </span>
          <span className="absolute -bottom-full -left-full flex transition-transform duration-500 ease-expo group-hover/btn:-translate-y-full group-hover/btn:translate-x-full">
            {icon ?? <ArrowUpRight size={16} strokeWidth={1.5} />}
          </span>
        </span>
      )}
    </>
  );
}

type ButtonLinkProps = Common & Omit<ComponentProps<typeof Link>, "className" | "children"> & { external?: boolean };

export function ButtonLink({ variant, icon, magnetic = true, className, children, external, href, ...rest }: ButtonLinkProps) {
  const cls = cn(base, variants[variant ?? "primary"], className);
  const content = <Inner variant={variant} icon={icon}>{children}</Inner>;
  const el = external ? (
    <a href={String(href)} target="_blank" rel="noopener noreferrer" className={cls} {...(rest as ComponentProps<"a">)}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls} {...rest}>
      {content}
    </Link>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

type ButtonProps = Common & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({ variant, icon, magnetic = false, className, children, type = "button", ...rest }: ButtonProps) {
  const el = (
    <button type={type} className={cn(base, variants[variant ?? "primary"], className)} {...rest}>
      <Inner variant={variant} icon={icon}>{children}</Inner>
    </button>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

/** Enlace de texto editorial con subrayado animado y flecha. */
export function TextLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const cls = cn("group/link inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em]", className);
  const inner = (
    <>
      <span className="link-underline link-underline-static">{children}</span>
      <ArrowUpRight size={15} strokeWidth={1.5} className="transition-transform duration-500 ease-expo group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
