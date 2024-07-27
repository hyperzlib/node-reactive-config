import { ReactiveConfig } from "../src";
import { TestConfig } from "./type-def";

async function main() {
    const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.json', {}, { autoInit: false });
    config.on('data', (value) => {
        console.log(value);
    });

    await config.initialize();
}

main().catch(console.error);