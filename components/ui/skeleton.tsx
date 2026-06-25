import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const skeletonVariants = cva("bg-muted animate-pulse", {
  variants: {
    variant: {
      line: "rounded-lg h-4 w-full",
      title: "rounded-lg h-6 w-2/3",
      avatar: "rounded-full h-10 w-10",
      card: "rounded-2xl h-32 w-full",
    },
  },
  defaultVariants: {
    variant: "line",
  },
});

function Skeleton({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton };
