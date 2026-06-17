/* eslint-disable @typescript-eslint/no-explicit-any */
// Cesium type declarations - full any override to bypass incomplete built-in types
declare module 'cesium' {
  const Cesium: any;
  export default Cesium;
}

// Also declare the window CESIUM_BASE_URL
interface Window {
  CESIUM_BASE_URL?: string;
}
