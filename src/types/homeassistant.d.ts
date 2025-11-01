/**
 * Home Assistant Types
 * Minimal type definitions for Home Assistant custom cards
 */

export interface HomeAssistant {
  states: { [entity_id: string]: HassEntity };
  services: { [domain: string]: { [service: string]: any } };
  config: HassConfig;
  themes: {
    darkMode: boolean;
    themes: { [key: string]: any };
  };
  language: string;
  connection: Connection;
  callService(
    domain: string,
    service: string,
    serviceData?: any,
    targetOrReturnResponse?: { entity_id?: string | string[]; device_id?: string | string[]; area_id?: string | string[] } | boolean
  ): Promise<any>;
  callWS<T>(msg: any): Promise<T>;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: { [key: string]: any };
  last_changed: string;
  last_updated: string;
  context: Context;
}

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  whitelist_external_dirs: string[];
  allowlist_external_dirs: string[];
  version: string;
  config_source: string;
  safe_mode: boolean;
  state: "NOT_RUNNING" | "STARTING" | "RUNNING" | "STOPPING" | "FINAL_WRITE" | "ERROR";
  external_url: string | null;
  internal_url: string | null;
}

export interface Context {
  id: string;
  parent_id?: string;
  user_id?: string;
}

export interface Connection {
  subscribeMessage<T>(
    callback: (message: T) => void,
    subscribeMessage: any
  ): Promise<() => void>;
  subscribeEvents<T = any>(
    callback: (event: T) => void,
    eventType?: string
  ): Promise<() => void>;
  sendMessagePromise<T>(message: any): Promise<T>;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: any): void;
  getCardSize?(): number;
}
