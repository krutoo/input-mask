import { useRef } from 'react';

export const useActualRef = value => {
  const ref = useRef();
  ref.current = value;
  return ref;
};
