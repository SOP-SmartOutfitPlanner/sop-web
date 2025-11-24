declare module '@goongmaps/goong-js' {
  export interface MapOptions {
    container: HTMLElement | string;
    style: string;
    center: [number, number];
    zoom: number;
    attributionControl?: boolean;
  }

  export interface LngLat {
    lng: number;
    lat: number;
  }

  export interface MapMouseEvent {
    lngLat: LngLat;
  }

  export interface MarkerOptions {
    color?: string;
  }

  export interface Control {
    onAdd?(map: Map): HTMLElement;
    onRemove?(map: Map): void;
  }

  export class Map {
    constructor(options: MapOptions);
    on(event: 'load', callback: () => void): this;
    on(event: 'error', callback: (e: { error: Error }) => void): this;
    on(event: 'click', callback: (e: MapMouseEvent) => void): this;
    on(event: string, callback: (e?: MapMouseEvent | { error: Error }) => void): this;
    addControl(control: Control | NavigationControl, position?: string): this;
    flyTo(options: { center: [number, number]; zoom: number }): this;
    getCenter(): LngLat;
    remove(): void;
  }

  export class Marker {
    constructor(options?: MarkerOptions);
    setLngLat(lngLat: [number, number]): this;
    addTo(map: Map): this;
    remove(): this;
  }

  export class NavigationControl {
    constructor();
  }

  export let accessToken: string;

  const goongjs: {
    Map: typeof Map;
    Marker: typeof Marker;
    NavigationControl: typeof NavigationControl;
    accessToken: string;
  };

  export default goongjs;
}
