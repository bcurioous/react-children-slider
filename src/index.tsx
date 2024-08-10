import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { wrap } from 'popmotion';

import { cn } from './lib/utils';

// export interface Props extends HTMLAttributes<HTMLDivElement> {
//   /** custom content, defaults to 'the snozzberries taste like snozzberries' */
//   children?: ReactChild;
// }

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */
// export const Thing: FC<Props> = ({ children }) => {
//   return <div>{children || `the snozzberries taste like snozzberries`}</div>;
// };

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

type CarouselProps = {
  children: React.ReactNode;
  classes?: {
    root?: string;
    activeWrapper?: string;
    activeItem?: string;
    left?: string;
    right?: string;
  };
};

export function Carousel({ children, classes }: CarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  // We only have 3 images, but we paginate them absolutely (ie 1, 2, 3, 4, 5...) and
  // then wrap that within 0-2 to find our image ID in the array below. By passing an
  // absolute page index as the `motion` component's `key` prop, `AnimatePresence` will
  // detect it as an entirely new image. So you can infinitely paginate as few as 1 images.
  const childrenIndex = wrap(0, React.Children.count(children), page);

  const childrenItems = React.Children.toArray(children);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        classes?.root
      )}
    >
      <div
        className={cn(
          'relative flex flex-row w-full h-full',
          classes?.activeWrapper
        )}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            className={cn('w-full h-full', classes?.activeItem)}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            // exit='exit'
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
          >
            {childrenItems[childrenIndex]}
          </motion.div>
        </AnimatePresence>

        <div
          className={cn(
            'absolute top-[30%] left-1 text-white rounded-full w-10 h-10 flex items-center justify-center select-none cursor-pointer font-bold text-lg z-10',
            classes?.left
          )}
          onClick={() => paginate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-8 h-8 shrink-0 stroke stroke-current fill-none"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>
        <div
          className={cn(
            'absolute top-[30%] right-1 text-white rounded-full w-10 h-10 flex items-center justify-center select-none cursor-pointer font-bold text-lg z-10',

            classes?.right
          )}
          onClick={() => paginate(1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-8 h-8 shrink-0 stroke stroke-current fill-none"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
      <div className="flex gap-1">
        {childrenItems.map((_, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'w-fit h-fit p-0 bg-transparent',
              childrenIndex === index ? 'text-[#5F1DA1]' : 'text-[#27214A]'
            )}
            onClick={() => paginate(index)}
          >
            <svg
              className="w-5 h-5 fill-current stroke-none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"></path>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
