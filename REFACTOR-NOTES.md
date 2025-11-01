# Refactoring Notes - Data Structure Cleanup

## Completed: Priority Callers Cleanup ✅

**Date**: November 2, 2025  
**Backend Version**: v1.0.129  
**Frontend Version**: v0.1.29-alpha

### What Was Removed
- **Removed**: `priorityCallers` array (simple list of phone number strings)
- **Kept**: `priorityCallerDetails` array (full objects with id, number, name, etc.)

### Rationale
- Eliminates duplication in firmware state snapshot
- Single source of truth for priority caller data
- Consistent with `quickDialDetails` and `blockedDetails` patterns
- Cleaner data model

### Changes Made
**Firmware**: No changes needed (already sends both, backend now ignores old format)
**Backend** (v1.0.129): 
- `coordinator.py`: Only parses `priorityCallerDetails`, ignores `priorityCallers`
- Validates required fields (id, number)
- No backward compatibility

**Frontend** (v0.1.29-alpha):
- Already using correct `priority_callers` attribute
- No changes needed

---

## Future Consideration: normalized_number vs number

### Current State
Every entity has BOTH fields:
- `number`: Original number from firmware  
- `normalized_number`: E.164 normalized version (e.g., "+972546662771")

### The Issue
- In practice, they're almost always identical
- Creates confusion about which to use
- Adds unnecessary duplication

### Proposed Cleanup (NOT YET IMPLEMENTED)
**Option 1**: Keep only `number` (which IS the normalized number)
- Pro: Simpler
- Con: Name doesn't make it clear it's normalized

**Option 2**: Rename `normalized_number` → `number`, remove old `number`
- Pro: Clear that it's the normalized version
- Con: Breaking change everywhere

### Impact if we do this
- **100+ locations** in backend code
- All models (QuickDialEntry, BlockedNumberEntry, CallInfo, etc.)
- All frontend types
- All firmware state parsing
- Requires coordinated release

### Decision
**NOT doing this cleanup now** - too invasive, high risk.
Would need:
1. Full testing plan
2. Data migration strategy
3. Version coordination across firmware/backend/frontend

---

## Summary

✅ **Completed**: Removed `priorityCallers` duplication  
⏸️ **Deferred**: `normalized_number` cleanup (too complex for now)

Both systems now use cleaner, more consistent data structures.
