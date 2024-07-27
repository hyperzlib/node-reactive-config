import { ReactiveConfig } from "../src";
import { TestConfig } from "./type-def";
import Yaml from 'yaml';

async function main() {
    ReactiveConfig.addParser(['yml', 'yaml'], Yaml);

    const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.yaml', {});
    config.on('data', (value) => {
        console.log(value);
    });
}

main().catch(console.error);