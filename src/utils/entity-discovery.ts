/**
 * Entity Discovery Utilities
 * Discover related entities from a device without hardcoded naming patterns
 */

import { HomeAssistant, HassEntity } from "../types/homeassistant";

export interface DeviceEntities {
  phoneState: string;
  currentDialingNumber: string | null;
  callHistory: string | null;
  currentCallNumber: string | null;
  // Add more as needed
}

/**
 * Get the device ID from an entity using WebSocket API
 */
async function getDeviceIdFromEntity(
  hass: HomeAssistant,
  entityId: string
): Promise<string | null> {
  try {
    const entities = await hass.callWS<any[]>({
      type: "config/entity_registry/list",
    });

    const entity = entities.find((e) => e.entity_id === entityId);
    return entity?.device_id || null;
  } catch (error) {
    console.error("[EntityDiscovery] Failed to get device ID:", error);
    return null;
  }
}

/**
 * Get all entities belonging to a device
 */
async function getDeviceEntities(
  hass: HomeAssistant,
  deviceId: string
): Promise<string[]> {
  try {
    const entities = await hass.callWS<any[]>({
      type: "config/entity_registry/list",
    });

    return entities
      .filter((e) => e.device_id === deviceId)
      .map((e) => e.entity_id);
  } catch (error) {
    console.error("[EntityDiscovery] Failed to get device entities:", error);
    return [];
  }
}

/**
 * Discover all TsuryPhone entities from a single phone_state entity
 */
export async function discoverTsuryPhoneEntities(
  hass: HomeAssistant,
  phoneStateEntityId: string
): Promise<DeviceEntities> {
  // Get the device ID from the phone_state entity
  const deviceId = await getDeviceIdFromEntity(hass, phoneStateEntityId);
  if (!deviceId) {
    console.error(
      "[EntityDiscovery] Could not find device ID for entity:",
      phoneStateEntityId
    );
    return {
      phoneState: phoneStateEntityId,
      currentDialingNumber: null,
      callHistory: null,
      currentCallNumber: null,
    };
  }

  // Get all entities for this device
  const allEntityIds = await getDeviceEntities(hass, deviceId);

  // Find specific entities by matching patterns in entity_id
  const result: DeviceEntities = {
    phoneState: phoneStateEntityId,
    currentDialingNumber:
      allEntityIds.find((id) => id.includes("current_dialing_number")) || null,
    callHistory: allEntityIds.find((id) => id.includes("call_history")) || null,
    currentCallNumber:
      allEntityIds.find((id) => id.includes("current_call_number")) || null,
  };

  return result;
}

/**
 * Cache for discovered entities to avoid repeated WebSocket calls
 */
const entityCache = new Map<string, DeviceEntities>();

/**
 * Get discovered entities with caching
 */
export async function getCachedTsuryPhoneEntities(
  hass: HomeAssistant,
  phoneStateEntityId: string
): Promise<DeviceEntities> {
  if (entityCache.has(phoneStateEntityId)) {
    return entityCache.get(phoneStateEntityId)!;
  }

  const entities = await discoverTsuryPhoneEntities(hass, phoneStateEntityId);
  entityCache.set(phoneStateEntityId, entities);
  return entities;
}

/**
 * Clear the cache (call this if devices are added/removed)
 */
export function clearEntityCache(): void {
  entityCache.clear();
}
