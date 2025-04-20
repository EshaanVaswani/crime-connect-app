export default async function getLocation(lat: number, lng: number) {
   try {
     const headers = new Headers({
       'User-Agent': 'CrimeConnect/1.0 (your@email.com)', 
       'Accept-Language': 'en-US,en;q=0.9',
     });
 
     const response = await fetch(
       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
       { headers }
     );
 
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
 
     const data = await response.json();
     return data.display_name || `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
   } catch (error) {
     console.error('Geocoding error:', error);
     return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
   }
 }