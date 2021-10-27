import { store } from "@risingstack/react-easy-state";


/**
 * Creates a react-easy-state store that drops the state when the key changes.
 * State dropping will cause multiple renders of React components, but with
 * proper architecture, the re-renders should be limited to the components
 * that actually need to be updated as a result of the state drop.
 *
 * @param key current store key. If the previous key value is different in
 *            terms of the === operator, the store will be initialized
 *            with the provided defaults.
 * @param defaults the default values to set on the store. The defaults don't
 *                 have to be the same on each invocation. In fact, the key will
 *                 likely be the function of the defaults or vice versa.
 * @param methods
 */
export const keyedStore = (key, defaults, methods) => {
  const s = store(methods);

  if (s.key !== key) {
    s.key = key;
    Object.assign(s, defaults);
  }

  return s;
};
