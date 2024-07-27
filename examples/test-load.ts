import { ReactiveConfig } from "../src";
import { TestConfig } from "./type-def";

async function main() {
    const config = new ReactiveConfig<Partial<TestConfig>>(__dirname + '/config/test-config.json', {});
    config.on('data', (value) => {
        console.log(value);
    });
}

main().catch(console.error);