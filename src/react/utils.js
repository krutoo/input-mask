export const on = (
  target,
  eventName,
  handler,
  options
) => {
  target.addEventListener(eventName, handler, options);

  return () => {
    target.removeEventListener(eventName, handler, options);
  };
};
