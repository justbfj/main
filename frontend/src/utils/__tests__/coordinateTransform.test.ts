import { transformCoordinate, extractEPSGCode } from '../coordinateTransform';

describe('Coordinate Transform Functions', () => {
  test('should extract EPSG code from CRS object', () => {
    const crs = {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:EPSG::6346' }
    };
    
    const epsgCode = extractEPSGCode(crs);
    expect(epsgCode).toBe('6346');
  });

  test('should transform coordinates from EPSG:6346 to WGS84', async () => {
    // Sample coordinate from the test flight lines data
    const coord: [number, number] = [573729.312046134262346, 4957893.406163912266493];
    
    const transformedCoord = await transformCoordinate(coord, '6346', '4326');
    
    // Should be valid lat/lng coordinates
    expect(transformedCoord[0]).toBeGreaterThan(-180);
    expect(transformedCoord[0]).toBeLessThan(180);
    expect(transformedCoord[1]).toBeGreaterThan(-90);
    expect(transformedCoord[1]).toBeLessThan(90);
    
    console.log(`Transformed: [${coord[0]}, ${coord[1]}] → [${transformedCoord[0]}, ${transformedCoord[1]}]`);
  });
});

console.log('✅ Coordinate transform test module loaded successfully');