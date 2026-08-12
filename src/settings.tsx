/*
 * Settings component for the "link" plugin, following the same
 * ConfigStore + NameValueTable + auto-save pattern as Headlamp's own
 * official change-logo example plugin
 * (headlamp-k8s/headlamp plugins/examples/change-logo/src/settings.tsx),
 * just with two fields (URL and label text) instead of one.
 */

import { ConfigStore } from '@kinvolk/headlamp-plugin/lib';
import { NameValueTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

export const DEFAULT_URL = 'https://github.com/kubernetes-sigs/headlamp';
export const DEFAULT_TEXT = 'GitHub';

interface PluginConfig {
  url: string;
  text: string;
}

export const store = new ConfigStore<PluginConfig>('link');

function AutoSaveInput({ onSave, defaultValue = '', delay = 1000, helperText = '', ariaLabel = '' }) {
  const [value, setValue] = useState(defaultValue);
  const [timer, setTimer] = useState(null);

  const handleChange = event => {
    const newValue = event.target.value;
    setValue(newValue);

    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => onSave(newValue), delay);
    setTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return (
    <TextField
      fullWidth
      InputProps={{ style: { borderBottom: '1px solid rgba(0, 0, 0, 0.42)' } }}
      InputLabelProps={{
        shrink: true,
        style: { display: 'none' },
      }}
      inputProps={ariaLabel ? { 'aria-label': ariaLabel } : {}}
      helperText={helperText}
      value={value}
      onChange={handleChange}
      variant="standard"
    />
  );
}

export default function Settings() {
  const config = store.get();
  const [currentConfig, setCurrentConfig] = useState(config);

  function handleSaveUrl(value: string) {
    const updatedConfig = { ...store.get(), url: value };
    store.set(updatedConfig);
    setCurrentConfig(store.get());
  }

  function handleSaveText(value: string) {
    const updatedConfig = { ...store.get(), text: value };
    store.set(updatedConfig);
    setCurrentConfig(store.get());
  }

  const settingsRows = [
    {
      name: 'Menu text',
      value: (
        <AutoSaveInput
          defaultValue={currentConfig?.text ?? DEFAULT_TEXT}
          onSave={handleSaveText}
          delay={1000}
          helperText="Text shown for the sidebar entry."
          ariaLabel="Menu text"
        />
      ),
    },
    {
      name: 'Link URL',
      value: (
        <AutoSaveInput
          defaultValue={currentConfig?.url ?? DEFAULT_URL}
          onSave={handleSaveUrl}
          delay={1000}
          helperText="URL the sidebar entry opens (in a new tab)."
          ariaLabel="Link URL"
        />
      ),
    },
  ];

  return (
    <Box width={'80%'} style={{ paddingTop: '8vh' }}>
      <NameValueTable rows={settingsRows} />
      <Typography variant="caption" sx={{ display: 'block', marginTop: 2 }}>
        Changes are saved automatically. Reload the page to see them reflected
        in the sidebar.
      </Typography>
    </Box>
  );
}
