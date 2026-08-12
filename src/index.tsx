/*
 * Adds a configurable sidebar entry linking to any external URL. Both the
 * menu text and the URL are editable from Settings > Plugins > link
 * (persisted via ConfigStore, same mechanism as Headlamp's own official
 * change-logo example plugin - headlamp-k8s/headlamp
 * plugins/examples/change-logo/src/settings.tsx). Defaults to "GitHub"
 * linking to the Headlamp project itself.
 *
 * registerSidebarEntry renders a plain external <a target="_blank">
 * whenever url starts with "http" (see headlamp-k8s/headlamp
 * frontend/src/components/Sidebar/ListItemLink.tsx), so no custom
 * route/component is needed for an external link.
 *
 * Like registerAppLogo in change-logo, this reads the config once at
 * plugin bootstrap - settings changes need a page reload to take effect
 * in the sidebar, same limitation change-logo has for the login screen.
 */

import { registerPluginSettings, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import Settings, { DEFAULT_TEXT, DEFAULT_URL, store } from './settings';

const config = store.get();

registerSidebarEntry({
  parent: null,
  name: 'custom-link',
  label: config?.text || DEFAULT_TEXT,
  url: config?.url || DEFAULT_URL,
  icon: 'mdi:link-variant',
  useClusterURL: false,
});

// This name must match package.json's "name" field exactly - Headlamp
// matches a plugin's loaded PluginInfo.name against this to decide whether
// to render the custom settings component at all (see
// PluginSettingsDetailsPure in headlamp-k8s/headlamp's
// frontend/src/components/App/PluginSettings/PluginSettingsDetails.tsx). A
// mismatch here fails silently - the plugin still loads and the sidebar
// entry still works, but Settings > Plugins > link shows no form at all.
registerPluginSettings('@klaushofrichter/link', Settings, false);
