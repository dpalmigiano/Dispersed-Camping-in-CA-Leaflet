#!/usr/bin/env node
const {point} = require('@turf/turf');
const {loadGeoJSON, pointInFeatures, nearestLegal} = require('./findCamping');

const CAMP_URL = 'https://gist.githubusercontent.com/EricSamsonCarto/af6dc91c42439d8319ab1659981f003e/raw/c8f595f6d29fa828c4c8f6e0c869c62992c74384/CampLand.geojson';
const NOCAMP_URL = 'https://gist.githubusercontent.com/EricSamsonCarto/7e726743481826e0a4c5dff96f99db38/raw/b114b9b9438783b9479f4b08e0031f03f7a83ae2/NoCampLand.geojson';

async function main() {
  const [latStr, lonStr] = process.argv.slice(2);
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  if (isNaN(lat) || isNaN(lon)) {
    console.error('Usage: node checkCamping.js <latitude> <longitude>');
    process.exit(1);
  }
  const pt = point([lon, lat]);
  try {
    const camp = await loadGeoJSON(CAMP_URL);
    const noCamp = await loadGeoJSON(NOCAMP_URL);
    if (pointInFeatures(pt, camp.features)) {
      console.log('Camping allowed here');
    } else if (pointInFeatures(pt, noCamp.features)) {
      const nearest = nearestLegal(pt, camp.features);
      if (nearest) {
        const [nLon, nLat] = nearest.geometry.coordinates;
        console.log(`https://www.google.com/maps/dir/?api=1&destination=${nLat},${nLon}&travelmode=driving&dir_action=navigate`);
      } else {
        console.log('No legal location found nearby.');
      }
    } else {
      console.log('Location legality unknown.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
