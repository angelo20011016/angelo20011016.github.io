/**
 * This declaration file is a workaround for an issue with the @splidejs/react-splide package.
 * The package.json "exports" map prevents TypeScript's "bundler" module resolution strategy
 * from finding the built-in type declarations.
 *
 * This file explicitly declares the 'Splide' and 'SplideSlide' components as named exports with 'any' type,
 * resolving the module resolution and "no exported member" errors.
 */
declare module '@splidejs/react-splide' {
  export const Splide: any;
  export const SplideSlide: any;
  // You might need to add other types or components here if you use them, e.g.:
  // export type { Options } from '@splidejs/splide';
}
