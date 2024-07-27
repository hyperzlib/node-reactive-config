# Node Reactive Config

A lightweight, reactive (hot-reload) configuration library for Node.js.

## Installation

```bash
npm install @hyperzlib/node-reactive-config
```

## Usage

```typescript
import { ReactiveConfig } from '@hyperzlib/node-reactive-config';

const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.json', {});
config.on('data', (value) => {
    console.log(value);

     
});

// ...

config.destroy(); // Stop watching the configuration file
```

## Events

- `data`: Emitted when the configuration file data is changed (loaded or reloaded).
- `load`: Emitted when the configuration file is loaded.
- `change`: Emitted when the configuration file is reloaded.
- `saved`: Emitted when the configuration file is saved.
- `error`: Emitted when an error occurs while loading or reloading the configuration file.

## Examples

### Load JSON5 Configuration File

```typescript
import { ReactiveConfig } from '@hyperzlib/node-reactive-config';
import JSON5 from 'json5';

ReactiveConfig.addParser(['json5', 'jsonc'], JSON5);

const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.json5', {});
config.on('data', (value) => {
    console.log(value);
});

// ...

config.destroy(); // Stop watching the configuration file
```

### Load YAML Configuration File

```typescript
import { ReactiveConfig } from '@hyperzlib/node-reactive-config';
import YAML from 'yaml';

ReactiveConfig.addParser(['yaml', 'yml'], YAML);

const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.yaml', {});
config.on('data', (value) => {
    console.log(value);
});

// ...

config.destroy(); // Stop watching the configuration file
```

### Load Configuration File and convert list to Set, Object to Map

```typescript
import { ReactiveConfig } from '@hyperzlib/node-reactive-config';

const config = new ReactiveConfig<Partial<TestSetMapConfig>>(__dirname + '/config/test-config.json', {});

config.setLoadFilter((data) => {
    if (data.list) {
        data.list = new Set(data.list);
    }

    if (data.str_list) {
        data.str_list = new Set(data.str_list);
    }

    if (data.map) {
        data.map = new Map(Object.entries(data.map));
    }

    return data;
});

config.setSaveFilter((data) => {
    let newData: any = { ...data };

    if (data.list) {
        newData.list = Array.from(data.list);
    }

    if (data.str_list) {
        newData.str_list = Array.from(data.str_list);
    }

    if (data.map) {
        newData.map = Object.fromEntries(data.map);
    }

    return newData;
});

config.on('data', (value) => {
    console.log(value);
});

// ...

config.destroy(); // Stop watching the configuration file
```

### Manually Initialize Configuration (with async/await)

```typescript
import { ReactiveConfig } from '@hyperzlib/node-reactive-config';

const config = new ReactiveConfig<TestConfig | {}>(__dirname + '/config/test-config.json', {}, {
    // Disable auto initialization
    autoInit: false
});

config.on('data', (value) => {
    console.log(value);
});

await config.initialize();
```
