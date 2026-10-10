import { RECTANGLE_FAMILIES } from './families/rectangles.js';
import { TRIANGLE_FAMILIES } from './families/triangles.js';
import { TRAPEZOID_FAMILIES } from './families/trapezoids.js';
import { RHOMBUS_FAMILIES } from './families/rhombi.js';
import { PARALLELOGRAM_FAMILIES } from './families/parallelograms.js';
import { SEGMENT_FAMILIES } from './families/segments.js';
import { COMPOSITE_FAMILIES } from './families/composites.js';
import { COMPLEX_FAMILIES, COMPLEX_USED } from './families/complex.js';

export const FAMILIES = {
  ...RECTANGLE_FAMILIES,
  ...TRIANGLE_FAMILIES,
  ...TRAPEZOID_FAMILIES,
  ...RHOMBUS_FAMILIES,
  ...PARALLELOGRAM_FAMILIES,
  ...SEGMENT_FAMILIES,
  ...COMPOSITE_FAMILIES,
  ...COMPLEX_FAMILIES
};

export { COMPLEX_USED };
