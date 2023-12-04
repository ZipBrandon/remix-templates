import type { MotionValue } from "framer-motion";
import * as React from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { zipClsx } from "./zipClsx.ts";

/* -------------------------------------------------------------------------------------------------
 * Slot
 *
 * This uses Radix UI, and it is pretty much all that code, except that it uses zipClsx to combined and merge the tailwind classes-----------------------------------------------------------------------------------------------*/

interface ZipSlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  framerScroll?: {
    scrollX: MotionValue<number>;
    scrollY: MotionValue<number>;
    scrollXProgress: MotionValue<number>;
    scrollYProgress: MotionValue<number>;
  };
}

const ZipSlot = React.forwardRef<HTMLElement, ZipSlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    // the new element to render is the one passed as a child of `Slottable`
    const newElement = slottable.props.children as React.ReactNode;

    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        // because the new element will be the one rendered, we are only interested
        // in grabbing its children (`newElement.props.children`)
        if (React.Children.count(newElement) > 1) return React.Children.only(null);
        return React.isValidElement(newElement)
          ? (newElement.props.children as React.ReactNode)
          : null;
      } else {
        return child;
      }
    });

    return (
      <ZipSlotClone {...slotProps} ref={forwardedRef}>
        {React.isValidElement(newElement)
          ? React.cloneElement(newElement, undefined, newChildren)
          : null}
      </ZipSlotClone>
    );
  }

  return (
    <ZipSlotClone {...slotProps} ref={forwardedRef}>
      {children}
    </ZipSlotClone>
  );
});

ZipSlot.displayName = `ZipSlot`;

/* -------------------------------------------------------------------------------------------------
 * ZipSlotClone
 * -----------------------------------------------------------------------------------------------*/

interface ZipSlotCloneProps {
  children: React.ReactNode;
}

const ZipSlotClone = React.forwardRef<any, ZipSlotCloneProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      ref: forwardedRef ? composeRefs(forwardedRef, (children as any).ref) : (children as any).ref,
    });
  }

  return React.Children.count(children) > 1 ? React.Children.only(null) : null;
});

ZipSlotClone.displayName = `ZipSlotClone`;

/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/

const ZipSlottable = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/* ---------------------------------------------------------------------------------------------- */

type AnyProps = Record<string, any>;

function isSlottable(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child) && child.type === ZipSlottable;
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  // all child props should override
  const overrideProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      // if the handler exists on both, we compose them
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      }
      // but if it exists only on the slot, we use only this one
      else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    }
    // if it's `style`, we merge them
    else if (propName === `style`) {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === `className`) {
      overrideProps[propName] = zipClsx(slotPropValue, childPropValue);
    }
  }

  return { ...slotProps, ...overrideProps };
}

export { ZipSlot, ZipSlottable };
export type { ZipSlotProps };
