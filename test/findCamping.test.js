const {point, polygon} = require('@turf/turf');
const {pointInFeatures, nearestLegal} = require('../findCamping');

describe('camping utilities', () => {
  const poly1 = polygon([[
    [0,0], [0,1], [1,1], [1,0], [0,0]
  ]]);
  const poly2 = polygon([[
    [10,0], [10,1], [11,1], [11,0], [10,0]
  ]]);
  const features = [poly1, poly2];

  test('pointInFeatures inside polygon', () => {
    const p = point([0.5, 0.5]);
    expect(pointInFeatures(p, features)).toBe(true);
  });

  test('pointInFeatures outside polygons', () => {
    const p = point([5,5]);
    expect(pointInFeatures(p, features)).toBe(false);
  });

  test('nearestLegal returns closest centroid', () => {
    const nearP = point([0.2, 0.2]);
    const nearest = nearestLegal(nearP, features);
    expect(nearest.geometry.coordinates[0]).toBeCloseTo(0.5);
    expect(nearest.geometry.coordinates[1]).toBeCloseTo(0.5);
  });
});
