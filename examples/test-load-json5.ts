import { ReactiveConfig } from "../src";
import { TestConfig } from "./type-def";
import JSON5 from 'json5';

async function main() {
    ReactiveConfig.addParser(['json5', 'jsonc'], JSON5);

    const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.json5', {});
    config.on('data', (value) => {
        console.log(value);

        config.destory();
    });
}

main().catch(console.error);