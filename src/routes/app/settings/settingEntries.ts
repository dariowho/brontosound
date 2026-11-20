/** One read-only setting from bandSettings.json, as the settings page shows it. */
export type SettingEntry = { label: string, key: string } & (
    | { kind: 'text', value: string }
    | { kind: 'toggle', value: boolean }
    | { kind: 'choice', value: string, options: { value: string, name: string }[] }
    | { kind: 'secret', isSet: boolean } // the value itself never leaves the server
);

export type SettingsSection = { title: string, hint?: string, entries: SettingEntry[] };
