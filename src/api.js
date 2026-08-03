// API module for SillyTavern integration
const getContext = () => window.getContext ? window.getContext() : ((typeof window.SillyTavern !== 'undefined' && window.SillyTavern.getContext) ? window.SillyTavern.getContext() : {});
const ST_context = getContext();

export const extension_settings = window.extension_settings || ST_context.extension_settings || {};
export const eventSource = window.eventSource || ST_context.eventSource;
export const event_types = window.event_types || ST_context.event_types;
export const saveSettingsDebounced = window.saveSettingsDebounced || ST_context.saveSettingsDebounced;
export const generateRaw = window.generateRaw || ST_context.generateRaw;
